import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import SiteTopbar from "@/components/SiteTopbar";
import Tip from "@/components/Tip";
import {
  company,
  dimensions,
  cyclicalityDeep,
  dcf,
  composite,
  verdict,
} from "@/lib/stockVetterDemo";

const project = getProject("stock-vetter");

export const metadata: Metadata = {
  title: "stock-vetter",
  description:
    "A captured example run of stock-vetter on NVIDIA (NVDA): six dimension scores, one fully-worked three-pass scoring breakdown, a reverse-DCF cross-check, and the final verdict. Illustrative only, not financial advice.",
};

// Semantic colour from the captured score (display only): green >= 7,
// amber 4-6.9, red < 4.
function tier(score: number): "green" | "amber" | "red" {
  if (score >= 7) return "green";
  if (score >= 4) return "amber";
  return "red";
}

export default function StockVetterPage() {
  if (!project) notFound();

  const hasCode = project.codeUrl && project.codeUrl !== "TODO";
  const hasLive = project.liveUrl && project.liveUrl !== "TODO";

  return (
    <>
      <SiteTopbar />

      <main>
        <div className="wrap">
          <Link href="/#work" className="backlink">
            ← back to work
          </Link>

          <div className="proj-head">
            <p className="eyebrow">/ project · interactive demo</p>
            <h1>{project.title}</h1>
            <p className="tagline">{project.tagline}</p>
            <div className="spec">
              {project.spec.map((f) => (
                <div key={f.k}>
                  <b>{f.k}</b> {f.v}
                </div>
              ))}
            </div>
          </div>

          {/* ---- write-up ---- */}
          <div className="proj-body">
            {project.prose.map((block) => (
              <p key={block.label}>
                <span className="label">{block.label}</span>
                <span dangerouslySetInnerHTML={{ __html: block.body }} />
              </p>
            ))}

            <div className="proj-links">
              <a
                href={hasCode ? project.codeUrl : undefined}
                aria-disabled={!hasCode}
                title={hasCode ? undefined : "Link coming soon"}
              >
                <span className="dot"></span>Code
              </a>
              <a
                href={hasLive ? project.liveUrl : undefined}
                aria-disabled={!hasLive}
                title={hasLive ? undefined : "Link coming soon"}
              >
                <span className="dot"></span>Live
              </a>
            </div>
          </div>
        </div>

        {/* ================= CAPTURED EXAMPLE ================= */}
        <section>
          <div className="wrap">
            <div className="section-head">
              <span className="tag">/ captured run</span>
              <h2>How a ticker gets vetted</h2>
            </div>

            <p className="demo-meta">
              {company.name} · ({company.ticker})
            </p>
            <p
              className="disclaimer"
              role="note"
              aria-label="Captured example disclaimer"
            >
              <b>Captured example. Not live output, not financial advice.</b>{" "}
              This is a frozen snapshot of one real {company.ticker} run, shown to
              illustrate the tool&apos;s output and methodology. The numbers are
              fixed captured values, not live data, and nothing here is a
              recommendation to buy or sell any security.
            </p>

            {/* ---- dimension scoring ---- */}
            <h3 className="step-head">
              <span className="label">Step 1</span>
              Six-dimension score
            </h3>
            <div className="scorecards">
              {dimensions.map((d) => {
                const t = tier(d.score);
                const worked = d.key === "cyclicality";
                return (
                  <div
                    className={`scard${worked ? " scard-worked" : ""}`}
                    key={d.key}
                  >
                    <div className="scard-top">
                      <h3>{d.name}</h3>
                      <span className={`score ${t}`}>
                        {d.score.toFixed(1)}
                        <span className="max">/10</span>
                      </span>
                    </div>
                    <div className="bar" aria-hidden="true">
                      <span
                        className={t}
                        style={{ width: `${d.score * 10}%` }}
                      />
                    </div>

                    {worked && <p>{cyclicalityDeep.summary}</p>}

                    <span className="annot">
                      <span className="annot-k">what to look for</span>
                      {d.hint}
                    </span>

                    {worked && (
                      <>
                        {/* intro helper line, directly above the disclosure */}
                        <span className="annot helper">
                          Every dimension runs this same three-pass loop: score,
                          then a skeptic argues it down, then a judge rules.
                          Expanded here for one; the rest stay collapsed to keep
                          this readable.
                        </span>

                        {/* collapsed by default */}
                        <details className="threepass">
                          <summary>How this was scored (3-pass)</summary>
                          <div className="tp-body">
                            {/* Pass 1 · initial scoring */}
                            <div className="tp-pass">
                              <p className="tp-k">Pass 1 · initial scoring</p>
                              <p>{cyclicalityDeep.pass1.rationale}</p>
                              <p>
                                <span className="tp-sub">
                                  Counter-evidence considered
                                </span>
                                {cyclicalityDeep.pass1.counter}
                              </p>
                              <p className="tp-sub">Citations</p>
                              <ul className="tp-cites">
                                {cyclicalityDeep.pass1.citations.map((c, i) => (
                                  <li key={i}>
                                    <p className="cite-meta">
                                      <span className="cite-tag">{c.tag}</span>
                                      <span className="cite-kind">{c.kind}</span>
                                    </p>
                                    <blockquote>“{c.quote}”</blockquote>
                                    <p className="cite-why">{c.why}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Pass 2 · skeptic */}
                            <div className="tp-pass">
                              <p className="tp-k">Pass 2 · skeptic</p>
                              <span className="chip">
                                adjustment {cyclicalityDeep.pass2.adjustment}
                              </span>
                              <p>{cyclicalityDeep.pass2.text}</p>
                            </div>

                            {/* Pass 3 · judge */}
                            <div className="tp-pass">
                              <p className="tp-k">Pass 3 · judge</p>
                              <p className="tp-final">
                                final {cyclicalityDeep.pass3.final} · no change
                              </p>
                              <p>{cyclicalityDeep.pass3.text}</p>
                            </div>
                          </div>
                        </details>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ---- reverse-DCF cross-check ---- */}
            <h3 className="step-head">
              <span className="label">Step 2</span>
              Reverse-DCF cross-check
              <Tip>
                A reverse-DCF takes today&apos;s price as given and solves for the
                growth rate it implies, instead of guessing growth to produce a
                price.
              </Tip>
            </h3>
            <div className="dcf">
              <div className="dcf-grid dcf-grid--two">
                <div className="dcf-cell">
                  <p className="k">Market-implied growth</p>
                  <p className="v">{dcf.impliedGrowth}</p>
                  <p className="sub">{dcf.impliedSub}</p>
                </div>
                <div className="dcf-cell">
                  <p className="k">5-yr actual growth</p>
                  <p className="v">{dcf.actualGrowth}</p>
                  <p className="sub">{dcf.actualSub}</p>
                </div>
              </div>

              <p className="dcf-gloss">{dcf.gloss}</p>

              <details className="threepass" style={{ marginTop: 16 }}>
                <summary>Sensitivity grid</summary>
                <table className="weights" style={{ marginTop: 14 }}>
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      <th scope="col" className="num">
                        Captured
                      </th>
                      <th scope="col" className="num">
                        vs 10-yr median
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcf.multiples.map((m) => (
                      <tr key={m.k}>
                        <td>{m.k}</td>
                        <td className="num">{m.v}</td>
                        <td className="num">{m.vs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>

              <span className="annot">
                <span className="annot-k">how this vets the price</span>
                {dcf.annotation}
              </span>
            </div>

            {/* ---- final verdict ---- */}
            <h3 className="step-head">
              <span className="label">Step 3</span>
              Final verdict
            </h3>
            <div className="verdict">
              <div className="verdict-top">
                <span className="composite">
                  {composite}
                  <span className="max"> / 10 composite</span>
                  <Tip>
                    A captured top-line score for the run. It already reflects
                    every dimension, including cyclicality; it is shown as-is, not
                    recomputed here.
                  </Tip>
                </span>
                <span className="badge">{verdict.label}</span>
              </div>
              <p style={{ margin: "14px 0 0", fontSize: "0.96rem" }}>
                {verdict.narrative}
              </p>
              <span className="annot">
                <span className="annot-k">what the verdict means</span>
                {verdict.annotation}
              </span>
            </div>

            <Link href="/#work" className="backlink">
              ← back to work
            </Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} Nghia Dang</span>
          <span>
            <Link href="/">home</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
