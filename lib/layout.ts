import type { SlotId } from "./slots";

// What the board shows, top to bottom. Reorder, add banners, or change
// `cols` to rearrange the board without touching the components.
export type Block =
  | { type: "banner"; text: string }
  | { type: "row"; slots: SlotId[]; cols?: number };

export const DEFAULT_LAYOUT: Block[] = [
  { type: "banner", text: "ימות החול" },
  { type: "row", slots: ["weekday-shacharit", "weekday-mincha", "weekday-arvit"] },
  { type: "banner", text: "שבת קודש" },
  { type: "row", slots: ["candle-lighting", "erev-shabbat-mincha", "shabbat-shacharit"] },
  { type: "row", slots: ["shabbat-mincha", "seuda-shlishit", "motzash-arvit"] },
];
