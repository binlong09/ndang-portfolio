// ---------------------------------------------------------------------------
// Project data, extracted verbatim from the original index.html write-ups.
//
// `codeUrl` / `liveUrl` are intentionally left as TODO placeholders for you to
// fill in with the real repository / deployment links.
//
// Prose bodies may contain light inline HTML (<em>) to preserve the exact
// emphasis from the source page; they are rendered with the project templates.
// ---------------------------------------------------------------------------

export type SpecField = {
  /** mono label shown in the spec strip, e.g. "stack" */
  k: string;
  /** value */
  v: string;
};

export type ProseBlock = {
  /** uppercase mono label, e.g. "Problem" / "What it does" / "Outcome" */
  label: string;
  /** body text; may contain light inline HTML such as <em> */
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  spec: SpecField[];
  prose: ProseBlock[];
  /** TODO: real source-code URL */
  codeUrl: string;
  /** TODO: real live/deployment URL */
  liveUrl: string;
  /**
   * When true this project has a bespoke page at /work/<slug> that overrides
   * the generic template (e.g. stock-vetter's interactive demo).
   */
  bespoke?: boolean;
  /**
   * When false the project is hidden from the landing page. Used for the
   * placeholder `homelab` entry until its real content is written.
   */
  listed?: boolean;
  /** When true, content is placeholder and needs to be written. */
  placeholder?: boolean;
  /**
   * Marks the single piece of work to lead with. Renders a small mono badge on
   * the landing-page record and on the project page header.
   */
  flagship?: boolean;
};

