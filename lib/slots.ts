// The 9 time slots on the board. row/col place each one over its box
// in public/board.png (col: right, middle, left, matching RTL order).
export type SlotId =
  | "weekday-shacharit" | "weekday-mincha" | "weekday-arvit"
  | "candle-lighting" | "erev-shabbat-mincha" | "shabbat-shacharit"
  | "shabbat-mincha" | "seuda-shlishit" | "motzash-arvit";

export type Times = Record<SlotId, string>;

export const SLOTS: { id: SlotId; label: string; group: string; row: 1 | 2 | 3; col: "right" | "middle" | "left" }[] = [
  { id: "weekday-shacharit",   label: "שחרית",        group: "ימות החול", row: 1, col: "right" },
  { id: "weekday-mincha",      label: "מנחה",         group: "ימות החול", row: 1, col: "middle" },
  { id: "weekday-arvit",       label: "ערבית",        group: "ימות החול", row: 1, col: "left" },
  { id: "candle-lighting",     label: "הדלקת נרות",   group: "שבת קודש",  row: 2, col: "right" },
  { id: "erev-shabbat-mincha", label: "מנחה ערב שבת", group: "שבת קודש",  row: 2, col: "middle" },
  { id: "shabbat-shacharit",   label: "שחרית",        group: "שבת קודש",  row: 2, col: "left" },
  { id: "shabbat-mincha",      label: "מנחה",         group: "שבת קודש",  row: 3, col: "right" },
  { id: "seuda-shlishit",      label: "סעודה שלישית", group: "שבת קודש",  row: 3, col: "middle" },
  { id: "motzash-arvit",       label: "ערבית מוצ״ש",  group: "שבת קודש",  row: 3, col: "left" },
];

// Placeholder times shown until an admin saves real ones
export const DEFAULT_TIMES: Times = {
  "weekday-shacharit": "06:30",
  "weekday-mincha": "13:45",
  "weekday-arvit": "20:00",
  "candle-lighting": "16:20",
  "erev-shabbat-mincha": "16:30",
  "shabbat-shacharit": "08:30",
  "shabbat-mincha": "15:45",
  "seuda-shlishit": "16:30",
  "motzash-arvit": "17:30",
};

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
