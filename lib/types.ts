// Core data types for the Financial Analyzer application

export interface Metric {
  label: string;
  value: string | null;
  unit?: string;
  yoyChange?: number | null; // percentage change year-over-year (e.g. 12.5 = +12.5%)
  yoyLabel?: string; // e.g. "vs FY2022"
}

export interface AnalysisResult {
  companyName: string;
  reportYear: string;
  executiveSummary: string;
  metrics: {
    revenue: Metric;
    ebitda: Metric;
    netIncome: Metric;
    netDebt: Metric;
    freeCashFlow: Metric;
    ebitdaMargin: Metric;
    netMargin: Metric;
    revenueGrowth: Metric;
  };
  redFlags: string[];
  positives: string[];
  healthScore: number; // 0–10
  healthScoreRationale: string;
}

export interface ComparisonResult {
  reportA: AnalysisResult; // older / year N-1
  reportB: AnalysisResult; // newer / year N
  summary: string; // AI-generated comparison narrative
}

export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "done"
  | "error";

export interface UploadedFile {
  file: File;
  label: "A" | "B"; // for comparison mode
}
