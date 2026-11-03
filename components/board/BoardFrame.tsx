import type { CSSProperties, ReactNode } from "react";

// The page itself: arch + title on top, columns down the sides (they repeat,
// so the board can be any height), column bases at the bottom.
// Everything inside sizes off --bw (board width), see globals.css.
export default function BoardFrame({
  children,
  width,
  debug,
  className = "",
}: {
  children: ReactNode;
  /** CSS width of the board, e.g. "600px". Defaults to min(100vw, 860px). */
  width?: string;
  debug?: boolean;
  className?: string;
}) {
  const style = width ? ({ "--bw": width } as CSSProperties) : undefined;
  return (
    <div className={`bf${debug ? " debug" : ""} ${className}`} style={style}>
      <img className="bf-head" src="/parts/header.png" alt="זמני תפילות" />
      <div className="bf-body">{children}</div>
      <img className="bf-foot" src="/parts/footer.png" alt="" />
    </div>
  );
}
