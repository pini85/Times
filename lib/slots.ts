// The 9 times the admin edits. Where they appear is set in lib/layout.ts.
export type SlotId =
  | "weekday-shacharit" | "weekday-mincha" | "weekday-arvit"
  | "candle-lighting" | "erev-shabbat-mincha" | "shabbat-shacharit"
  | "shabbat-mincha" | "seuda-shlishit" | "motzash-arvit";

export type Times = Record<SlotId, string>;

export const SLOTS: { id: SlotId; label: string; group: string }[] = [
  { id: "weekday-shacharit",   label: "שחרית",        group: "ימות החול" },
  { id: "weekday-mincha",      label: "מנחה",         group: "ימות החול" },
  { id: "weekday-arvit",       label: "ערבית",        group: "ימות החול" },
  { id: "candle-lighting",     label: "הדלקת נרות",   group: "שבת קודש" },
  { id: "erev-shabbat-mincha", label: "מנחה ערב שבת", group: "שבת קודש" },
  { id: "shabbat-shacharit",   label: "שחרית",        group: "שבת קודש" },
  { id: "shabbat-mincha",      label: "מנחה",         group: "שבת קודש" },
  { id: "seuda-shlishit",      label: "סעודה שלישית", group: "שבת קודש" },
  { id: "motzash-arvit",       label: "ערבית מוצ״ש",  group: "שבת קודש" },
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
