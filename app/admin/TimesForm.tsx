"use client";
import { useActionState } from "react";
import { SLOTS, type Times } from "@/lib/slots";
import { save } from "./actions";

export default function TimesForm({ initial }: { initial: Times }) {
  const [state, action, pending] = useActionState(save, null);
  const groups = [...new Set(SLOTS.map((s) => s.group))];
  return (
    <form action={action}>
      {groups.map((g) => (
        <section key={g}>
          <h2>{g}</h2>
          {SLOTS.filter((s) => s.group === g).map((s) => (
            <div className="field" key={s.id}>
              <label htmlFor={s.id}>{s.label}</label>
              <input id={s.id} name={s.id} type="time" required defaultValue={initial[s.id]} />
            </div>
          ))}
        </section>
      ))}
      <div className="row">
        <button disabled={pending}>{pending ? "שומר…" : "שמירה"}</button>
        <a className="btn btn-secondary" href="/" target="_blank">צפייה בלוח</a>
      </div>
      {state && <p className={`msg ${state.ok ? "ok" : "err"}`}>{state.message}</p>}
    </form>
  );
}
