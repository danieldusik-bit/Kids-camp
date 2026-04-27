"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/admin.css";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  countKey?: "all" | "kids" | "teens";
  accent?: string;
};

const FULL_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Дашборд", icon: "◈" },
  { href: "/admin/registrations", label: "Все заявки", icon: "☰", countKey: "all" },
  {
    href: "/admin/camps/kids",
    label: "Детский",
    icon: "🌲",
    countKey: "kids",
    accent: "#3a8a55",
  },
  {
    href: "/admin/camps/teens",
    label: "Подростковый",
    icon: "🔥",
    countKey: "teens",
    accent: "#c25b3a",
  },
  { href: "/admin/teams", label: "Команды", icon: "◐" },
];

const MENTOR_NAV: NavItem[] = [
  { href: "/admin/teams", label: "Мои команды", icon: "◐" },
];

type Props = {
  children: React.ReactNode;
  hero?: React.ReactNode;
  /** When true, hide the search box in the topbar (e.g. on tiny pages). */
  hideSearch?: boolean;
};

export default function AdminLayout({ children, hero }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ all: number; kids: number; teens: number } | null>(null);

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
      if (!allowed) router.replace("/admin/teams");
    }
  }, [session, role, pathname, router]);

  // Fetch nav counts (only for non-mentor roles).
  useEffect(() => {
    if (!session || role === "MENTOR") return;
    (async () => {
      try {
        const res = await fetch("/api/admin/registrations");
        const data = await res.json();
        const regs: { camp?: string }[] = data.registrations || [];
        const kids = regs.filter((r) => r.camp === "kids").length;
        const teens = regs.filter((r) => r.camp === "teens").length;
        setCounts({ all: regs.length, kids, teens });
      } catch {
        /* ignore */
      }
    })();
  }, [session, role, pathname]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#8b867a",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!session) return null;

  const navItems = role === "MENTOR" ? MENTOR_NAV : FULL_NAV;
  const showUsersLink = role === "SUPERADMIN";

  const roleLabelMap: Record<string, string> = {
    SUPERADMIN: "Суперадмин",
    MANAGER: "Менеджер",
    MENTOR: "Наставник",
    VIEWER: "Просмотр",
  };
  const roleLabel = roleLabelMap[role] || role || "";

  const userName = session.user?.name || "—";
  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function navCount(key?: NavItem["countKey"]) {
    if (!key || !counts) return undefined;
    return counts[key];
  }

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <div className="vd-root">
      {/* Sidebar */}
      <aside className="vd-side">
        <div className="vd-brand">
          <div className="vd-brand-mark">☀</div>
          <div>
            <div className="vd-brand-name">Летние лагеря</div>
            <div className="vd-brand-sub">2026</div>
          </div>
        </div>

        <nav className="vd-nav">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const c = navCount(item.countKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`vd-nav-item ${active ? "vd-nav-on" : ""}`}
                style={
                  active && item.accent
                    ? ({ "--vd-active": item.accent } as React.CSSProperties)
                    : undefined
                }
              >
                <span className="vd-nav-icon">{item.icon}</span>
                <span className="vd-nav-lbl">{item.label}</span>
                {c != null && <span className="vd-nav-count">{c}</span>}
              </Link>
            );
          })}
          {showUsersLink && (
            <Link
              href="/admin/users"
              className={`vd-nav-item ${
                pathname === "/admin/users" ? "vd-nav-on" : ""
              }`}
            >
              <span className="vd-nav-icon">◉</span>
              <span className="vd-nav-lbl">Пользователи</span>
            </Link>
          )}
        </nav>

        {role !== "MENTOR" && (
          <div className="vd-side-card">
            <div className="vd-side-card-head">Сезон 2026</div>
            <div className="vd-side-card-row">
              <span>Детский</span>
              <strong>28.06 – 4.07</strong>
            </div>
            <div className="vd-side-card-row">
              <span>Подростковый</span>
              <strong>26.07 – 1.08</strong>
            </div>
            <div className="vd-side-card-row">
              <span>Место</span>
              <strong>Norkalni</strong>
            </div>
          </div>
        )}

        <button
          type="button"
          className="vd-signout"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          ⏏ Выйти
        </button>
      </aside>

      {/* Main */}
      <main className="vd-main">
        <header className="vd-topbar">
          <div className="vd-search-wrap">
            <span className="vd-search-icon">🔍</span>
            <input
              className="vd-search"
              placeholder="Поиск ребёнка, родителя или города…"
              disabled
              aria-label="Поиск"
            />
          </div>
          <div className="vd-topbar-right">
            <button className="vd-iconbtn" type="button" aria-label="Уведомления">
              🔔
              <span className="vd-dot" />
            </button>
            <div className="vd-user">
              <div className="vd-user-av">{initials || "АД"}</div>
              <div>
                <div className="vd-user-name">{userName}</div>
                <div className="vd-user-role">{roleLabel}</div>
              </div>
            </div>
          </div>
        </header>

        {hero}

        <div className="vd-content">{children}</div>
      </main>
    </div>
  );
}
