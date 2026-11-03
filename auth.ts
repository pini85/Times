import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash, timingSafeEqual } from "crypto";

// Read an env var by name, ignoring upper/lower case ("ADMIN_USERS" or "admin_users").
function env(...names: string[]): string | undefined {
  const wanted = names.map((n) => n.toLowerCase());
  for (const [k, v] of Object.entries(process.env)) {
    if (v && v.trim() && wanted.includes(k.toLowerCase())) return v.trim();
  }
  return undefined;
}

// Admins come from Vercel environment variables. Any of these work:
//   ADMIN_USERS = "pini:123"   (several: "pini:123,david:456")
//   ADMIN_USERNAME = "pini" + ADMIN_PASSWORD = "123"   (also ADMIN_USER/ADMIN_PASS, ADMIN/PASSWORD)
// Usernames ignore upper/lower case.
export function admins(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (env("ADMIN_USERS", "ADMINS") ?? "").split(/[,;\n]/)) {
    const m = pair.match(/^\s*([^:=]+?)\s*[:=]\s*(.+?)\s*$/);
    if (m) map.set(m[1].toLowerCase(), m[2]);
  }
  const user = env("ADMIN_USERNAME", "ADMIN_USER", "ADMIN_NAME", "ADMIN");
  const pass = env("ADMIN_PASSWORD", "ADMIN_PASS", "PASSWORD");
  if (user && pass) map.set(user.toLowerCase(), pass);
  return map;
}

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// AUTH_SECRET signs the login cookie. If it isn't set, derive one from the
// admin settings so login still works; set AUTH_SECRET for a stronger one.
const secret =
  env("AUTH_SECRET", "NEXTAUTH_SECRET") ??
  createHash("sha256").update("times-board:" + JSON.stringify([...admins()])).digest("hex");

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: async (c) => {
        const username = String(c?.username ?? "").trim();
        const password = String(c?.password ?? "").trim();
        const expected = admins().get(username.toLowerCase());
        if (!expected || !same(password, expected)) return null;
        return { id: username, name: username };
      },
    }),
  ],
});
