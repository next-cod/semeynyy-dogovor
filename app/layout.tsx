import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Forum } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const forum = Forum({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-forum",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Наталья Батаева - Семейный финансовый договор",
  description:
    "Интерактивный чек-лист Натальи Батаевой для составления семейного финансового договора - аудит доходов и расходов, взрослые договоренности и общий план на 90 дней.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${cormorant.variable} ${forum.variable} checklist-root`}>
        {children}
      </body>
    </html>
  );
}
