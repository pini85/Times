"use server";
import { AuthError } from "next-auth";
import { admins, signIn } from "@/auth";

export type LoginState = { error: string; username: string } | null;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "");
  if (admins().size === 0) {
    return {
      error: "לא הוגדר מנהל. ב־Vercel הוסיפו משתנה ADMIN_USERS עם הערך שם:סיסמה (למשל pini:123) ופרסו מחדש (Redeploy).",
      username,
    };
  }
  try {
    await signIn("credentials", {
      username,
      password: form.get("password"),
      redirectTo: "/admin",
    });
    return null;
  } catch (e) {
    // keep the username so the user only retypes the password
    if (e instanceof AuthError) return { error: "שם משתמש או סיסמה שגויים", username };
    throw e; // lets the redirect through
  }
}
