"use client";

import { BarChart2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + App name */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <BarChart2 className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="text-base font-bold tracking-tight text-foreground">
              Financial Analyzer
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-base font-medium text-emerald-500">
              Omar Yaakoubi
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:inline-block">
            Powered by Claude AI
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
