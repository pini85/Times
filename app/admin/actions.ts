"use server";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { SLOTS, TIME_RE, type Times } from "@/lib/slots";
import { saveTimes } from "@/lib/store";

export type SaveState = { ok: boolean; message: string } | null;

export async function save(_: SaveState, form: FormData): Promise<SaveState> {
  if (!(await auth())) return { ok: false, message: "יש להתחבר מחדש" };
  const times = {} as Times;
  for (const s of SLOTS) {
    const v = String(form.get(s.id) ?? "").trim();
    if (!TIME_RE.test(v)) return { ok: false, message: `שעה לא תקינה: ${s.label}` };
    times[s.id] = v;
  }
  await saveTimes(times);
  revalidatePath("/");
  return { ok: true, message: "הזמנים נשמרו ✓" };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
