import type { CSSProperties, ReactNode } from "react";

// A row of boxes. `cols` sets how wide each box is (3 = a third of the row);
// a row with fewer boxes than `cols` is centred. Extra boxes wrap.
export default function BoxRow({ cols = 3, children }: { cols?: number; children: ReactNode }) {
  return (
    <div className="box-row" style={{ "--cols": cols } as CSSProperties}>
      {children}
    </div>
  );
}
