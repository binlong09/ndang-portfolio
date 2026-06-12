import Link from "next/link";
import { listedProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span className="brand">
            <b>nghia dang</b> · software engineer
          </span>
          <nav className="topnav">
            <a href="#work">work</a>
            <a href="#experience">experience</a>
            <a href="#contact">contact</a>
          </nav>
        </div>
      </div>

      <header className="hero">
        <div className="wrap">
          <p className="eyebrow reveal">Distributed systems → AI engineering</p>
          <h1 className="reveal">Nghia Dang</h1>
          <p className="lede reveal">
            I build systems that turn messy, high-volume real-world data into
            decisions. By day that means high-throughput data pipelines at
            Walmart scale; on my own time it means LLM-powered tools built end to
            end, from SEC-filing analysis engines to a self-hosted coding agent.
          </p>
          <p className="lede soft reveal">
            Software Engineer III at Walmart Global Tech. Starting an M.S. in
            Artificial Intelligence at George Mason in Fall 2026.
          </p>
          <div className="hero-links reveal">
            <a href={site.github}>
              <span className="dot"></span>GitHub
            </a>
            <a href={site.linkedin}>
              <span className="dot"></span>LinkedIn
            </a>
            <a href={`mailto:${site.email}`}>
              <span className="dot"></span>Email
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ================= WORK ================= */}
        <section id="work">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">/ selected work</span>
              <h2>Things I&apos;ve built</h2>
            </div>

            {listedProjects.map((p) => (
              <div className="record reveal" key={p.slug}>
                <h3>
                  <Link href={`/work/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="tagline">{p.tagline}</p>
                <div className="spec">
                  {p.spec.map((f) => (
                    <div key={f.k}>
                      <b>{f.k}</b> {f.v}
                    </div>
                  ))}
                </div>
                {p.prose.map((block) => (
                  <p key={block.label}>
                    <span className="label">{block.label}</span>
                    <span dangerouslySetInnerHTML={{ __html: block.body }} />
                  </p>
                ))}
                <Link className="more" href={`/work/${p.slug}`}>
                  {p.bespoke ? "explore the interactive demo" : "read the write-up"}{" "}
                  <span className="arrow">→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================= EXPERIENCE ================= */}
        <section id="experience">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">/ experience</span>
              <h2>Where I work</h2>
            </div>

            <div className="role reveal">
              <p className="meta">2022 to present · Reston, VA</p>
              <h3>
                Software Engineer III at Walmart Global Tech{" "}
                <span>· Store Entities Enrichment Platform</span>
              </h3>
              <p>
                I build Java / Spring Boot data pipelines on Kafka that enrich
                inventory data at scale, on the order of 40K+ events per second
                and 10M+ messages per day, running on Kubernetes with GCP and
                BigQuery. The work is squarely about reliability, throughput, and
                correctness in a system where being wrong is expensive and being
                slow is visible.
              </p>
            </div>

            <div className="role reveal">
              <p className="meta">Fall 2026 · George Mason University</p>
              <h3>
                M.S., Artificial Intelligence <span>· in progress</span>
              </h3>
              <p>
                Formalizing the AI/ML foundations I&apos;ve been building toward
                through self-study and the projects above, with the aim of moving
                from distributed-systems engineering into AI engineering as a
                primary focus.
              </p>
            </div>

            <div className="section-head reveal">
              <span className="tag">/ stack</span>
              <h2>Tools I reach for</h2>
            </div>
            <div className="stack reveal">
              <div className="group">
                <p className="k">Languages</p>
                <p className="v">Java · TypeScript · Python</p>
              </div>
              <div className="group">
                <p className="k">Systems</p>
                <p className="v">Kafka · Spring Boot · Kubernetes · GCP / BigQuery</p>
              </div>
              <div className="group">
                <p className="k">AI / LLM</p>
                <p className="v">
                  RAG · LLM orchestration · prompt &amp; cost optimization ·
                  local serving (Ollama)
                </p>
              </div>
              <div className="group">
                <p className="k">Data &amp; web</p>
                <p className="v">Turso / SQLite · Next.js · Vercel · GitHub Actions</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BEYOND ================= */}
        <section id="beyond">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">/ beyond code</span>
              <h2>Reading systems under pressure</h2>
            </div>
            <div className="beyond reveal">
              <p className="pts">StarCraft II Grandmaster (top ~0.1%)</p>
              <p>
                At the top level it&apos;s the same exercise as the work I care
                about: read a complex state, weigh incomplete information, and
                commit to the highest-value move before the clock runs out.
                It&apos;s not a coincidence that I like building tools that do
                the analog of that, taking a noisy pile of real-world information
                and turning it into a clear, defensible decision. The instinct
                that makes a good
                game is the one I try to encode in software.
              </p>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="contact">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">/ contact</span>
              <h2>Get in touch</h2>
            </div>
            <p className="reveal">
              Happy to talk about distributed systems, applied LLM work, or
              anything I&apos;ve built here. The fastest way to reach me is{" "}
              <a href={`mailto:${site.email}`}>email</a>, and I&apos;m on{" "}
              <a href={site.linkedin}>LinkedIn</a> and{" "}
              <a href={site.github}>GitHub</a>.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span>© {year} Nghia Dang</span>
          <span>
            Built and hosted by hand · <a href={site.github}>github</a> ·{" "}
            <a href={site.linkedin}>linkedin</a>
          </span>
        </div>
      </footer>
    </>
  );
}
