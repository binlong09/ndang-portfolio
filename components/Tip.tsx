/**
 * A small, keyboard-accessible "ⓘ" tooltip mark. The explanatory text is
 * available on hover AND on focus (so keyboard users can read it), and is
 * announced to assistive tech via aria-label. No client JS required.
 */
export default function Tip({ children }: { children: string }) {
  return (
    <button type="button" className="tip" aria-label={children}>
      i
      <span className="tip-body" role="tooltip">
        {children}
      </span>
    </button>
  );
}
