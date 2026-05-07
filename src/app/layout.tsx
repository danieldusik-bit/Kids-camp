import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Лагеря 2026 — Регистрация",
  description:
    "Детский (6–12) и подростковый (13–18) христианские лагеря — лето 2026, Norkalni.",
  openGraph: {
    title: "Лагеря 2026 — Регистрация",
    description:
      "Детский (6–12) и подростковый (13–18) христианские лагеря — лето 2026, Norkalni.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title: "Лагеря 2026 — Регистрация",
    description:
      "Детский (6–12) и подростковый (13–18) христианские лагеря — лето 2026, Norkalni.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
