"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, GitCompare, ArrowRight } from "lucide-react";

interface UploadZoneProps {
  mode: "single" | "compare";
  onAnalyze: (files: File | [File, File]) => void;
  isLoading: boolean;
}

interface FileSlot {
  file: File | null;
  dragging: boolean;
}

export default function UploadZone({ mode, onAnalyze, isLoading }: UploadZoneProps) {
  const [slotA, setSlotA] = useState<FileSlot>({ file: null, dragging: false });
  const [slotB, setSlotB] = useState<FileSlot>({ file: null, dragging: false });
  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);

  const canSubmit =
    mode === "single" ? !!slotA.file : !!slotA.file && !!slotB.file;

  const handleDrop = useCallback(
    (e: React.DragEvent, slot: "A" | "B") => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type === "application/pdf") {
        slot === "A"
          ? setSlotA({ file, dragging: false })
          : setSlotB({ file, dragging: false });
      } else {
        slot === "A"
          ? setSlotA((s) => ({ ...s, dragging: false }))
          : setSlotB((s) => ({ ...s, dragging: false }));
      }
    },
    []
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: "A" | "B"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      slot === "A"
        ? setSlotA({ file, dragging: false })
        : setSlotB({ file, dragging: false });
    }
  };

  const handleSubmit = () => {
    if (mode === "single" && slotA.file) {
      onAnalyze(slotA.file);
    } else if (mode === "compare" && slotA.file && slotB.file) {
      onAnalyze([slotA.file, slotB.file]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const DropArea = ({
    slot,
    label,
    year,
  }: {
    slot: "A" | "B";
    label: string;
    year: string;
  }) => {
    const state = slot === "A" ? slotA : slotB;
    const inputRef = slot === "A" ? inputRefA : inputRefB;
    const setSlot = slot === "A" ? setSlotA : setSlotB;

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSlot((s) => ({ ...s, dragging: true }));
        }}
        onDragLeave={() => setSlot((s) => ({ ...s, dragging: false }))}
        onDrop={(e) => handleDrop(e, slot)}
        onClick={() => !state.file && inputRef.current?.click()}
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          state.dragging
            ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
            : state.file
            ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
            : "border-border hover:border-emerald-500/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e, slot)}
        />

        <AnimatePresence mode="wait">
          {state.file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
                <FileText className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
                  {state.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(state.file.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSlot({ file: null, dragging: false });
                }}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              {mode === "compare" && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {label} — {year}
                </span>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop PDF here
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full">
      {mode === "single" ? (
        <DropArea slot="A" label="Report" year="Any year" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <DropArea slot="A" label="Report A" year="Year N-1 (older)" />
          <div className="flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
              <GitCompare className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <DropArea slot="B" label="Report B" year="Year N (newer)" />
        </div>
      )}

      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit || isLoading}
        whileHover={canSubmit && !isLoading ? { scale: 1.02 } : {}}
        whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-600 disabled:shadow-none"
      >
        {mode === "compare" ? (
          <>
            <GitCompare className="h-4 w-4" />
            Compare Reports
          </>
        ) : (
          <>
            Analyze Report
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>
    </div>
  );
}
