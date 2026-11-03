import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_TIMES, type Times } from "./slots";

const KEY = "times";
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Local fallback for development
const FILE = path.join(process.cwd(), "data", "times.json");

export async function getTimes(): Promise<Times> {
  let saved: Partial<Times> | null = null;
  if (redis) {
    saved = await redis.get<Partial<Times>>(KEY);
  } else {
    try {
      saved = JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {}
  }
  return { ...DEFAULT_TIMES, ...saved };
}

export async function saveTimes(times: Times): Promise<void> {
  if (redis) {
    await redis.set(KEY, times);
  } else {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(times, null, 2));
  }
}
