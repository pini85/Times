"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Layout } from "@/lib/layout";
import LayoutView from "./LayoutView";

// Shows the board, sized to fit the screen, and refreshes it every minute
// so a screen left on in the synagogue picks up changes.
export default function Board({ initial, debug }: { initial: Layout; debug?: boolean }) {
  const [layout, setLayout] = useState(initial);
  const [width, setWidth] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/board", { cache: "no-store" });
        if (res.ok) setLayout(await res.json());
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
      <LayoutView layout={layout} width={width} debug={debug} />
    </main>
  );
}
