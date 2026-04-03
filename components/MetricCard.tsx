"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Metric } from "@/lib/types";

interface MetricCardProps {
  metric: Metric;
  index: number;
  /** When true, a negative yoyChange for net debt is shown as positive (deleveraging = good) */
  invertYoy?: boolean;
}

export default function MetricCard({ metric, index, invertYoy = false }: MetricCardProps) {
  const { label, value, unit, yoyChange, yoyLabel } = metric;

  const formatValue = (v: number | string | null, u?: string): string => {
    if (v === null || v === undefined) return "N/A";
    if (typeof v === "string") return v;

    // Detect if it's a percentage metric by unit
    if (u === "%") return `${v.toFixed(1)}%`;

    // Format large numbers
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}B`;
    if (abs >= 1) return `${sign}${abs.toFixed(0)}M`;
    return `${sign}${abs.toFixed(2)}`;
  };

  // Determine visual direction (accounting for inversion)
  const effectiveChange =
    yoyChange !== null && yoyChange !== undefined
      ? invertYoy
        ? -yoyChange
        : yoyChange
      : null;

  const isPositive = effectiveChange !== null && effectiveChange > 0.1;
  const isNegative = effectiveChange !== null && effectiveChange < -0.1;
  const isNeutral = !isPositive && !isNegative;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Subtle accent top bar */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${
          isPositive
            ? "bg-emerald-500"
            : isNegative
            ? "bg-red-500"
            : "bg-muted"
        }`}
      />

      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {formatValue(value, unit)}
          </p>
          {unit && unit !== "%" && value !== null && (
            <p className="mt-1 text-[11px] text-muted-foreground">{unit}</p>
          )}
        </div>

        {/* YoY badge */}
        {yoyChange !== null && yoyChange !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.07 + 0.2 }}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isNegative
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : isNegative ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {isNeutral ? "—" : `${yoyChange > 0 ? "+" : ""}${yoyChange.toFixed(1)}%`}
          </motion.div>
        )}
      </div>

      {yoyLabel && (
        <p className="mt-2 text-[11px] text-muted-foreground">{yoyLabel}</p>
      )}
    </motion.div>
  );
}
