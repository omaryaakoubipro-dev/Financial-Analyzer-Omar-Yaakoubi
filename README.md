# Financial Analyzer — Omar Yaakoubi

> AI-powered annual report & 10-K analysis — powered by **Claude claude-sonnet-4-20250514**

Upload a PDF annual report, and the app automatically extracts key financial metrics, detects risks, scores financial health, and lets you compare two reports side by side.

---

## Features

| Feature | Description |
|---|---|
| **PDF Upload** | Drag & drop or click-to-browse, up to 50 MB |
| **AI Extraction** | Claude reads the full report and extracts structured data |
| **Executive Summary** | 3–5 sentence AI-generated summary |
| **Key Metrics** | Revenue, EBITDA, Net Income, Net Debt, FCF, margins |
| **YoY Evolution** | Year-over-year % change with green/red trend arrows |
| **Red Flags** | 3–7 AI-identified risks and concerns |
| **Catalysts** | 3–7 positive points and growth drivers |
| **Health Score** | Financial health score out of 10 with gauge visualization |
| **Comparison Mode** | Upload 2 reports for a side-by-side YoY comparison |
| **Dark / Light Mode** | System-default, toggleable in the navbar |
| **Animated Loading** | Rotating messages while Claude analyzes ("Reading balance sheet...") |
| **Mobile Responsive** | Works on all screen sizes |

---

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Server Actions, API Routes
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[Framer Motion](https://www.framer-motion.com/)** — Smooth animations
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** — Server-side PDF text extraction
- **[Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk)** — Claude API client
- **[next-themes](https://www.npmjs.com/package/next-themes)** — Dark/light mode
- **[lucide-react](https://lucide.dev/)** — Icon set

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider
│   ├── page.tsx                # Main page (upload + results)
│   ├── globals.css             # CSS variables (light/dark), Tailwind imports
│   └── api/
│       ├── analyze/route.ts    # POST /api/analyze — single PDF analysis
│       └── compare/route.ts    # POST /api/compare — two-PDF comparison
├── components/
│   ├── Header.tsx              # Sticky navbar: "Financial Analyzer — Omar Yaakoubi"
│   ├── ThemeToggle.tsx         # Dark/light mode button
│   ├── UploadZone.tsx          # Drag & drop upload area (single + compare modes)
│   ├── LoadingState.tsx        # Animated loading with rotating messages
│   ├── AnalysisResults.tsx     # Full single-report results dashboard
│   ├── MetricCard.tsx          # Individual KPI card with YoY badge
│   ├── ScoreGauge.tsx          # SVG arc gauge for health score
│   └── ComparisonView.tsx      # Side-by-side comparison layout
├── lib/
│   ├── types.ts                # TypeScript interfaces (AnalysisResult, etc.)
│   └── prompts.ts              # Claude prompt builders
├── public/
│   ├── geist-sans.woff2        # Bundled Geist Sans font
│   └── geist-mono.woff2        # Bundled Geist Mono font
├── .env.example                # Environment variable template
├── empty-module.ts             # Stub for optional pdf-parse canvas dep
└── next.config.ts              # Next.js config (Turbopack, body size limit)
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/omaryaakoubipro-dev/financial-analyzer-omar-yaakoubi.git
cd financial-analyzer-omar-yaakoubi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your API key at [console.anthropic.com](https://console.anthropic.com/).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

### Single Report Analysis

1. User uploads a PDF via drag & drop or file picker
2. The PDF is sent to `POST /api/analyze` as `multipart/form-data`
3. Server extracts text using `pdf-parse` (server-side only, no browser dependency)
4. Extracted text is sent to Claude with a structured JSON prompt
5. Claude returns a JSON object with all metrics, flags, positives, and score
6. The client renders the animated results dashboard

### Comparison Mode

1. User uploads **two** PDFs (Report A = older, Report B = newer)
2. Both are sent to `POST /api/compare`
3. Both PDFs are extracted in parallel
4. Claude analyzes both and returns a unified comparison JSON
5. The client renders a side-by-side view with a comparison narrative

### Claude Prompt Design

The prompts are in `lib/prompts.ts`. They instruct Claude to:
- Act as an expert financial analyst
- Return only a valid JSON object (no markdown fences)
- Use `null` for any metric it cannot find
- Express monetary values in millions and percentages as plain numbers

---

## Deployment on Vercel

This app is Vercel-ready.

### Deploy steps

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Add the environment variable:
   - `ANTHROPIC_API_KEY` = your key
4. Deploy

### Recommended Vercel settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Node.js Version | 20.x |
| Function Timeout | 60s (single) / 120s (compare) — set in route files |
| Max Body Size | 50 MB — set via `serverActions.bodySizeLimit` in `next.config.ts` |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. **Server-side only** — never exposed to the client. |

---

## Notes

- **PDF must be text-based**: Scanned image PDFs will fail extraction. The app returns a clear error message in this case.
- **Token limits**: The extracted text is truncated to ~80 000 characters (single) / 40 000 per doc (comparison) to stay within Claude's context window while preserving the financial sections.
- **Model**: `claude-sonnet-4-20250514` — fast, accurate, cost-effective for financial document analysis.

---

## License

MIT — built by Omar Yaakoubi.
