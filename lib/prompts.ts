// Claude prompt templates for financial analysis

/**
 * Builds the system prompt instructing Claude to act as a financial analyst.
 */
export const SYSTEM_PROMPT = `You are an expert financial analyst specializing in reading and interpreting annual reports, 10-K filings, and other corporate financial documents. You extract key financial data, identify trends, and provide clear, actionable insights.

When given a financial document, you must respond with a single, valid JSON object — no markdown fences, no explanatory text outside the JSON.`;

/**
 * Builds the user prompt for single-report analysis.
 * @param text - Extracted text from the PDF
 */
export function buildAnalysisPrompt(text: string): string {
  // Truncate to ~80k chars to stay within token limits while preserving most content
  const truncated = text.length > 80000 ? text.slice(0, 80000) + "\n\n[Document truncated for length]" : text;

  return `Analyze the following financial report and return a JSON object with exactly this structure. For any metric you cannot find, use null. All monetary values should be numbers (in millions USD or the original currency, specify the unit). Percentages should be numbers (e.g. 12.5 for 12.5%).

REQUIRED JSON STRUCTURE:
{
  "companyName": "string — full company name",
  "reportYear": "string — fiscal year of the report (e.g. FY2023)",
  "executiveSummary": "string — 3 to 5 sentences summarising the company's financial performance",
  "metrics": {
    "revenue": {
      "label": "Revenue",
      "value": number or null,
      "unit": "string — e.g. USD millions",
      "yoyChange": number or null,
      "yoyLabel": "string — e.g. vs FY2022"
    },
    "ebitda": {
      "label": "EBITDA",
      "value": number or null,
      "unit": "string",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "netIncome": {
      "label": "Net Income",
      "value": number or null,
      "unit": "string",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "netDebt": {
      "label": "Net Debt",
      "value": number or null,
      "unit": "string",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "freeCashFlow": {
      "label": "Free Cash Flow",
      "value": number or null,
      "unit": "string",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "ebitdaMargin": {
      "label": "EBITDA Margin",
      "value": number or null,
      "unit": "%",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "netMargin": {
      "label": "Net Margin",
      "value": number or null,
      "unit": "%",
      "yoyChange": number or null,
      "yoyLabel": "string"
    },
    "revenueGrowth": {
      "label": "Revenue Growth",
      "value": number or null,
      "unit": "%",
      "yoyChange": null,
      "yoyLabel": null
    }
  },
  "redFlags": ["string — each red flag or risk on a new item, 3 to 7 items"],
  "positives": ["string — each positive point or catalyst, 3 to 7 items"],
  "healthScore": number between 0 and 10,
  "healthScoreRationale": "string — 1 to 2 sentences explaining the score"
}

DOCUMENT TEXT:
${truncated}`;
}

/**
 * Builds the user prompt for two-report comparison.
 */
export function buildComparisonPrompt(textA: string, textB: string): string {
  const truncA = textA.length > 40000 ? textA.slice(0, 40000) + "\n[truncated]" : textA;
  const truncB = textB.length > 40000 ? textB.slice(0, 40000) + "\n[truncated]" : textB;

  return `You are comparing two annual reports from the same company (or two different companies). Analyze both and return a single JSON object with this structure:

{
  "reportA": { /* same structure as single-report analysis — this is the OLDER or first report */ },
  "reportB": { /* same structure as single-report analysis — this is the NEWER or second report */ },
  "summary": "string — 3 to 5 sentences comparing the two reports, highlighting the most important changes, improvements, or deteriorations"
}

Each reportA and reportB must follow the same schema as a single-report analysis (companyName, reportYear, executiveSummary, metrics, redFlags, positives, healthScore, healthScoreRationale).

REPORT A (first / older):
${truncA}

---

REPORT B (second / newer):
${truncB}`;
}
