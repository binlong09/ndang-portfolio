import type { ReactNode } from "react";
import type { DeepDive } from "@/lib/deepDives";

// Convert inline `code` and *emphasis* spans in authored, static prose into
// <code>/<em> elements. Returns a React node array (no dangerouslySetInnerHTML).
function fmt(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function ProjectDeepDive({ deep }: { deep: DeepDive }) {
  return (
    <div className="deepdive">
      {/* ---- Architecture ---- */}
      <div className="section-head">
        <span className="tag">/ architecture</span>
        <h2>Architecture</h2>
      </div>
      {deep.architecture.intro.map((p, i) => (
        <p key={i}>{fmt(p)}</p>
      ))}
      <pre className="diagram" aria-label="Architecture diagram">
        <code>{deep.architecture.diagram}</code>
      </pre>
      {deep.architecture.detail.map((p, i) => (
        <p key={i}>{fmt(p)}</p>
      ))}

      {/* ---- Scale (optional) ---- */}
      {deep.scale && (
        <>
          <div className="section-head">
            <span className="tag">/ scale</span>
            <h2>Scale</h2>
          </div>
          <div className="kpis">
            {deep.scale.stats.map((s) => (
              <div className="kpi" key={s.k}>
                <p className="kpi-v">{s.v}</p>
                <p className="kpi-k">{s.k}</p>
              </div>
            ))}
          </div>
          {deep.scale.body.map((p, i) => (
            <p key={i}>{fmt(p)}</p>
          ))}
        </>
      )}

      {/* ---- Technical decisions ---- */}
      <div className="section-head">
        <span className="tag">/ technical decisions</span>
        <h2>Technical decisions</h2>
      </div>
      {deep.decisions.map((d, i) => (
        <div className="decision" key={i}>
          <h3>{fmt(d.title)}</h3>
          <p>{fmt(d.body)}</p>
        </div>
      ))}

      {/* ---- What broke / what I learned ---- */}
      <div className="section-head">
        <span className="tag">/ what broke</span>
        <h2>What broke / what I learned</h2>
      </div>
      {deep.lessons.map((p, i) => (
        <p key={i}>{fmt(p)}</p>
      ))}

      {deep.scopeNote && <p className="scope-note">{fmt(deep.scopeNote)}</p>}

      {/* ---- links row ---- */}
      <div className="proj-links">
        {deep.codeLinks ? (
          deep.codeLinks.map((l) => (
            <a href={l.url} key={l.url}>
              <span className="dot"></span>
              {l.label}
            </a>
          ))
        ) : (
          <a href={deep.codeUrl}>
            <span className="dot"></span>Code
          </a>
        )}
        {deep.live && (
          <a href={deep.live.url}>
            <span className="dot"></span>Live · {deep.live.label}
          </a>
        )}
      </div>

      {/* ---- image slot(s) ---- */}
      {deep.assets.length > 0 && (
        <div className="shots">
          {deep.assets.map((a, i) => (
            <figure className="shot" key={i}>
              {a.video ? (
                <video
                  src={a.video}
                  poster={a.src}
                  aria-label={a.alt}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              ) : a.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.src} alt={a.alt} />
              ) : (
                <div className="shot-empty" role="img" aria-label={a.alt}>
                  <span>capture coming soon</span>
                  <span className="shot-token">{a.token}</span>
                </div>
              )}
              <figcaption>{a.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
