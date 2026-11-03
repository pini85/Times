"use server";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { parseLayout, MAX_TEXT, type Layout, type Template } from "@/lib/layout";
import * as store from "@/lib/store";

export type Result = { ok: boolean; message: string; templates?: Template[] };

async function check(layout: unknown): Promise<{ layout: Layout } | Result> {
  if (!(await auth())) return { ok: false, message: "יש להתחבר מחדש" };
  const r = parseLayout(layout);
  return "error" in r ? { ok: false, message: r.error } : r;
}

// Publish to the live board
export async function publish(layout: unknown): Promise<Result> {
  const r = await check(layout);
  if (!("layout" in r)) return r;
  await store.saveLayout(r.layout);
  revalidatePath("/");
  return { ok: true, message: "הלוח עודכן ✓" };
}

export async function saveTemplate(name: string, layout: unknown): Promise<Result> {
  const r = await check(layout);
  if (!("layout" in r)) return r;
  const n = String(name ?? "").trim().slice(0, MAX_TEXT);
  if (!n) return { ok: false, message: "יש לתת שם לתבנית" };
  await store.saveTemplate(n, r.layout);
  return { ok: true, message: `התבנית "${n}" נשמרה ✓`, templates: await store.getTemplates() };
}

export async function deleteTemplate(name: string): Promise<Result> {
  if (!(await auth())) return { ok: false, message: "יש להתחבר מחדש" };
  await store.deleteTemplate(String(name));
  return { ok: true, message: "התבנית נמחקה", templates: await store.getTemplates() };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
