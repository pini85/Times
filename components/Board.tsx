"use client";
import { useEffect, useState } from "react";
import { SLOTS, type Times } from "@/lib/slots";

// Shows the board and refreshes the times every minute,
// so a screen left on in the synagogue picks up changes.
export default function Board({ initial, debug }: { initial: Times; debug?: boolean }) {
  const [times, setTimes] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/times", { cache: "no-store" });
        if (res.ok) setTimes(await res.json());
      } catch {}
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className={`board-page${debug ? " debug" : ""}`}>
      <div className="board" aria-label="זמני תפילות">
        {SLOTS.map((s) => (
          <div key={s.id} className={`slot r${s.row} ${s.col}`} aria-label={s.label}>
            {times[s.id]}
          </div>
        ))}
      </div>
    </main>
  );
}
