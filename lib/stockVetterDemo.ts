// ===========================================================================
// ⚠️  CAPTURED EXAMPLE RUN. NOT LIVE OUTPUT, NOT FINANCIAL ADVICE.
//
// This is a FROZEN SNAPSHOT of one real stock-vetter run on NVIDIA (NVDA),
// shown to illustrate the tool's output and its three-pass methodology. Every
// number here is a fixed captured fact, NOT a value derived at render time:
//   - dimension scores, composite (6.9), and verdict (Pass) are all hardcoded.
// Do not run a weighted sum, do not infer weights, do not re-derive the
// composite. The scores and the 6.9 simply coexist as captured output.
//
// >>> REVIEW ME <<< Nghia:
//   - verdict.narrative is the FRAGMENT you provided (with ellipses). Paste the
//     full verbatim paragraph to replace it.
//   - dcf.multiples second column ("vs") is rendered exactly as you wrote the
//     pairs; relabel the column header if it means something specific.
// ===========================================================================

// ---- the six captured dimension scores -------------------------------------
// Semantic colour is derived from the score at render time (display only, not
// a re-computation): green >= 7, amber 4-6.9, red < 4.
export type Dimension = {
  key: string;
  name: string;
  score: number; // hardcoded captured score, 0-10
  hint: string; // generic "what to look for"
  rationale?: string; // captured "why this score" sentence (omitted for cyclicality,
  // which carries the full rationale + 3-pass loop instead)
};

export const dimensions: Dimension[] = [
  {
    key: "moat",
    name: "Moat",
    score: 7.5,
    hint: "How protected the profits are from competition. The wider the moat, the more durable future cash flows.",
    rationale:
      "CUDA's installed base of 7.5M developers and full-stack co-design create real lock-in, but hyperscaler custom ASICs and China foreclosure keep it contestable.",
  },
  {
    key: "owner-earnings",
    name: "Owner-earnings",
    score: 7.5,
    hint: "Net income plus non-cash charges, minus the maintenance capex the business genuinely needs. A cleaner read on what an owner could pocket than reported EPS.",
    rationale:
      "FCF tracks net income closely and converts well, but a $8.9B non-cash equity gain and fast-growing stock-based comp distort reported earnings upward.",
  },
  {
    key: "capital-allocation",
    name: "Capital allocation",
    score: 5.5,
    hint: "How well management deploys free cash flow across reinvestment, buybacks, dividends, and M&A. Judged by what they did, not what they said.",
    rationale:
      "Buybacks and R&D are funded entirely from free cash flow, but $17.5B into illiquid startups and a $13B Groq outlay at peak valuations raise timing-discipline questions.",
  },
  {
    key: "debt",
    name: "Debt sustainability",
    score: 9.5,
    hint: "Whether the balance sheet can carry its obligations through a downturn. Coverage ratios and net debt against the cash the business throws off.",
    rationale:
      "A fortress balance sheet — ~$54B net cash, ~400× interest coverage, non-financial covenants — with only large off-balance-sheet supply commitments as a caveat.",
  },
  {
    key: "insider",
    name: "Insider alignment",
    score: 9.0,
    hint: "Whether the people running the business have real skin in the game, with incentives aligned to long-term owners.",
    rationale:
      "Founder-CEO holds a 3.58% stake with 96% performance-linked pay and no hedging or pledging; the only blemish is minor related-party items.",
  },
  {
    key: "cyclicality",
    name: "Cyclicality awareness",
    score: 3.0,
    hint: "How exposed earnings are to boom-bust demand cycles, and whether the model shows through-cycle resilience rather than peak-of-cycle results.",
  },
];

// ---- the one fully-worked dimension (depth showcase) -----------------------
export type Citation = {
  tag: string;
  kind: string;
  quote: string; // verbatim primary-source quote, left exactly as captured
  why: string;
};

