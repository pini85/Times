import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTimes } from "@/lib/store";
import { logout } from "./actions";
import TimesForm from "./TimesForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <main className="panel-page">
      <div className="panel">
        <div className="topbar">
          <span>שלום, {session.user?.name}</span>
          <form action={logout}><button className="btn-secondary">יציאה</button></form>
        </div>
        <h1>עדכון זמני תפילות</h1>
        <p className="sub">השינויים יופיעו בלוח מיד</p>
        <TimesForm initial={await getTimes()} />
      </div>
    </main>
  );
}
