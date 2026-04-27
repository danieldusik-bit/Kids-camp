"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";
import {
  Hero,
  Kpi,
  KpiRow,
  AppCard,
  GenderDonut,
  AgeDonut,
  CAMPS_META,
  type CampKey,
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

export default function CampPage() {
  const params = useParams();
  const campRaw = String(params.camp || "");
  const camp =
    campRaw === "kids" || campRaw === "teens" ? (campRaw as CampKey) : null;
  if (!camp) notFound();

  const meta = CAMPS_META[camp];
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/registrations?camp=${camp}`);
    const data = await res.json();
    setRegistrations(data.registrations || []);
    setLoading(false);
  }, [camp]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) =>
      `${r.childName} ${r.parentName} ${r.city}`.toLowerCase().includes(q)
    );
  }, [registrations, search]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      n: registrations.filter((r) => r.status === "Новая").length,
      c: registrations.filter((r) => r.status === "Подтверждена").length,
      r: registrations.filter((r) => r.status === "Отклонена").length,
    };
  }, [registrations]);

  return (
    <AdminLayout
      hero={
        <Hero
          title={`${meta.label} лагерь`}
          subtitle={`${meta.dates} · Norkalni`}
          action={
            <button
              type="button"
              className="vd-btn vd-btn-primary"
              onClick={() => exportCamp(camp)}
            >
              Экспорт CSV
            </button>
          }
        />
      }
    >
      <KpiRow>
        <Kpi label="Всего заявок" value={stats.total} tone="warm" icon="📋" />
        <Kpi label="Новые" value={stats.n} tone="blue" icon="✨" />
        <Kpi label="Подтверждённые" value={stats.c} tone="green" icon="✓" />
        <Kpi label="Отклонённые" value={stats.r} tone="red" icon="!" />
      </KpiRow>

      <div className="vd-charts">
        <section className="vd-card">
          <div className="vd-block-head">
            <h2>По полу</h2>
            <span className="vd-mute">{meta.label.toLowerCase()}</span>
          </div>
          <GenderDonut apps={registrations} />
        </section>
        <section className="vd-card">
          <div className="vd-block-head">
            <h2>По возрасту</h2>
            <span className="vd-mute">{meta.label.toLowerCase()}</span>
          </div>
          <AgeDonut apps={registrations} />
        </section>
      </div>

      <div className="vd-toolbar">
        <input
          className="vd-search"
          style={{ maxWidth: 320, padding: "10px 14px" }}
          placeholder="Поиск по имени, родителю или городу…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="vd-block">
        <div className="vd-block-head">
          <h2>Все заявки в смену</h2>
          <span className="vd-mute">
            {filtered.length} из {registrations.length}
          </span>
        </div>
        {loading ? (
          <div className="vd-empty">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="vd-empty">
            {search ? "Ничего не найдено." : "Заявок пока нет."}
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

async function exportCamp(camp: CampKey) {
  const res = await fetch(`/api/admin/registrations?camp=${camp}`);
  const data = await res.json();
  const rows: any[] = data.registrations || [];
  const headers = [
    "Имя ребёнка",
    "Пол",
    "Возраст",
    "Дата рождения",
    "Родитель",
    "Телефон",
    "Email",
    "Город",
    "В одной группе с",
    "Дата подачи",
    "Статус",
  ];
  const escape = (val: any) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.childName,
        r.childGender,
        r.childAge,
        r.childDOB,
        r.parentName,
        r.parentPhone,
        r.parentEmail,
        r.city,
        r.groupWith,
        new Date(r.createdAt).toLocaleString("ru-RU"),
        r.status,
      ]
        .map(escape)
        .join(",")
    );
  }
  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${camp}-registrations.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
