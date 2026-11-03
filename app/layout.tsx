import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-frank",
});

export const metadata: Metadata = { title: "זמני תפילות" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#3a0a10" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={frank.variable}>
      <body>{children}</body>
    </html>
  );
}
