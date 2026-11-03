"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SLOTS, type Times } from "@/lib/slots";
import { DEFAULT_LAYOUT, type Block } from "@/lib/layout";
import { BoardFrame, Banner, BoxRow, TimeBox } from "./board";

const LABELS = Object.fromEntries(SLOTS.map((s) => [s.id, s.label]));

// Shows the board, sized to fit the screen, and refreshes the times every
// minute so a screen left on in the synagogue picks up changes.
export default function Board({
  initial,
  layout = DEFAULT_LAYOUT,
  debug,
}: {
  initial: Times;
  layout?: Block[];
  debug?: boolean;
}) {
  const [times, setTimes] = useState(initial);
  const [width, setWidth] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/times", { cache: "no-store" });
        if (res.ok) setTimes(await res.json());
      } catch {}
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Everything scales with the board width, so height/width stays the same
  // at any size: pick the widest board that still fits the screen height.
  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current?.firstElementChild as HTMLElement | null;
      if (!el) return;
      const ratio = el.offsetHeight / el.offsetWidth;
      setWidth(`${Math.floor(Math.min(window.innerWidth, window.innerHeight / ratio))}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [layout]);

  return (
    <main className="board-page" ref={ref}>
      <BoardFrame width={width} debug={debug}>
        {layout.map((b, i) =>
          b.type === "banner" ? (
            <Banner key={i}>{b.text}</Banner>
          ) : (
            <BoxRow key={i} cols={b.cols}>
              {b.slots.map((id) => (
                <TimeBox key={id} label={LABELS[id]} time={times[id]} />
              ))}
            </BoxRow>
          ),
        )}
      </BoardFrame>
    </main>
  );
}
