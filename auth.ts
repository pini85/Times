import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";

// ADMIN_USERS="name:password,name2:password2"
function admins(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (process.env.ADMIN_USERS ?? "").split(",")) {
    const i = pair.indexOf(":");
    if (i > 0) map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
  return map;
}

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: async (c) => {
        const username = String(c?.username ?? "");
        const password = String(c?.password ?? "");
        const expected = admins().get(username);
        if (!expected || !same(password, expected)) return null;
        return { id: username, name: username };
      },
    }),
  ],
});
