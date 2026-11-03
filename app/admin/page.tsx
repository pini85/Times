import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLayout, getTemplates } from "@/lib/store";
import { logout } from "./actions";
import LayoutEditor from "./LayoutEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const [layout, templates] = await Promise.all([getLayout(), getTemplates()]);
  return (
    <main className="panel-page">
      <div className="panel panel-wide">
        <div className="topbar">
          <span>שלום, {session.user?.name}</span>
          <span className="topbar-links">
            <a href="/" target="_blank">צפייה בלוח</a>
            <form action={logout}><button className="btn-secondary">יציאה</button></form>
          </span>
        </div>
        <h1>עריכת לוח זמני תפילות</h1>
        <p className="sub">ערכו את הכותרות, השורות והזמנים, ולחצו &quot;פרסום ללוח&quot;</p>
        <LayoutEditor initial={layout} initialTemplates={templates} />
      </div>
    </main>
  );
}
