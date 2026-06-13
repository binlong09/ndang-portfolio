// ---------------------------------------------------------------------------
// Per-project technical deep-dives, rendered beneath the standard project-page
// header by components/ProjectDeepDive.tsx. Content is authored verbatim.
//
// Inline `code` spans (backticks) and *emphasis* (asterisks) in the prose are
// converted to <code>/<em> at render time. ASCII diagrams are shown as-is.
//
// Placeholders to fill: codeUrl (REPO_URL_<project>), live.url (LIVE_URL),
// and each assets[].token (ASSET_<project>) — drop a real file into the
// matching assets[].src later. Each project takes one OR many captures.
// ---------------------------------------------------------------------------

export type Decision = { title: string; body: string };

export type Asset = {
  token: string; // ASSET_<project> placeholder, shown in the empty state
  src?: string; // when absent, an empty state is rendered for this image
  /**
   * When set, the asset is a video rendered as an autoplaying, muted, looped
   * <video> (with `src` used as a poster/fallback image if it is itself an
   * image). Use for screen recordings.
   */
  video?: string;
  alt: string;
  caption: string; // shown small, directly under the image
};

export type DeepDive = {
  architecture: {
    intro: string[]; // paragraphs above the diagram
    diagram: string; // ASCII component diagram (mono block)
    detail: string[]; // paragraphs below the diagram
  };
  decisions: Decision[]; // 2–4 tradeoff + why subsections
  lessons: string[]; // "what broke / what I learned"
  codeUrl: string; // REPO_URL_<project> placeholder
  live?: { url: string; label: string }; // LIVE_URL placeholder, where noted
  scopeNote?: string; // optional short, honest "what's out of scope" line
  assets: Asset[]; // one or more captioned images (1 works; add more to taste)
};

