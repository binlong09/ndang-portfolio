"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Faithful port of the original index.html entrance-reveal script.
 * Renders nothing. On mount (and on client-side navigation) it finds every
 * `.reveal` element and fades it in via IntersectionObserver. When the user
 * prefers reduced motion, or IntersectionObserver is unavailable, every
 * element is revealed immediately (the CSS already disables the transition).
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
