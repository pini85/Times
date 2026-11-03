import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_LAYOUT, fromLegacyTimes, parseLayout, type Layout, type Template } from "./layout";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Local fallback for development: data/<key>.json
const DIR = path.join(process.cwd(), "data");

async function read<T>(key: string): Promise<T | null> {
  if (redis) return redis.get<T>(key);
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${key}.json`), "utf8"));
  } catch {
    return null;
  }
}

// Vercel can't write files, so saving there needs Upstash Redis
export class StorageMissing extends Error {
  constructor() {
    super("לא הוגדר אחסון. ב־Vercel הוסיפו Upstash Redis (לשונית Storage) ופרסו מחדש (Redeploy).");
  }
}

async function write(key: string, value: unknown): Promise<void> {
  if (redis) {
    await redis.set(key, value);
  } else if (process.env.VERCEL) {
    throw new StorageMissing();
  } else {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(path.join(DIR, `${key}.json`), JSON.stringify(value, null, 2));
  }
}

// The live board
export async function getLayout(): Promise<Layout> {
  const saved = await read<unknown>("layout");
  if (saved) {
    const r = parseLayout(saved);
    if ("layout" in r) return r.layout;
  }
  // Before the layout was editable only the 9 times were stored
  const legacy = await read<Record<string, string>>("times");
  return legacy ? fromLegacyTimes(legacy) : DEFAULT_LAYOUT;
}

export async function saveLayout(layout: Layout): Promise<void> {
  await write("layout", layout);
}

// Saved templates, newest first
export async function getTemplates(): Promise<Template[]> {
  const all = (await read<Record<string, Template>>("templates")) ?? {};
  return Object.values(all).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function saveTemplate(name: string, layout: Layout): Promise<void> {
  const all = (await read<Record<string, Template>>("templates")) ?? {};
  all[name] = { name, layout, savedAt: new Date().toISOString() };
  await write("templates", all);
}

export async function deleteTemplate(name: string): Promise<void> {
  const all = (await read<Record<string, Template>>("templates")) ?? {};
  delete all[name];
  await write("templates", all);
}
