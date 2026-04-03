"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, GitCompare, AlertCircle } from "lucide-react";
import { AnalysisResult, ComparisonResult, AnalysisStatus } from "@/lib/types";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import LoadingState from "@/components/LoadingState";
import AnalysisResults from "@/components/AnalysisResults";
import ComparisonView from "@/components/ComparisonView";

type Mode = "single" | "compare";

export default function Home() {
  const [mode, setMode] = useState<Mode>("single");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<AnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<ComparisonResult | null>(null);

  const isLoading = status !== "idle" && status !== "done" && status !== "error";
  const showResults =
    status === "done" && (singleResult !== null || compareResult !== null);

  const handleAnalyze = async (files: File | [File, File]) => {
    setError(null);
    setStatus("uploading");
    setSingleResult(null);
    setCompareResult(null);

    try {
      setStatus("extracting");
      const formData = new FormData();

      if (Array.isArray(files)) {
        // Comparison mode — two PDFs
        formData.append("fileA", files[0]);
        formData.append("fileB", files[1]);
        setStatus("analyzing");

        const res = await fetch("/api/compare", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "An error occurred during comparison.");
        }
        setCompareResult(json.result);
      } else {
        // Single report mode
        formData.append("file", files);
        setStatus("analyzing");

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "An error occurred during analysis.");
        }
        setSingleResult(json.result);
      }

      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setError(null);
    setSingleResult(null);
    setCompareResult(null);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--fg))" }}>
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* ── Upload / idle / error state ── */}
          {!showResults && !isLoading && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero section */}
              <section
                className="relative overflow-hidden py-20"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                {/* Dot-grid background */}
                <div className="absolute inset-0 bg-dot-grid opacity-40" />
                {/* Radial fade overlay */}
                <div className="pointer-events-none absolute inset-0" style={{
                  background: "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(160 80% 42% / 0.12), transparent)"
                }} />

                <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{
                      border: "1px solid hsl(160 80% 42% / 0.3)",
                      backgroundColor: "hsl(160 80% 42% / 0.1)",
                      color: "hsl(160 65% 38%)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "hsl(160 80% 55%)" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(160 80% 42%)" }} />
                    </span>
                    Powered by Claude AI
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
                    style={{ color: "hsl(var(--fg))" }}
                  >
                    AI Financial
                    <br />
                    <span style={{ color: "hsl(160 80% 42%)" }}>Report Analyzer</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-5 text-lg"
                    style={{ color: "hsl(var(--muted-fg))" }}
                  >
                    Upload an annual report or 10-K in PDF format. Claude extracts
                    key metrics, identifies risks, and scores financial health — in
                    seconds.
                  </motion.p>
                </div>
              </section>

              {/* Upload card */}
              <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                {/* Mode selector */}
                <div
                  className="mb-6 flex items-center gap-2 rounded-xl p-1.5"
                  style={{
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--muted))",
                  }}
                >
                  {[
                    { id: "single" as Mode, icon: FileText, label: "Single Report" },
                    { id: "compare" as Mode, icon: GitCompare, label: "Compare Two Reports" },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                      style={{
                        backgroundColor: mode === id ? "hsl(var(--bg))" : "transparent",
                        color: mode === id ? "hsl(var(--fg))" : "hsl(var(--muted-fg))",
                        boxShadow: mode === id ? "0 1px 3px hsl(0 0% 0% / 0.1)" : "none",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 flex items-start gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-sm"
                      style={{
                        border: "1px solid hsl(0 84% 60% / 0.3)",
                        backgroundColor: "hsl(0 84% 60% / 0.1)",
                        color: "hsl(0 72% 45%)",
                      }}
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <UploadZone
                  mode={mode}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />

                {/* Feature highlights */}
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { emoji: "📊", text: "Key metrics" },
                    { emoji: "⚠️", text: "Risk detection" },
                    { emoji: "📈", text: "YoY trends" },
                    { emoji: "🏥", text: "Health score" },
                  ].map(({ emoji, text }) => (
                    <div
                      key={text}
                      className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 text-center"
                      style={{
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-medium" style={{ color: "hsl(var(--muted-fg))" }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ── Loading state ── */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-xl px-4 py-16 sm:px-6"
            >
              <LoadingState />
            </motion.div>
          )}

          {/* ── Results ── */}
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
            >
              {singleResult && (
                <AnalysisResults result={singleResult} onReset={handleReset} />
              )}
              {compareResult && (
                <ComparisonView result={compareResult} onReset={handleReset} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center text-xs"
        style={{
          borderTop: "1px solid hsl(var(--border))",
          color: "hsl(var(--muted-fg))",
        }}
      >
        Financial Analyzer · Omar Yaakoubi ·{" "}
        <span style={{ color: "hsl(160 80% 42%)" }}>Powered by Claude AI</span>
      </footer>
    </div>
  );
}
