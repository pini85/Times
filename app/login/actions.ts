"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string; username: string } | null;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "");
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
