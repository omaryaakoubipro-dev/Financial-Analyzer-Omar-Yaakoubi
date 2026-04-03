"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Reading the executive summary...",
  "Scanning the balance sheet...",
  "Analyzing cash flow statements...",
  "Extracting revenue figures...",
  "Calculating EBITDA and margins...",
  "Reviewing net debt and leverage...",
  "Identifying red flags and risks...",
  "Assessing growth catalysts...",
  "Computing financial health score...",
  "Finalizing the analysis...",
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-8 py-16"
    >
      {/* Animated logo / spinner */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer ring */}
        <svg
          className="absolute inset-0 h-full w-full animate-spin"
          style={{ animationDuration: "2s" }}
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="56.5 169.6"
            className="text-emerald-500"
          />
        </svg>
        {/* Inner ring (slower, opposite direction) */}
        <svg
          className="absolute inset-0 h-[70%] w-[70%] m-auto animate-spin"
          style={{ animationDuration: "3s", animationDirection: "reverse" }}
          viewBox="0 0 56 56"
          fill="none"
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="25 125"
            className="text-emerald-400/50"
          />
        </svg>
        {/* Center dot */}
        <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
      </div>

      {/* Rotating message */}
      <div className="h-7 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="text-base font-medium text-foreground"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {LOADING_MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === messageIndex ? 1.4 : 1,
              opacity: i === messageIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Claude is reading your financial report — this may take 20–40 seconds.
      </p>
    </motion.div>
  );
}
