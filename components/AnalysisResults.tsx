"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Building2, RefreshCw } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import MetricCard from "./MetricCard";
import ScoreGauge from "./ScoreGauge";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const metricEntries = Object.entries(result.metrics) as [
    string,
    (typeof result.metrics)[keyof typeof result.metrics]
  ][];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-8"
    >
      {/* Header banner */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <Building2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {result.companyName}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {result.reportYear} · Annual Report Analysis
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 self-start rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          New Analysis
        </button>
      </motion.div>

      {/* Executive summary */}
      <motion.div variants={sectionVariants} className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Executive Summary
        </h3>
        <p className="leading-relaxed text-foreground">{result.executiveSummary}</p>
      </motion.div>

      {/* Key metrics grid */}
      <motion.div variants={sectionVariants}>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Financial Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {metricEntries.map(([key, metric], i) => (
            <MetricCard
              key={key}
              metric={metric}
              index={i}
              invertYoy={key === "netDebt"}
            />
          ))}
        </div>
      </motion.div>

      {/* Score + Red flags + Positives */}
      <motion.div
        variants={sectionVariants}
        className="grid gap-4 lg:grid-cols-[220px_1fr_1fr]"
      >
        {/* Health score gauge */}
        <ScoreGauge
          score={result.healthScore}
          rationale={result.healthScoreRationale}
        />

        {/* Red flags */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Red Flags & Risks
            </h3>
          </div>
          <ul className="space-y-2.5">
            {result.redFlags.map((flag, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {flag}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Positives */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Positives & Catalysts
            </h3>
          </div>
          <ul className="space-y-2.5">
            {result.positives.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
