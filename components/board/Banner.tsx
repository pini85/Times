import type { ReactNode } from "react";

// Dark red section banner with gold end caps and fleur-de-lis either side
// of the text. Grows with longer text.
export default function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="bn">
      <img className="bn-fleur" src="/parts/fleur-start.png" alt="" />
      <span className="bn-text">{children}</span>
      <img className="bn-fleur" src="/parts/fleur-end.png" alt="" />
    </div>
  );
}
