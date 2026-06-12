import Link from "next/link";

/** Sticky top bar for sub-pages. Mirrors the landing page bar, but the nav
 *  links point back to the home page sections. */
export default function SiteTopbar() {
  return (
    <div className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">
          <b>nghia dang</b> · software engineer
        </Link>
        <nav className="topnav">
          <Link href="/#work">work</Link>
          <Link href="/#experience">experience</Link>
          <Link href="/#contact">contact</Link>
        </nav>
      </div>
    </div>
  );
}
