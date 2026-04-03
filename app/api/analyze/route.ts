import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/prompts";
import { AnalysisResult } from "@/lib/types";

// Use the internal pdf-parse module directly to avoid a known issue where
// the top-level require() tries to load test fixture files that don't exist
// in Vercel's serverless environment, causing a crash before any PDF is read.
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Convert the uploaded File to a Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    let pdfText: string;
    try {
      pdfText = await extractTextFromPDF(buffer);
    } catch {
      return NextResponse.json(
        { error: "Failed to extract text from the PDF. Please ensure it is a text-based PDF, not a scanned image." },
        { status: 422 }
      );
    }

    if (!pdfText || pdfText.trim().length < 100) {
      return NextResponse.json(
        { error: "The PDF appears to contain no extractable text (it may be a scanned image). Please use a text-based PDF." },
        { status: 422 }
      );
    }

    // Send to Claude for analysis
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
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildAnalysisPrompt(pdfText),
        },
      ],
    });

    // Extract the JSON response from Claude
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let analysisResult: AnalysisResult;
    try {
      // Strip any accidental markdown fences Claude might include
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      analysisResult = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse the AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: analysisResult });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Increase the segment body size limit for large PDF uploads
export const maxDuration = 60; // seconds — gives Claude enough time to analyze
