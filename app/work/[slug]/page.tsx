import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, genericSlugs } from "@/lib/projects";
import { getDeepDive } from "@/lib/deepDives";
import SiteTopbar from "@/components/SiteTopbar";
import ProjectDeepDive from "@/components/ProjectDeepDive";

type Params = { slug: string };

// Pre-render every generic project at build time (stock-vetter is excluded
// here because it has its own static route at app/work/stock-vetter/page.tsx,
// which Next.js prefers over this dynamic segment).
export function generateStaticParams(): Params[] {
  return genericSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  // Unknown slug, or a bespoke project that should be served by its own route.
  if (!project || project.bespoke) notFound();

  const deep = getDeepDive(slug);
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
            <p className="eyebrow">/ project</p>
            <h1>
              {project.title}
              {project.flagship && <span className="flagship">flagship</span>}
            </h1>
            <p className="tagline">{project.tagline}</p>
            <div className="spec">
              {project.spec.map((f) => (
                <div key={f.k}>
                  <b>{f.k}</b> {f.v}
                </div>
              ))}
            </div>
          </div>

          <div className="proj-body">
            {project.placeholder && (
              <p className="placeholder-note">
                Placeholder. This write-up hasn&apos;t been written yet. Fill in
                the content in <code>lib/projects.ts</code>.
              </p>
            )}

            {project.prose.map((block) => (
              <p key={block.label}>
                <span className="label">{block.label}</span>
                <span dangerouslySetInnerHTML={{ __html: block.body }} />
              </p>
            ))}

            {/* default links row, unless a deep-dive supplies its own */}
            {!deep && (
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
            )}
          </div>

          {deep && <ProjectDeepDive deep={deep} />}

          <Link href="/#work" className="backlink">
            ← back to work
          </Link>
        </div>
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
