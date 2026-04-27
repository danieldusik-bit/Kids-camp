"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";
import {
  Hero,
  Kpi,
  KpiRow,
  AppCard,
} from "@/components/admin/primitives";

interface Registration {
  id: string;
  camp?: string;
  childName: string;
  childGender?: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  city: string;
  createdAt: string;
  status: string;
}

type StatusFilter = "all" | "Новая" | "Подтверждена" | "Отклонена";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    const data = await res.json();
    setRegistrations(data.registrations || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      n: registrations.filter((r) => r.status === "Новая").length,
      c: registrations.filter((r) => r.status === "Подтверждена").length,
      r: registrations.filter((r) => r.status === "Отклонена").length,
    };
  }, [registrations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registrations.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q) {
        const hay = `${r.childName} ${r.parentName} ${r.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, search, filter]);

  return (
    <AdminLayout
      hero={
        <Hero
          title="Все заявки"
          subtitle="Заявки из обеих смен."
          action={
            <a
              href="/api/admin/registrations/export"
              className="vd-btn vd-btn-primary"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Экспорт CSV
            </a>
          }
        />
      }
    >
      <KpiRow>
        <Kpi label="Всего" value={stats.total} tone="warm" icon="📋" />
        <Kpi label="Новые" value={stats.n} tone="blue" icon="✨" />
        <Kpi
          label="Подтверждённые"
          value={stats.c}
          tone="green"
          icon="✓"
        />
        <Kpi label="Отклонённые" value={stats.r} tone="red" icon="!" />
      </KpiRow>

      <div className="vd-toolbar">
        <input
          className="vd-search"
          style={{ maxWidth: 320, padding: "10px 14px" }}
          placeholder="Поиск по имени, родителю или городу…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="vd-seg" role="tablist">
          {([
            ["all", "Все"],
            ["Новая", "Новые"],
            ["Подтверждена", "Подтверждены"],
            ["Отклонена", "Отклонены"],
          ] as [StatusFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={filter === key ? "vd-seg-on" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="vd-block">
        {loading ? (
          <div className="vd-empty">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="vd-empty">
            {search || filter !== "all"
              ? "Ничего не найдено по выбранным фильтрам."
              : "Заявок пока нет."}
          </div>
        ) : (
          <div className="vd-app-list">
            {filtered.map((r) => (
              <AppCard
                key={r.id}
                application={r}
                onClick={() => setOpenId(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      <RegistrationModal
        registrationId={openId}
        onClose={() => setOpenId(null)}
        onChanged={refresh}
        onDeleted={refresh}
      />
    </AdminLayout>
  );
}
