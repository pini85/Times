import type { Layout } from "@/lib/layout";
import { BoardFrame, Banner, BoxRow, TimeBox } from "./board";

// Turns a stored layout into board components. Used by the live board and
// the admin preview.
export default function LayoutView({
  layout,
  width,
  debug,
}: {
  layout: Layout;
  width?: string;
  debug?: boolean;
}) {
  return (
    <BoardFrame width={width} debug={debug}>
      {layout.map((b) =>
        b.type === "banner" ? (
          <Banner key={b.id}>{b.text}</Banner>
        ) : (
          <BoxRow key={b.id} cols={b.cols}>
            {b.boxes.map((x) => (
              <TimeBox key={x.id} label={x.label} time={x.time} />
            ))}
          </BoxRow>
        ),
      )}
    </BoardFrame>
  );
}
