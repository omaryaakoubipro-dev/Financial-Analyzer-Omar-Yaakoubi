"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  Building2,
  GitCompare,
} from "lucide-react";
import { ComparisonResult, Metric } from "@/lib/types";
import ScoreGauge from "./ScoreGauge";

interface ComparisonViewProps {
  result: ComparisonResult;
  onReset: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatMetricValue(metric: Metric): string {
  const { value, unit } = metric;
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string") return value;
  if (unit === "%") return `${(value as number).toFixed(1)}%`;
  const abs = Math.abs(value as number);
  const sign = (value as number) < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}B`;
  if (abs >= 1) return `${sign}${abs.toFixed(0)}M`;
  return `${sign}${abs.toFixed(2)}`;
}

function DeltaChip({ yoyChange }: { yoyChange: number | null | undefined }) {
  if (yoyChange === null || yoyChange === undefined)
    return <span className="text-xs text-muted-foreground">—</span>;
  const isPos = yoyChange > 0.1;
  const isNeg = yoyChange < -0.1;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-semibold ${
        isPos
          ? "text-emerald-600 dark:text-emerald-400"
          : isNeg
          ? "text-red-600 dark:text-red-400"
          : "text-muted-foreground"
      }`}
    >
      {isPos ? (
        <TrendingUp className="h-3 w-3" />
      ) : isNeg ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      {isPos ? "+" : ""}
      {yoyChange.toFixed(1)}%
    </span>
  );
}

export default function ComparisonView({ result, onReset }: ComparisonViewProps) {
  const { reportA, reportB, summary } = result;

  const METRIC_KEYS = [
    "revenue",
    "ebitda",
    "netIncome",
    "netDebt",
    "freeCashFlow",
    "ebitdaMargin",
    "netMargin",
    "revenueGrowth",
  ] as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={sectionVariants}
        className="flex items-center justify-between rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <GitCompare className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Year-over-Year Comparison
            </h2>
            <p className="text-sm text-muted-foreground">
              {reportA.reportYear} vs {reportB.reportYear}
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          New
        </button>
      </motion.div>

      {/* Comparison narrative */}
      <motion.div variants={sectionVariants} className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Comparison Summary
        </h3>
        <p className="leading-relaxed text-foreground">{summary}</p>
      </motion.div>

      {/* Side-by-side company headers */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-4">
        {[reportA, reportB].map((r, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-5 ${
              i === 0
                ? "border-border bg-card"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2
                className={`h-5 w-5 ${
                  i === 0 ? "text-muted-foreground" : "text-emerald-500"
                }`}
              />
              <div>
                <p className="font-semibold text-foreground">{r.companyName}</p>
                <p className="text-xs text-muted-foreground">{r.reportYear}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {r.executiveSummary}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Metrics comparison table */}
      <motion.div variants={sectionVariants} className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Metric</span>
          <span className="text-center">{reportA.reportYear}</span>
          <span className="text-center">{reportB.reportYear}</span>
        </div>
        {METRIC_KEYS.map((key, i) => {
          const mA = reportA.metrics[key];
          const mB = reportB.metrics[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`grid grid-cols-[1fr_1fr_1fr] items-center px-4 py-3.5 text-sm ${
                i % 2 === 0 ? "bg-card" : "bg-muted/20"
              }`}
            >
              <span className="font-medium text-foreground">{mA?.label}</span>
              <span className="text-center">
                <span className="font-semibold text-foreground">
                  {mA ? formatMetricValue(mA) : "N/A"}
                </span>
                {mA?.yoyChange !== undefined && mA?.yoyChange !== null && (
                  <span className="ml-2">
                    <DeltaChip yoyChange={mA.yoyChange} />
                  </span>
                )}
              </span>
              <span className="text-center">
                <span className="font-semibold text-foreground">
                  {mB ? formatMetricValue(mB) : "N/A"}
                </span>
                {mB?.yoyChange !== undefined && mB?.yoyChange !== null && (
                  <span className="ml-2">
                    <DeltaChip yoyChange={mB.yoyChange} />
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Health scores */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-4">
        <ScoreGauge score={reportA.healthScore} rationale={reportA.healthScoreRationale} />
        <ScoreGauge score={reportB.healthScore} rationale={reportB.healthScoreRationale} />
      </motion.div>

      {/* Red flags & positives — side by side */}
      {[
        { icon: AlertTriangle, color: "text-red-500", items: "redFlags", title: "Red Flags" } as const,
        { icon: TrendingUp, color: "text-emerald-500", items: "positives", title: "Positives" } as const,
      ].map(({ icon: Icon, color, items, title }) => (
        <motion.div key={items} variants={sectionVariants} className="grid grid-cols-2 gap-4">
          {[reportA, reportB].map((r, ri) => (
            <div key={ri} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {title} · {r.reportYear}
                </span>
              </div>
              <ul className="space-y-2">
                {r[items].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        items === "redFlags" ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}