export const cyclicalityDeep = {
  // one-line captured summary (compressed from the Pass 1 rationale)
  summary:
    "Demand is highly cyclical and volatile across data-center AI, gaming, and crypto, with current results sitting at the peak of an AI investment wave.",
  pass1: {
    score: "3.0",
    rationale:
      "NVIDIA's business is highly cyclical and volatile, driven by rapidly shifting demand across data-center AI buildouts, gaming, and crypto mining. The risk factors explicitly acknowledge that supply/demand mismatches have 'significantly harmed our financial results' before, and that demand spikes tied to mercurial use cases create severe forecasting problems. Revenue is concentrated in a few large customers and driven by hyperscaler capex cycles. Current results are clearly at the peak of an AI investment wave, management provides no through-cycle resilience modeling, and the 2022–2023 crypto/gaming bust confirms sharp downturns.",
    counter:
      "The current AI buildout is exceptionally large and may be a longer-duration secular trend than typical semiconductor cycles, potentially moderating near-term cyclical risk. NVIDIA's CUDA software ecosystem and expanding recurring revenue could buffer pure hardware cycles. However, neither factor is modeled or quantified as through-cycle resilience.",
    citations: [
      {
        tag: "risk-factors",
        kind: "verbatim",
        quote:
          "Significant mismatches between supply and demand have varied across our market platforms, resulted in both product shortages and excess inventory, significantly harmed our financial results and could reoccur.",
        why: "Management itself flags repeated demand/supply mismatches causing material harm, a hallmark of cyclical exposure.",
      },
      {
        tag: "risk-factors",
        kind: "verbatim",
        quote:
          "The use of our GPUs for new, mercurial, or trendy applications, has impacted and can impact in the future, demand for our products, including by leading to inconsistent spikes and drops in demand.",
        why: "Demand driven by speculative/trend end-uses is boom-bust by nature, not stable recurring demand.",
      },
    ] as Citation[],
  },
  pass2: {
    adjustment: "0.0",
    text:
      "Pass 1's counter-evidence already addresses the core tension: the AI buildout may be a longer-duration secular trend, but neither through-cycle resilience nor demand durability is quantified. Reading the primary sources independently confirms the assessment. The risk factors extensively document demand volatility, supply/demand mismatches, inventory provisions, customer concentration (one customer = 22% of revenue, another = 14%), non-cancellable purchase commitments, and crypto-driven demand spikes, plus the company's own statement that operating results have fluctuated and may fluctuate. No new primary-source evidence emerges that Pass 1 failed to address; a score of 3 is well-calibrated.",
  },
  pass3: {
    final: "3.0",
    text:
      "Pass 2 recommended no adjustment and confirmed the score is well-calibrated, citing the same evidence of demand volatility, customer concentration, and crypto-driven spikes. Both passes agree the counter-evidence (secular AI trend, CUDA moat) is already incorporated without quantified through-cycle resilience. Final 3.0, no change.",
  },
};

export const company = {
  name: "NVIDIA Corporation",
  ticker: "NVDA",
  note: "A frozen snapshot of one real stock-vetter run, shown for illustration.",
};

// ---- reverse-DCF cross-check (captured NVDA figures) -----------------------
export const dcf = {
  impliedGrowth: "16.6%",
  impliedSub: "FCF growth the current price implies",
  actualGrowth: "77.5%",
  actualSub: "5-year actual growth",
  // gloss shown directly under the headline (verbatim; em-dash intentional)
  gloss:
    "The implied rate looks modest against the 5-year actual — but that history is a single AI-capex supercycle. The hard part is sustaining 16.6% through the next cyclical trough, which is why valuation scores low.",
  annotation:
    "A normal DCF guesses a growth rate to produce a price. A reverse-DCF flips it: it takes today's market price as given and solves for the growth rate you'd have to believe to justify it.",
  // collapsed "sensitivity grid": captured valuation multiples, exactly as the
  // pairs were provided (second column shown as "vs").
  multiples: [
    { k: "P/E", v: "32.1", vs: "4.0" },
    { k: "EV / EBIT", v: "37.8", vs: "5.1" },
    { k: "EV / Sales", v: "22.8", vs: "" },
    { k: "FCF yield", v: "0.91%", vs: "" },
  ],
};

// ---- captured top-line results (all hardcoded, never recomputed) ------------
export const composite = "6.9"; // hardcoded; already reflects every score above

export const verdict = {
  label: "Pass",
  // Full verbatim DATA.verdict paragraph, pasted exactly as captured (the
  // em-dashes are intentional verbatim content, not stylistic).
  narrative:
    "NVDA is a Pass despite genuinely impressive moat and financial strength, driven by two flaws in the value framework: extreme cyclicality and a valuation that prices in near-perfection. Cyclicality scored 3.0 — the lowest possible with high confidence — reflecting NVIDIA's boom-bust history across gaming, crypto, and now AI data center, with the current cycle dependent on hyperscaler capex that can reverse quickly. At a FCF yield under 1% and EV/EBIT of 37.8x versus a 10-year median of 5.1x, the reverse DCF implies 16.6% annual FCF growth for 10 years — which sounds modest against the 5-year actual of 77.5%, but that figure is almost entirely a product of the current AI capex supercycle; sustaining 16.6% through the inevitable cyclical trough demands a structural earnings floor NVIDIA's history does not support. The business quality is exceptional; the price is not.",
  annotation:
    "The final call is a holistic read across the dimensions, surfaced with its reasoning shown rather than hidden. It is a structured first pass to focus human attention, not a buy/sell instruction.",
};