export const deepDives: Record<string, DeepDive> = {
  "signal-tracker": {
    architecture: {
      intro: [
        "signal-tracker is a thesis-change detector that runs unattended on a daily schedule. It shares the `packages/core` infrastructure with stock-vetter — the same SEC-filing fetchers, transcript ingestion, and Turso persistence — and adds a thesis layer and a change-detection pass on top.",
      ],
      diagram: `  [GitHub Actions cron — daily]
            │
            ▼
  [packages/core] ── fetch latest filings / transcripts ──► [Turso]
            │
            ▼
  [thesis engine] ── per-position thesis + new evidence ──► [LLM judge]
            │                                                    │
            │              materially moves a thesis? ───────────┘
            ▼
  [digest builder] ──► [Resend email] + [web viewer]
            ▲
  [remote trigger] (phone) ──► on-demand run`,
      detail: [
        "Each holding has a written thesis — a falsifiable claim that, if broken, would change the decision. The daily job diffs the latest primary-source material against each thesis and asks an LLM to classify whether anything materially confirms or challenges it, then emits a low-noise digest rather than a raw news feed.",
      ],
    },
    decisions: [
      {
        title: "Shared core over a separate codebase",
        body: "reusing stock-vetter's `packages/core` meant filing-fetch, parsing, and persistence were already battle-tested, so signal-tracker is mostly the thesis + diff logic. The two tools compound instead of duplicating.",
      },
      {
        title: "Thesis as falsifiable text, not a rule engine",
        body: "encoding a thesis as a plain-language claim the LLM evaluates (vs hardcoded numeric triggers) captures qualitative shifts — a changed risk factor, a softened guidance tone — that threshold rules miss.",
      },
      {
        title: "Change-detection, not summarization",
        body: "the job's job is to stay silent. It only surfaces material thesis movement, which is what makes a daily email survivable long-term.",
      },
      {
        title: "Cron + remote trigger",
        body: "GitHub Actions runs the daily pass for free and verifiably; a remote trigger lets me force a run from my phone when news breaks.",
      },
    ],
    lessons: [
      "The hard part wasn't detection, it was noise. Early versions flagged too much — every minor filing change read as \"movement.\" Tightening the judge toward materiality (and giving it the thesis as explicit context) is what turned it from a firehose into something I actually read. Sharing infrastructure with stock-vetter also meant its data-plumbing bugs were my bugs; fixing them once fixed both.",
    ],
    codeUrl: "https://github.com/binlong09/stock-vetter/",
    live: { url: "LIVE_URL", label: "signal-tracker app" },
    assets: [
      {
        token: "ASSET_signal-tracker-dashboard",
        src: "/shots/signal-tracker-homepage.png",
        alt: "The signal-tracker thesis dashboard listing watched positions, each a falsifiable thesis with a status badge (Watch / On track), tickers, and last-run date",
        caption: "The thesis dashboard: one falsifiable thesis per position, each with its latest status.",
      },
      {
        token: "ASSET_signal-tracker-thesis",
        src: "/shots/signal-tracker-digest1.png",
        alt: "A thesis opened up, showing each new signal scored as strengthens or neutral with magnitude and confidence, the model's reasoning, and SEC filing / earnings-call citations",
        caption: "Inside a thesis: each new signal scored strengthens or neutral, with the model's reasoning and primary-source citations.",
      },
      {
        token: "ASSET_signal-tracker-dcf",
        src: "/shots/signal-tracker-digest2.png",
        alt: "A reverse-DCF priced-in check showing a market-implied-growth sensitivity grid, plus a recent-activity log of signals the run considered and dismissed",
        caption: "The reverse-DCF priced-in check, and the audit trail of signals considered and dismissed.",
      },
    ],
  },

  "coding-agent": {
    architecture: {
      intro: [
        "qwen-code is a minimal coding agent in one file (agent.py): a loop driving a local Qwen model through four tools, with the OpenAI Python client pointed at Ollama's OpenAI-compatible endpoint and native tool calling.",
      ],
      diagram: `  [task or REPL prompt]
        │
        ▼
  [agent loop · up to 25 iterations]
        │  stream model text → collect tool calls → execute → feed results back
        ▼
  tools:
    • read_file     (line-numbered, display-only)
    • write_file    (refuses overwrite — forces edits through str_replace)
    • str_replace   (old_str must match exactly once; collisions return line numbers)
    • bash          (fresh subprocess per call; cwd = working dir; cd does not persist)
        │
        ▼
  model: qwen3-coder:30b  (Ollama, local; reachable over the network/Tailscale)`,
      detail: [
        "Each iteration streams the model's output, executes any tool calls, and feeds results back as tool messages until the task is done or the iteration cap (25) is hit. All file paths resolve through a single _resolve_path() and cannot escape the working directory.",
      ],
    },
    decisions: [
      {
        title: "A self-describing harness",
        body: "the system prompt tells the model its exact absolute working directory, that file tools resolve against it, and that bash runs in a fresh subprocess each call so `cd` won't persist. Most agent failures are the model misunderstanding its own environment; stating the invariants explicitly removes a whole class of them.",
      },
      {
        title: "Tool feedback designed for self-correction",
        body: "str_replace failures are actionable, not opaque — zero matches returns the file's first 20 lines; multiple matches returns each match's line number with surrounding context and a hint to add more. The agent can fix its own mistake on the next turn instead of flailing.",
      },
      {
        title: "write_file refuses to overwrite",
        body: "forcing every edit through str_replace produces precise, reviewable changes and prevents the model from clobbering a file by re-emitting it whole.",
      },
      {
        title: "Display-only line numbers",
        body: "read_file prefixes each line with a number, and the prompt is explicit that these must never appear in str_replace arguments — a subtle but common source of failed edits.",
      },
      {
        title: "Path-safety hardening",
        body: "_resolve_path follows symlinks via Path.resolve() and verifies the real path is a descendant of the working directory, rejecting both `..` traversal and symlinks that point outside.",
      },
    ],
    lessons: [
      "The interesting work in v0.1 wasn't adding features — it was making the harness legible to the model. The recurring failure mode was the agent misreading its own context: not knowing where it was, assuming `cd` persisted across bash calls, or getting a bare \"no match\" from an edit and having nothing to recover with. The fix in almost every case was better feedback, not a smarter model: tell it the working directory, make errors carry the resolved path and a hint, return enough context on a failed edit that the next attempt succeeds. Building it in one file made those failure modes impossible to hide from.",
    ],
    codeUrl: "https://github.com/binlong09/qwen-code",
    scopeNote:
      "This is v0.1 — deliberately minimal. Repo map / indexing, diff-preview approval, sandboxing, multi-model routing, and conversation persistence are explicitly out of scope for this version and planned for v1+.",
    assets: [
      {
        token: "ASSET_coding-agent",
        video: "/shots/coding-agent-demo.mp4",
        src: "/shots/coding-agent-demo.gif",
        alt: "Terminal screen recording of the agent driving the local Qwen model through its tool loop — reading files, making str_replace edits, and running bash to complete a task",
        caption: "The self-hosted agent running its tool loop against the local Qwen model.",
      },
      // Append more { token, src, alt, caption } objects for additional captures.
    ],
  },

  "sc2-theorycrafter": {
    architecture: {
      intro: [
        "A StarCraft II strategy tool built on a hard separation between facts and reasoning, so the LLM can reason about strategy without being trusted to recall exact numbers.",
      ],
      diagram: `  [replay files] ──► [parser] ──► [SQLite fact store]
                                    (units, costs, build timings — patch-specific)
                                          │
  [user question] ──► [reasoning layer (LLM)] ──◄ queries facts, never recalls them
                                          │
                                          ▼
                                  [grounded answer]`,
      detail: [
        "Layer one is an SQLite database of ground-truth game facts — unit costs, build timings, tech requirements for a specific patch — populated from parsed replays. Layer two is the LLM, which answers build-order and matchup questions by *querying* those facts rather than recalling them from training, so it can't hallucinate a number.",
      ],
    },
    decisions: [
      {
        title: "Two-layer fact/reason split",
        body: "the same pattern as my investing tools' grounding — the DB holds truth, the model holds judgment. It's the cleanest defense against confident fabrication in a domain where a wrong unit cost invalidates the whole answer.",
      },
      {
        title: "Patch-pinned facts",
        body: "the store is tied to a specific game patch, so answers stay correct as balance changes — you re-parse for a new patch rather than hoping the model \"knows\" the current numbers.",
      },
      {
        title: "Replay parser as the source of truth",
        body: "facts come from parsed game data, not manual entry or model recall, which keeps the store accurate and refreshable.",
      },
      {
        title: "uv for environment management",
        body: "fast, reproducible Python environments across the sibling repos.",
      },
    ],
    lessons: [
      "The whole project is a bet that grounding beats scale for factual reliability — and the build confirmed it: the moment the model is allowed to \"remember\" a number instead of querying it, accuracy collapses. Enforcing that the reasoning layer can only *read* facts, never invent them, is the entire game. It's the same lesson as stock-vetter, learned in a domain I know cold.",
    ],
    codeUrl: "https://github.com/binlong09/sc2-theorycrafter",
    assets: [
      {
        token: "ASSET_sc2-theorycrafter",
        // src: "/shots/sc2-theorycrafter.png",
        alt: "sc2-theorycrafter answering a build-order question with numbers grounded in the SQLite fact store",
        caption: "A grounded build-order answer (capture to be added).",
      },
      // Append more { token, src, alt, caption } objects for additional captures.
    ],
  },
};

export function getDeepDive(slug: string): DeepDive | undefined {
  return deepDives[slug];
}
