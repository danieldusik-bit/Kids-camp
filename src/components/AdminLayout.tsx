"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/registrations", label: "Заявки" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold text-gray-800">
            Детский лагерь 2026
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white min-h-[calc(100vh-52px)] border-r">
          <nav className="py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-2.5 text-sm ${
                  pathname === item.href || pathname?.startsWith(item.href + "/")
                    ? "bg-blue-50 text-[#1a73e8] font-medium border-r-2 border-[#1a73e8]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {role === "SUPERADMIN" && (
              <Link
                href="/admin/users"
                className={`block px-6 py-2.5 text-sm ${
                  pathname === "/admin/users"
                    ? "bg-blue-50 text-[#1a73e8] font-medium border-r-2 border-[#1a73e8]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Пользователи
              </Link>
            )}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
