// What the board shows, top to bottom. The admin edits this at /admin and it
// is stored like the times used to be (lib/store.ts). Each box carries its
// own label and time, so the admin can add as many boxes as they like.

export type Box = { id: string; label: string; time: string };

export type Block =
  | { type: "banner"; id: string; text: string }
  | { type: "row"; id: string; cols: number; boxes: Box[] };

export type Layout = Block[];

export type Template = { name: string; layout: Layout; savedAt: string };

export const MAX_COLS = 4;
export const MAX_BLOCKS = 40;
export const MAX_BOXES = 12;
export const MAX_TEXT = 40;

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Shown until an admin saves a layout. The box ids match the old fixed
// slots, so times saved before the layout became editable carry over.
export const DEFAULT_LAYOUT: Layout = [
  { type: "banner", id: "b1", text: "ימות החול" },
  {
    type: "row", id: "r1", cols: 3, boxes: [
      { id: "weekday-shacharit", label: "שחרית", time: "06:30" },
      { id: "weekday-mincha", label: "מנחה", time: "13:45" },
      { id: "weekday-arvit", label: "ערבית", time: "20:00" },
    ],
  },
  { type: "banner", id: "b2", text: "שבת קודש" },
  {
    type: "row", id: "r2", cols: 3, boxes: [
      { id: "candle-lighting", label: "הדלקת נרות", time: "16:20" },
      { id: "erev-shabbat-mincha", label: "מנחה ערב שבת", time: "16:30" },
      { id: "shabbat-shacharit", label: "שחרית", time: "08:30" },
    ],
  },
  {
    type: "row", id: "r3", cols: 3, boxes: [
      { id: "shabbat-mincha", label: "מנחה", time: "15:45" },
      { id: "seuda-shlishit", label: "סעודה שלישית", time: "16:30" },
      { id: "motzash-arvit", label: "ערבית מוצ״ש", time: "17:30" },
    ],
  },
];

// Old saved data was { slotId: "HH:MM" } for the 9 fixed slots.
export function fromLegacyTimes(times: Record<string, string>): Layout {
  return DEFAULT_LAYOUT.map((b) =>
    b.type === "row"
      ? { ...b, boxes: b.boxes.map((x) => ({ ...x, time: times[x.id] ?? x.time })) }
      : b,
  );
}

const text = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_TEXT) : "");
const id = (v: unknown) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : newId());

// Checks data from the admin form (or storage) and returns a clean layout,
// or an error message in Hebrew.
export function parseLayout(data: unknown): { layout: Layout } | { error: string } {
  if (!Array.isArray(data)) return { error: "מבנה לא תקין" };
  if (data.length > MAX_BLOCKS) return { error: `עד ${MAX_BLOCKS} חלקים בלוח` };
  const layout: Layout = [];
  for (const b of data) {
    if (b?.type === "banner") {
      const t = text(b.text);
      if (!t) return { error: "יש כותרת ריקה" };
      layout.push({ type: "banner", id: id(b.id), text: t });
    } else if (b?.type === "row") {
      if (!Array.isArray(b.boxes)) return { error: "שורה לא תקינה" };
      if (b.boxes.length > MAX_BOXES) return { error: `עד ${MAX_BOXES} תיבות בשורה` };
      const cols = Math.min(MAX_COLS, Math.max(1, Math.round(Number(b.cols) || 3)));
      const boxes: Box[] = [];
      for (const x of b.boxes) {
        const label = text(x?.label);
        if (!label) return { error: "יש תיבה בלי שם" };
        boxes.push({ id: id(x?.id), label, time: text(x?.time) });
      }
      layout.push({ type: "row", id: id(b.id), cols, boxes });
    } else {
      return { error: "חלק לא מוכר בלוח" };
    }
  }
  return { layout };
}
