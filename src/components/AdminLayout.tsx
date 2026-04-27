"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const FULL_NAV = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/registrations", label: "Все заявки" },
  { href: "/admin/camps/kids", label: "🏕️ Детский лагерь" },
  { href: "/admin/camps/teens", label: "🔥 Подростковый лагерь" },
  { href: "/admin/teams", label: "👥 Команды" },
];

const MENTOR_NAV = [{ href: "/admin/teams", label: "👥 Мои команды" }];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const role = (session?.user as any)?.role;

  // Mentor: redirect away from forbidden pages.
  useEffect(() => {
    if (!session) return;
    if (role === "MENTOR") {
      const allowed =
        pathname?.startsWith("/admin/teams") ||
        pathname === "/admin" ||
        pathname === "/admin/login";
      if (!allowed) {
        router.replace("/admin/teams");
      }
    }
  }, [session, role, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!session) return null;

  const navItems = role === "MENTOR" ? MENTOR_NAV : FULL_NAV;
  const showUsersLink = role === "SUPERADMIN";

  const roleLabel: Record<string, string> = {
    SUPERADMIN: "Суперадмин",
    MANAGER: "Менеджер",
    MENTOR: "Наставник",
    VIEWER: "Просмотр",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold text-gray-800">
            Летние лагеря 2026
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-700">{session.user?.name}</div>
              <div className="text-xs text-gray-500">
                {roleLabel[role] || role || ""}
              </div>
            </div>
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
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/")
                    ? "bg-blue-50 text-[#1a73e8] font-medium border-r-2 border-[#1a73e8]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {showUsersLink && (
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
