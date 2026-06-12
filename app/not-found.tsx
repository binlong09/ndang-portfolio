import Link from "next/link";
import SiteTopbar from "@/components/SiteTopbar";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <>
      <SiteTopbar />
      <main>
        <div className="wrap">
          <div className="proj-head">
            <p className="eyebrow">/ 404</p>
            <h1>Page not found</h1>
            <p className="tagline">
              That page doesn&apos;t exist. Head back to the work index.
            </p>
          </div>
          <Link href="/" className="backlink">
            ← back home
          </Link>
        </div>
      </main>
    </>
  );
}
