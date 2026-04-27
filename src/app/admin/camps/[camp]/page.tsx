"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import RegistrationModal from "@/components/RegistrationModal";
import PieChart, { type PieSegment } from "@/components/PieChart";

interface Registration {
  id: string;
  camp?: string;
  childName: string;
  childGender?: string;
  childDOB: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  city: string;
  groupWith?: string;
  createdAt: string;
  status: string;
}

const META: Record<
  "kids" | "teens",
  {
    label: string;
    dates: string;
    emoji: string;
    primary: string;
    primarySoft: string;
  }
> = {
  kids: {
    label: "Детский лагерь",
    dates: "28 июня — 4 июля 2026",
    emoji: "🏕️",
    primary: "#4a89d5",
    primarySoft: "#d5e4f7",
  },
  teens: {
    label: "Подростковый лагерь",
    dates: "26 июля — 1 августа 2026",
    emoji: "🔥",
    primary: "#e07a3a",
    primarySoft: "#fbe2cf",
  },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Новая: "bg-blue-100 text-blue-800",
    Подтверждена: "bg-green-100 text-green-800",
    Отклонена: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

export default function CampPage() {
  const params = useParams();
  const campRaw = String(params.camp || "");
  const camp = campRaw === "kids" || campRaw === "teens" ? campRaw : null;
  if (!camp) notFound();

  const meta = META[camp];
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

  const filtered = useMemo(
    () =>
      registrations.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.childName.toLowerCase().includes(q) ||
          r.parentName.toLowerCase().includes(q) ||
          (r.city || "").toLowerCase().includes(q)
        );
      }),
    [registrations, search]
  );

  const stats = useMemo(() => {
    const total = registrations.length;
    let n = 0,
      c = 0,
      x = 0;
    for (const r of registrations) {
      if (r.status === "Новая") n++;
      else if (r.status === "Подтверждена") c++;
      else if (r.status === "Отклонена") x++;
    }
    return { total, n, c, x };
  }, [registrations]);

  const genderSegments = useMemo<PieSegment[]>(() => {
    let boys = 0,
      girls = 0,
      unknown = 0;
    for (const r of registrations) {
      if (r.childGender === "Мальчик") boys++;
      else if (r.childGender === "Девочка") girls++;
      else unknown++;
    }
    return [
      { label: "👦 Мальчики", value: boys, color: "#4a89d5" },
      { label: "👧 Девочки", value: girls, color: "#e879b4" },
      ...(unknown > 0
        ? [{ label: "Не указан", value: unknown, color: "#cbd5e1" }]
        : []),
    ];
  }, [registrations]);

  const ageSegments = useMemo<PieSegment[]>(() => {
    const buckets: Record<string, number> = {};
    const order: string[] = [];
    for (const r of registrations) {
      const a = r.childAge;
      let key: string;
      if (!a || a < 1) key = "Не указан";
      else if (a <= 8) key = "7 – 8 лет";
      else if (a <= 10) key = "9 – 10 лет";
      else if (a <= 12) key = "11 – 12 лет";
      else if (a <= 14) key = "13 – 14 лет";
      else if (a <= 16) key = "15 – 16 лет";
      else key = "17+ лет";
      if (!(key in buckets)) {
        buckets[key] = 0;
        order.push(key);
      }
      buckets[key]++;
    }
    const palette = [
      "#4a89d5",
      "#5fb6c4",
      "#8bc36a",
      "#f1c66a",
      "#e89e58",
      "#d76b6b",
      "#9aa4b8",
    ];
    // Stable order by youngest → oldest
    const sortKey = (k: string) => {
      const m = k.match(/^(\d+)/);
      return m ? parseInt(m[1]) : 999;
    };
    order.sort((a, b) => sortKey(a) - sortKey(b));
    return order.map((label, i) => ({
      label,
      value: buckets[label],
      color: palette[i % palette.length],
    }));
  }, [registrations]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            {meta.label}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta.dates}</p>
        </div>
        <a
          href={`/api/admin/registrations/export?camp=${camp}`}
          onClick={(e) => {
            e.preventDefault();
            exportCamp(camp);
          }}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer"
        >
          Экспорт CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Всего заявок" value={stats.total} bg="bg-gray-50" />
        <StatCard label="Новые" value={stats.n} bg="bg-blue-50" />
        <StatCard label="Подтверждённые" value={stats.c} bg="bg-green-50" />
        <StatCard label="Отклонённые" value={stats.x} bg="bg-red-50" />
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PieChart title="По полу" segments={genderSegments} />
        <PieChart title="По возрасту" segments={ageSegments} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по имени ребёнка, родителя или городу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Имя ребёнка
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Пол
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Возраст
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Родитель
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Телефон
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Город
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Подача
              </th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Загрузка...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {search ? "Ничего не найдено" : "Заявок пока нет"}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="text-[#1a73e8] hover:underline text-left"
                    >
                      {r.childName}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    {r.childGender === "Мальчик"
                      ? "👦"
                      : r.childGender === "Девочка"
                      ? "👧"
                      : "—"}
                  </td>
                  <td className="px-3 py-3">{r.childAge || "—"}</td>
                  <td className="px-3 py-3">{r.parentName}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.parentPhone}
                  </td>
                  <td className="px-3 py-3">{r.city}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RegistrationModal
        registrationId={openId}
        onClose={() => setOpenId(null)}
        onChanged={refresh}
        onDeleted={refresh}
      />
    </AdminLayout>
  );
}

async function exportCamp(camp: "kids" | "teens") {
  // The export endpoint currently exports all registrations.
  // We download all and let admin filter — but for clarity, fetch
  // filtered list and build CSV on the fly here.
  const res = await fetch(`/api/admin/registrations?camp=${camp}`);
  const data = await res.json();
  const rows: Registration[] = data.registrations || [];

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

function StatCard({
  label,
  value,
  bg,
}: {
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-5`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-semibold text-gray-800 mt-1 tabular-nums">
        {value}
      </p>
    </div>
  );
}
