/**
 * Small info affordance. The explanation is exposed via the native `title`
 * tooltip (shown on hover) and `aria-label` (for assistive tech). There is no
 * inline text node, so the explanation can never leak into the page flow even
 * if a style fails to apply.
 */
export default function Tip({ children }: { children: string }) {
  return (
    <button type="button" className="tip" aria-label={children} title={children}>
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="4.6" r="1" fill="currentColor" />
        <rect x="7.1" y="6.8" width="1.8" height="4.9" rx="0.9" fill="currentColor" />
      </svg>
    </button>
  );
}
