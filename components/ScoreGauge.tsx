"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number; // 0–10
  rationale: string;
}

function getScoreColor(score: number): string {
  if (score >= 7.5) return "#10b981"; // emerald
  if (score >= 5)   return "#f59e0b"; // amber
  return "#ef4444";                    // red
}

function getScoreLabel(score: number): string {
  if (score >= 8.5) return "Excellent";
  if (score >= 7)   return "Strong";
  if (score >= 5.5) return "Fair";
  if (score >= 4)   return "Weak";
  return "Critical";
}

export default function ScoreGauge({ score, rationale }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(10, score));
  const color   = getScoreColor(clamped);
  const label   = getScoreLabel(clamped);

  // ── Semicircle gauge (left → top → right) ──────────────────────────────
  // ViewBox: 200 × 120  |  centre: (100, 100)  |  radius: 80
  // Arc spans 180° from 180° (left) to 0° (right), going counter-clockwise
  // via the top. We draw it as a standard SVG arc so it's always correct.
  const R  = 80;
  const cx = 100;
  const cy = 100;

  // Full semicircle circumference (half of 2πr)
  const arcLen   = Math.PI * R;              // ≈ 251.3
  const filled   = (clamped / 10) * arcLen;  // how much to fill
  const dashArr  = `${arcLen} ${arcLen}`;    // total dash pattern
  // offset starts at full arcLen (empty) and animates to arcLen - filled
  const dashOffset = arcLen - filled;

  // The semicircle path: M left-point  A rx ry 0 large-arc sweep  right-point
  // large-arc=1 because it's > 180°? No, exactly 180° → large-arc=0 is fine
  // but browsers differ, so we split into two 90° arcs to be safe.
  const pathD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

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

      {/* SVG gauge */}
      <div className="relative mt-3">
        <svg width="160" height="90" viewBox="20 20 160 90" overflow="visible">
          {/* Background track */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-muted/40"
          />
          {/* Filled arc — animated */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={dashArr}
            initial={{ strokeDashoffset: arcLen }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
          />
        </svg>

        {/* Score number — centred below the arc apex */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <div className="flex flex-col items-center leading-none">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.35 }}
              className="text-3xl font-black"
              style={{ color }}
            >
              {clamped.toFixed(1)}
            </motion.span>
            <span className="text-[11px] text-muted-foreground">/ 10</span>
          </div>
        </div>
      </div>

      {/* Label badge */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </motion.span>

      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        {rationale}
      </p>
    </motion.div>
  );
}
