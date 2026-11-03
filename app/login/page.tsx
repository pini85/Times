"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="panel-page">
      <form className="panel stack" action={action}>
        <h1>כניסת מנהל</h1>
        <label>שם משתמש
          <input name="username" defaultValue={state?.username} key={state?.username} autoComplete="username" required dir="ltr" />
        </label>
        <label>סיסמה
          <input name="password" type="password" autoComplete="current-password" required dir="ltr" />
        </label>
        <button disabled={pending}>{pending ? "נכנס…" : "כניסה"}</button>
        {state && <p className="msg err">{state.error}</p>}
      </form>
    </main>
  );
}
