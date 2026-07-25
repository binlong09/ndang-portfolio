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
  /**
   * For a project that spans several repos. When present these replace the
   * single `codeUrl` link in the links row (codeUrl stays the canonical one).
   */
  codeLinks?: { url: string; label: string }[];
  live?: { url: string; label: string }; // LIVE_URL placeholder, where noted
  scopeNote?: string; // optional short, honest "what's out of scope" line
  assets: Asset[]; // one or more captioned images (1 works; add more to taste)
};

export const deepDives: Record<string, DeepDive> = {
  "rok-pipeline": {
    architecture: {
      intro: [
        "Two repos, one pipeline. `rok-data-fetcher` gets lifetime governor statistics out of a live Rise of Kingdoms client and into CSVs; `kvk-web` turns those CSVs into a stats site that answers in tens of milliseconds on a hosting bill small enough to ignore. The seam between them is a ClickHouse table.",
        "The fetch side exists because the data has no other source. Community stat sites and Lilith's official Game Tools API expose only *timeframe* stats - kills inside a date window - and the API returns `KINGDOM_FORBIDDEN` for any kingdom the calling account has no character in. Lifetime total kill points, the T1-T5 kill breakdown, lifetime deaths and healing are held only by the running client, in the same table that backs the in-game Governor Profile card.",
      ],
      diagram: `  ── FETCH · rok-data-fetcher (Windows) ───────────────────────────────
  [coordinator.py]  two-tier work queue (SQLite, stdlib only)
        │  claim / complete over Tailscale
        ▼
  [runner.py] ──► [fleet.py] ──► N sandboxed game clients, in parallel
                                      │
                            [inject_loadbuffer.py]
                            hijack an engine thread, then call
                            luaL_loadbuffer + lua_pcall directly
                                      │
                                      ▼
                    PlayerInfoHandler:FetchPlayerInfo(nil, <id>, 2)
                    with OnFetchPlayerInfoAck hooked to parse the reply
                    and return — the profile card never opens
                                      │
                                      ▼   CSV per kingdom, checkpointed
  ── SERVE · kvk-web ──────────────────────────────────────────────────
  [db/ingest.py] ──► [ClickHouse Cloud · us-east-1]
                       REFRESH EVERY 12 HOUR materialized views:
                       current_scan · matchup_delta · kingdom_movement
                       │
                       └──► POST /api/revalidate the moment a batch lands
                                      │
  [Next.js on Fly · iad · ISR 43200s] ──► [Cloudflare edge] ──► reader
        most reads never reach Fly; ClickHouse idles between batches`,
      detail: [
        "The injection engine runs a Lua chunk inside the game by briefly hijacking one of its own threads and calling the standard Lua C API directly, saving and restoring the thread context so the client keeps running afterwards. The client is Unity/il2cpp, but the game logic is Lua behind an XLua bridge, and `EngineDll.dll` exports the full Lua 5.1 C API *by name* - so every function needed resolves as `base + RVA`, stable across restarts.",
        "On the serving side the load-bearing idea is that a request should never compute anything. Scans land in ClickHouse, materialized views precompute the aggregates on a 12-hour refresh, pages render with ISR on a matching 12-hour window, and Cloudflare caches the HTML at the edge. A reader coming in from a Discord link gets an answer that was computed hours ago.",
      ],
    },
    decisions: [
      {
        title: "Hook the reply, never open the window",
        body: "`FetchPlayerInfo(nil, id, 2)` returns a full profile but also opens the Governor Profile card, and firing a second fetch while a card is open crashes the client - which for a long time looked like a hard ceiling of one fetch per session. The fix was to stop treating it as an injection problem: `OnFetchPlayerInfoAck` is table-dispatched, so wrapping it to parse the profile and return *without* calling the original means no window ever opens. Hundreds of back-to-back fetches, zero crashes. This one insight is what turned a proof of concept into a pipeline.",
      },
      {
        title: "Call luaL_loadbuffer directly, not the game's own loader",
        body: "the obvious entry point, `lua_doMemBuffer`, crashed the client on every attempt. Disassembly showed why: it doesn't wrap `luaL_loadbuffer` - it calls a custom loader that allocates a C++ reader object and makes vtable-based virtual calls to pull each buffer chunk, and those depend on engine context that doesn't exist during an out-of-band thread hijack. `luaL_loadbuffer` is a seven-instruction wrapper around a reader with no virtual calls and no global state, so it cannot fail the same way. Bypassing the game's own convenience function fixed it in one change.",
      },
      {
        title: "Read passively; inject as little as possible",
        body: "the client ships NetEase Protect, which does anti-debug, thread and module enumeration, and integrity scanning - and ignores external `ReadProcessMemory` entirely. So every diagnostic that could be passive was: the root-cause disassembly, the memory scans, the wire captures. Injection is reserved for the single call that has to happen inside the process. That split is also why the root cause was findable at all - attaching a debugger, the conventional move, was the one thing the environment actively defended against.",
      },
      {
        title: "Adaptive two-tier scanning over a rigid top-N",
        body: "the binding constraint is a per-IP rate limit on the profile fetch, so at 4,000 kingdoms every profile *not* fetched is the win. A fixed top-150 is wrong on both ends - it burns throttled fetches on dead kingdoms' alt accounts and truncates real players in stacked ones. Tier 1 scans top-down by power and stops at a run of sub-City-Hall-25 governors, so each kingdom sizes its own scan; tier 2 backfills the cold tail on spare capacity, skipping anyone a recent daily already covered.",
      },
      {
        title: "A shared pull queue instead of a schedule",
        body: "the coordinator is a work queue, not a dispatcher: every box pulls the next kingdom the moment it is free. Capacity balancing then falls out for free - a machine with six clients drains roughly twice the work of one with three, with nothing configured - and a kingdom a box can't finish is simply re-queued. The daily census works the same way: the first runner up claims a lease and re-seeds, so there is no cron and no scheduler anywhere in the system. The runner is the clock.",
      },
      {
        title: "Clients are consumable; make every stage resumable",
        body: "repeated thread hijacking degrades a session - after a few hundred fetches replies just stop arriving. Rather than fight that, the fleet treats a client as expendable: detect the stall, terminate the Sandboxie box, relaunch, resume. That also resets the game's per-session rate limit, so recycling is a feature twice over. The CSV is checkpointed atomically after every round and a resumed run keeps each row's own fetch timestamp, so an interrupted overnight sweep needs nothing but the same command again.",
      },
      {
        title: "Precompute and serve, never compute per request",
        body: "on kvk-web this is enforced rather than encouraged. Every page must build as static or ISR - `npm run build` runs a checker that fails the build if any route outside `app/api/` went dynamic - and aggregation happens in ClickHouse, never by pulling rows into Node. Reading `searchParams` in a page Server Component silently opts the whole route out of static rendering, which is a bug `next dev` will happily hide until it 500s in production.",
      },
      {
        title: "12-hour cache windows, plus an event-driven poke",
        body: "the data only changes when an ingest batch lands, so every cache window in the system is set to that cadence - ISR at 43,200s, `s-maxage` on every API route the same - and the pipeline POSTs a guarded `/api/revalidate` the instant a batch completes, which busts ISR and purges Cloudflare. Freshness comes from the event, not from polling. That's the whole cost win: a short window would let any traffic (an uptime monitor is enough) re-hit ClickHouse every minute and keep a metered Cloud service permanently awake. Instead it idles between batches, and the Fly machine suspends.",
      },
    ],
    lessons: [
      "`PROGRESS.md` is 27 sections long and the honest version of this project. Section 18 announces that arbitrary-kingdom fetch is solved end to end; section 19 opens with `CORRECTION` and proves the mechanism in section 18 was wrong. That correction cost a session of crash-and-relaunch cycles to establish, and what it found was a genuine wall: the injection path can send a request for any kingdom and the server answers, but the client cannot *materialize* a foreign kingdom's entry objects in-process - it has no supporting data for a kingdom it isn't in - so touching the reply faults natively, uncatchable by `pcall`. Holding the raw reference is safe; reading one field is fatal.",
      "So I went the long way around: capture the encrypted reply off the wire and decrypt it with the keystream read out of the client's memory. That worked - the cipher came apart, a leaderboard reply was decrypted from the memory keystream end to end - and it was still the wrong answer. The shippable solution turned out to be much smaller and came from a question about game behaviour rather than about the binary: *why* does the second fetch crash? Because the first one left a profile card open. Hook the ack, never open the card, and the whole elaborate wire-decode subproject becomes unnecessary. The lesson I actually keep from this is that I spent days deepening an approach before I had finished understanding the failure it was meant to route around.",
      "The web half taught the inverse lesson - that the cheap-looking thing has a cost curve. The first version loaded all of `current_scan` into an in-memory snapshot on the Node process, which is genuinely the fastest possible read right up until the table passes ~600k rows and OOMs production. Replacing it with bounded, keyset-paginated, indexed queries per request was *slower* per query and correct, because the edge cache and ISR were already absorbing the request rate that the snapshot was optimising for. Both halves of this project failed the same way: I optimised a layer before checking whether it was the layer under pressure.",
      "I stopped working on it because scans take a long time and free tools already cover most of what this does. That was the right call and it doesn't subtract from what it was - the only project I've built that spans reverse-engineering a hostile binary, an unattended multi-machine fleet, a columnar data model, and a front end with a hard latency budget, where every layer had to be right for the last one to work.",
    ],
    codeUrl: "https://github.com/binlong09/rok-data-fetcher",
    codeLinks: [
      {
        url: "https://github.com/binlong09/rok-data-fetcher",
        label: "rok-data-fetcher (pipeline)",
      },
      { url: "https://github.com/binlong09/kvk-web", label: "kvk-web (site)" },
      {
        url: "https://github.com/binlong09/rok-data-fetcher/blob/main/PROGRESS.md",
        label: "PROGRESS.md (the RE log)",
      },
    ],
    live: { url: "https://kvk-web.fly.dev/", label: "kvk.gg" },
    scopeNote:
      "Archived, and honest about its edges. The injection uses hard-coded `EngineDll.dll` offsets for one game build and needs re-deriving after an update; a governor who has never been scanned isn't in the roster yet, so brand-new accounts are the one coverage gap; and arbitrary-kingdom fetch at arbitrary times - the wire-capture route - was proven but never made robust, because the profile-fetch path made it unnecessary. This was reverse engineering of my own game client, on my own machine, for data the game already shows me.",
    assets: [
      {
        token: "ASSET_rok-pipeline-kingdom",
        // src: "/shots/rok-pipeline-kingdom.png",
        alt: "A kingdom leaderboard on kvk.gg listing governors with lifetime kill points, kills, deaths and healing, sortable by column",
        caption:
          "A kingdom's leaderboard: lifetime totals no public API exposes, served from a precomputed table (capture to be added).",
      },
      {
        token: "ASSET_rok-pipeline-governor",
        // src: "/shots/rok-pipeline-governor.png",
        alt: "A single governor's profile page showing the T1-T5 kill breakdown, power composition, and change between scans",
        caption:
          "One governor: the T1-T5 breakdown and scan-over-scan movement that make migration vetting possible (capture to be added).",
      },
      {
        token: "ASSET_rok-pipeline-fleet",
        // src: "/shots/rok-pipeline-fleet.png",
        alt: "Terminal output from fleet.py showing several Sandboxie game clients harvesting different kingdoms in parallel against the shared coordinator queue",
        caption:
          "The fleet mid-sweep: each sandboxed client pulling the next kingdom off the shared queue (capture to be added).",
      },
    ],
  },

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
        "qwen-code is a minimal coding agent in one file (agent.py): a loop driving a local Qwen model through six tools, with the OpenAI Python client pointed at Ollama's OpenAI-compatible endpoint and native tool calling. It runs local-first and falls back to a hosted DeepSeek endpoint only when the local box fails a startup health check.",
      ],
      diagram: `  [task or REPL prompt]   (/model, /cost slash commands)
        │
        ▼
  [agent loop · 25 iterations local / 50 fallback]
        │  stream model text → collect tool calls → execute → feed results back
        │  ends ONLY when task_complete validates its evidence
        ▼
  tools:
    • read_file       (line-numbered, display-only)
    • write_file      (refuses overwrite — forces edits through replace_in_file)
    • replace_in_file (fenced SEARCH/REPLACE blocks; all-or-nothing; must match once)
    • search          (ripgrep across the tree; ≤ 100 matches)
    • bash            (fresh subprocess; cwd = working dir; model flags risky cmds)
    • task_complete   (summary + files_changed + harness-verified evidence)
        │
        ▼
  model: qwen3-coder:30b  (Ollama, local; reachable over Tailscale)
          └─ fallback: deepseek-v4-flash  (hosted; only if local is unreachable)`,
      detail: [
        "Each iteration streams the model's output, executes any tool calls, and feeds results back as tool messages. The loop ends only when the agent calls task_complete and its evidence validates — plain text with no tool call is nudged, not accepted — or when the iteration cap (25 local, 50 fallback) is hit. All file paths resolve through a single _resolve_path() and cannot escape the working directory.",
      ],
    },
    decisions: [
      {
        title: "A self-describing harness",
        body: "the system prompt tells the model its exact absolute working directory, that file tools resolve against it, and that bash runs in a fresh subprocess each call so `cd` won't persist. Most agent failures are the model misunderstanding its own environment; stating the invariants explicitly removes a whole class of them.",
      },
      {
        title: "Evidence-gated termination",
        body: "the loop ends only when the model calls `task_complete` with the files it changed — and the harness verifies every cited path was actually read or searched this session. It's a direct guard against the failure mode where a model declares a success it can't support, or invents a bug to look busy: an unverifiable citation fails the call, and the model has to either drop the claim or go read the file before it can finish.",
      },
      {
        title: "Tool feedback designed for self-correction",
        body: "replace_in_file failures are actionable, not opaque — zero matches returns the file's first 20 lines; multiple matches returns each match's line number with surrounding context and a hint to add more. The agent can fix its own mistake on the next turn instead of flailing.",
      },
      {
        title: "Fenced search/replace edits over re-emitting files",
        body: "edits go through replace_in_file as fenced SEARCH/REPLACE blocks (the Aider/Cline format): each block's SEARCH must match exactly once, multiple blocks apply in one call, and the whole thing is all-or-nothing. This sidesteps the JSON-string-escaping failures of the old str_replace tool and keeps changes precise and reviewable; write_file refuses to overwrite, so the model can't clobber a file by re-emitting it whole.",
      },
      {
        title: "Display-only line numbers",
        body: "read_file prefixes each line with a number, and the prompt is explicit that these must never appear in replace_in_file SEARCH text — a subtle but common source of failed edits.",
      },
      {
        title: "Local-first with a hosted fallback",
        body: "a 3-second startup health check on the local Ollama endpoint decides the model; if it's unreachable the agent announces a fallback to a hosted DeepSeek endpoint instead of just dying. `/model` switches mid-session (history preserved) and `/cost` tracks per-model token use. The local box stays the default — the fallback exists so an unreachable homelab doesn't end the session, not to make the tool API-dependent.",
      },
      {
        title: "Path-safety hardening",
        body: "_resolve_path follows symlinks via Path.resolve() and verifies the real path is a descendant of the working directory, rejecting both `..` traversal and symlinks that point outside.",
      },
    ],
    lessons: [
      "The interesting work early on wasn't adding features — it was making the harness legible to the model. The recurring failure mode was the agent misreading its own context: not knowing where it was, assuming `cd` persisted across bash calls, or getting a bare \"no match\" from an edit and having nothing to recover with. The fix in almost every case was better feedback, not a smarter model: tell it the working directory, make errors carry the resolved path and a hint, return enough context on a failed edit that the next attempt succeeds. Building it in one file made those failure modes impossible to hide from.",
      "The later versions pushed on a different failure mode: the model declaring victory. Swapping str_replace for fenced search/replace blocks cut the edit-escaping failures, but the sharper lesson came with task_complete — left to end on its own, the model would sometimes announce a fix it hadn't made, or invent a bug just to have something to solve. Making termination a tool call whose evidence the harness checks against the files actually read turned \"trust the model's word\" into \"verify its citations,\" and the fabrications stopped. The hosted fallback came last, so an unreachable homelab degrades gracefully instead of ending the run.",
    ],
    codeUrl: "https://github.com/binlong09/qwen-code",
    scopeNote:
      "Still deliberately minimal at v1.2. Repo-map / tree-sitter indexing, sandboxing, diff-preview approval, automatic in-session failover (the health check is startup-only), dollar-cost estimation, other providers, MCP, and subagents are out of scope for now.",
    assets: [
      {
        token: "ASSET_coding-agent",
        video: "/shots/coding-agent-demo.mp4",
        src: "/shots/coding-agent-demo.gif",
        alt: "Terminal screen recording of the agent fixing a bug in a small multi-file project — locating the broken discount with search, editing pricing.py with a fenced search/replace block, re-running the test, and ending on the green task_complete panel",
        caption: "Finding and fixing a bug across a multi-file project: search → read → edit → verify → evidence-gated task_complete (sped up; the local 30b runs in real time).",
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
