import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildComparisonPrompt } from "@/lib/prompts";
import { ComparisonResult } from "@/lib/types";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use the internal module directly — pdf-parse's main index.js tries to
  // read a test file on require() which crashes in Vercel's serverless env.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const fileA = formData.get("fileA") as File | null;
    const fileB = formData.get("fileB") as File | null;

    if (!fileA || !fileB) {
      return NextResponse.json(
        { error: "Two PDF files are required for comparison" },
        { status: 400 }
      );
    }

    if (fileA.type !== "application/pdf" || fileB.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Extract text from both PDFs in parallel
    const [bufferA, bufferB] = await Promise.all([
      fileA.arrayBuffer().then((ab) => Buffer.from(ab)),
      fileB.arrayBuffer().then((ab) => Buffer.from(ab)),
    ]);

    let textA: string, textB: string;
    try {
      [textA, textB] = await Promise.all([
        extractTextFromPDF(bufferA),
        extractTextFromPDF(bufferB),
      ]);
    } catch {
      return NextResponse.json(
        { error: "Failed to extract text from one or both PDFs." },
        { status: 422 }
      );
    }

    if (!textA.trim() || !textB.trim()) {
      return NextResponse.json(
        { error: "One or both PDFs contain no extractable text." },
        { status: 422 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: ANTHROPIC_API_KEY is not set." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildComparisonPrompt(textA, textB),
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let comparisonResult: ComparisonResult;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      comparisonResult = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude comparison response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse the AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: comparisonResult });
  } catch (error) {
    console.error("Compare API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Allow enough time for two-PDF comparison (Claude processes both documents)
export const maxDuration = 120; // seconds
