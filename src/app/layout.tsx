import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Детский лагерь 2026 — Регистрация",
  description: "Регистрация в детский лагерь 2026",
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
