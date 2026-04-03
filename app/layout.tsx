import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Use locally-bundled Geist fonts (no network request required)
const geistSans = localFont({
  src: "../public/geist-sans.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: "../public/geist-mono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "Financial Analyzer — Omar Yaakoubi",
  description:
    "AI-powered annual report analysis. Upload a PDF and let Claude extract key metrics, risks, and insights in seconds.",
  keywords: ["financial analysis", "annual report", "10-K", "AI", "Claude"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* next-themes wraps the entire app so dark/light mode works everywhere */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