export const projects: Project[] = [
  {
    slug: "rok-pipeline",
    title: "kvk.gg",
    tagline:
      "A full data pipeline: reverse-engineered game-client injection, a multi-machine harvesting fleet, and a stats site that serves precomputed answers in tens of milliseconds.",
    listed: true,
    flagship: true,
    codeUrl: "https://github.com/binlong09/rok-data-fetcher",
    liveUrl: "https://kvk-web.fly.dev/",
    spec: [
      {
        k: "stack",
        v: "Python · Win32 thread hijack · Lua C API · ClickHouse · Next.js · Fly.io · Cloudflare · Tailscale",
      },
      { k: "scope", v: "solo build, two repos, end to end" },
      { k: "status", v: "live; no longer actively developed" },
    ],
    prose: [
      {
        label: "Problem",
        body:
          "The numbers that actually decide a Rise of Kingdoms KvK — a governor's <em>lifetime</em> total kill points, the T1–T5 kill breakdown, lifetime deaths and healing — exist in no public API. Lilith's official endpoint returns only timeframe stats, and it 403s for any kingdom you don't have a character in. Those totals live in exactly one place: the memory of a running game client.",
      },
      {
        label: "What it does",
        body:
          "Two halves. The fetcher runs a Lua chunk inside the live PC client by briefly hijacking an engine thread, calls the game's own by-ID profile fetch, and hooks the reply handler so the profile card never opens — which is what makes hundreds of back-to-back fetches crash-free instead of fatal. A coordinator hands kingdoms to a fleet of sandboxed clients across several machines over Tailscale, each one self-sizing its scan to the kingdom. The web half ingests those scans into ClickHouse, precomputes every aggregate in refreshable materialized views, and serves them through ISR and a Cloudflare edge cache.",
      },
      {
        label: "What I learned",
        body:
          "Most of the project was being wrong in public. <em>PROGRESS.md</em> runs 27 sections across a dozen sessions, including a section that declares arbitrary-kingdom fetch solved and the next one that retracts it with proof. The wins came from reading, not guessing: passive disassembly found the crash root cause that a debugger couldn't (the anti-tamper layer fights debuggers but ignores <code>ReadProcessMemory</code>), and the fix that finally shipped was noticing <em>why</em> the client crashed on a second fetch rather than out-engineering it.",
      },
    ],
  },
  {
    slug: "stock-vetter",
    title: "stock-vetter",
    tagline: "An LLM-driven research engine for fundamental stock analysis.",
    bespoke: true,
    listed: true,
    codeUrl: "TODO", // TODO: add real code URL
    liveUrl: "TODO", // TODO: add real live URL
    spec: [
      { k: "stack", v: "TypeScript · pnpm monorepo · Next.js · Turso · Vercel" },
      { k: "scope", v: "solo design & build" },
      { k: "status", v: "live" },
    ],
    prose: [
      {
        label: "Problem",
        body:
          "Doing real fundamental analysis on a company means reading hundreds of pages of SEC filings and earnings transcripts. This is slow work that's easy to do inconsistently. I wanted a tool that could perform a rigorous, repeatable first pass: pull the primary sources, reason about them the way a value investor actually does, and surface only what deserves a human's attention.",
      },
      {
        label: "What it does",
        body:
          "For any ticker it fetches the company's SEC filings and analyst-call transcripts, runs a structured multi-pass LLM analysis scoring the business across six dimensions, cross-checks the numbers with a reverse-DCF to expose the growth the market is implying, and produces a weighted verdict with its reasoning shown rather than hidden.",
      },
      {
        label: "What I learned",
        body:
          "The hardest failures lived in the data, not the model. Careful review of outputs surfaced a fiscal-year bug that corrupted results for companies that don't report on a December calendar, and a parser quietly feeding the wrong 10-Q sections into the model. Fixing those, plus prompt caching and adaptive sampling that cut cost per ticker by roughly 40%, drove home that in LLM pipelines correctness lives in the source-data plumbing.",
      },
    ],
  },
  {
    slug: "signal-tracker",
    title: "signal-tracker",
    tagline: "Thesis-based change detection for an investment portfolio.",
    listed: true,
    codeUrl: "TODO", // TODO: add real code URL
    liveUrl: "TODO", // TODO: add real live URL
    spec: [
      { k: "stack", v: "shared core · GitHub Actions cron · Turso · Resend · Vercel" },
      { k: "scope", v: "solo build" },
      { k: "status", v: "live, daily" },
    ],
    prose: [
      {
        label: "Problem",
        body:
          "Most investing tools tell you what happened. Very few tell you when something has changed relative to <em>why you invested in the first place</em>. I wanted to write down my actual theses for each holding and be alerted only when new information genuinely tests them.",
      },
      {
        label: "What it does",
        body:
          "I encode a thesis per position: the kind of claim that, if it broke, would change my mind. A daily job watches for new filings, transcripts, and signals, uses an LLM to judge whether anything materially moves a thesis, and sends a concise email digest. A remote trigger lets me kick off a run from my phone.",
      },
      {
        label: "Outcome",
        body:
          "It converts a vague intention to \"keep up with my positions\" into a specific, low-noise feed of thesis-relevant change. It also shares its core infrastructure with stock-vetter, so the two compound.",
      },
    ],
  },
  {
    slug: "coding-agent",
    title: "self-hosted coding agent",
    tagline:
      "A single-file terminal coding agent on a local model — built to make the harness self-describing enough that the model can recover from its own mistakes.",
    listed: true,
    codeUrl: "https://github.com/binlong09/qwen-code",
    liveUrl: "TODO", // TODO: add real live URL
    spec: [
      { k: "stack", v: "Python · Ollama · qwen3-coder:30b · DeepSeek (fallback) · ripgrep · OpenAI client · Tailscale" },
      { k: "scope", v: "solo build, single file (agent.py)" },
      { k: "status", v: "v1.2" },
    ],
    prose: [
      {
        label: "Problem",
        body:
          "I wanted to understand how agentic coding tools really work under the hood, and to run one entirely on my own hardware against open models — local-first, with no per-token cost in the common case and only an optional hosted fallback for when the local box is unreachable.",
      },
      {
        label: "What it does",
        body:
          "A single-file agent (agent.py) drives a local Qwen model through a six-tool loop: read a file, create a file, edit with fenced search/replace blocks, search the tree with ripgrep, run bash (the model itself flags risky commands for approval), and signal task_complete. It streams the model's output and feeds tool results back, ending only when the agent calls task_complete with file-path evidence the harness verifies — a self-describing harness that states the working directory and tool invariants and returns actionable errors, so the model can recover from its own mistakes.",
      },
      {
        label: "Outcome",
        body:
          "A genuinely usable, local-first coding agent in a single file — and a much sharper feel for tool-use design, harness legibility, evidence-gated termination, and where agentic systems break.",
      },
    ],
  },
  {
    slug: "sc2-theorycrafter",
    title: "StarCraft II theorycrafter",
    tagline: "A factually-grounded strategy tool that refuses to hallucinate.",
    listed: true,
    codeUrl: "TODO", // TODO: add real code URL
    liveUrl: "TODO", // TODO: add real live URL
    spec: [
      { k: "stack", v: "Python · SQLite · LLM reasoning layer · replay parsing · uv" },
      { k: "scope", v: "solo build" },
      { k: "status", v: "in progress" },
    ],
    prose: [
      {
        label: "Problem",
        body:
          "LLMs reason well but are unreliable on precise facts. For a game where unit costs and timings have to be exact, a model that confidently invents numbers is worse than useless.",
      },
      {
        label: "What it does",
        body:
          "It answers build-order and strategy questions for a specific patch by grounding every factual claim in a database and using the model only for the reasoning on top. It's a two-layer design where an SQLite fact store (populated from a replay parser) holds the truth and the LLM is never asked to recall it.",
      },
      {
        label: "Outcome",
        body:
          "A concrete pattern for building grounded LLM tools. It's the same idea that powers my investing pipeline, applied here to a game I know at the top level.",
      },
    ],
  },
  // -------------------------------------------------------------------------
  // PLACEHOLDER: `homelab` did not exist in the original index.html. This entry
  // is a scaffold so the /work/homelab route works; fill in real content and
  // set `listed: true` to surface it on the landing page.
  // -------------------------------------------------------------------------
  {
    slug: "homelab",
    title: "homelab",
    tagline: "TODO: describe your homelab in one line.",
    listed: false,
    placeholder: true,
    codeUrl: "TODO", // TODO: add real code URL
    liveUrl: "TODO", // TODO: add real live URL
    spec: [
      { k: "stack", v: "TODO: hardware, OS, services" },
      { k: "scope", v: "TODO" },
      { k: "status", v: "TODO" },
    ],
    prose: [
      {
        label: "Problem",
        body: "TODO: what need does the homelab serve?",
      },
      {
        label: "What it does",
        body: "TODO: what runs on it and how it's set up.",
      },
      {
        label: "Outcome",
        body: "TODO: what you got out of building it.",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Projects shown on the landing page (in order). */
export const listedProjects = projects.filter((p) => p.listed);

/** Slugs handled by the generic /work/[slug] template (excludes bespoke pages). */
export const genericSlugs = projects
  .filter((p) => !p.bespoke)
  .map((p) => p.slug);
