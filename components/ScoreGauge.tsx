"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number; // 0–10
  rationale: string;
}

function getScoreColor(score: number): string {
  if (score >= 7.5) return "#10b981"; // emerald
  if (score >= 5) return "#f59e0b";  // amber
  return "#ef4444";                   // red
}

function getScoreLabel(score: number): string {
  if (score >= 8.5) return "Excellent";
  if (score >= 7) return "Strong";
  if (score >= 5.5) return "Fair";
  if (score >= 4) return "Weak";
  return "Critical";
}

export default function ScoreGauge({ score, rationale }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const color = getScoreColor(clampedScore);
  const label = getScoreLabel(clampedScore);

  // SVG arc parameters
  const radius = 52;
  const cx = 70;
  const cy = 70;
  const startAngle = -210; // degrees from 3-o'clock (right)
  const sweepDeg = 240;    // total arc span

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, sweep: number) => {
    const s = toRad(start);
    const e = toRad(start + sweep);
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const totalCircumference = (2 * Math.PI * radius * sweepDeg) / 360;
  const filledLength = (clampedScore / 10) * totalCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Financial Health Score
      </p>

      <div className="relative mt-4">
        <svg width="140" height="100" viewBox="0 0 140 100">
          {/* Background track */}
          <path
            d={arcPath(startAngle, sweepDeg)}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-muted/40"
          />
          {/* Filled arc */}
          <motion.path
            d={arcPath(startAngle, sweepDeg)}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${totalCircumference}`}
            initial={{ strokeDashoffset: totalCircumference }}
            animate={{ strokeDashoffset: totalCircumference - filledLength }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>

        {/* Score number overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-4xl font-black leading-none tracking-tight"
            style={{ color }}
          >
            {clampedScore.toFixed(1)}
          </motion.span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            / 10
          </span>
        </div>
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-1 rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color,
        }}
      >
        {label}
      </motion.span>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        {rationale}
      </p>
    </motion.div>
  );
}
