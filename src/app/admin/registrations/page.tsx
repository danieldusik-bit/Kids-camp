"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

interface Registration {
  id: string;
  camp?: string;
  childName: string;
  childDOB: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  city: string;
  healthInfo: string;
  createdAt: string;
  status: string;
}

function CampBadge({ camp }: { camp?: string }) {
  if (camp === "teens")
    return (
      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
        🔥 Подростки
      </span>
    );
  if (camp === "kids")
    return (
      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
        🏕️ Дети
      </span>
    );
  return <span className="text-xs text-gray-400">—</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Новая": "bg-blue-100 text-blue-800",
    "Подтверждена": "bg-green-100 text-green-800",
    "Отклонена": "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    const data = await res.json();
    setRegistrations(data.registrations || []);
    setLoading(false);
  }

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.childName.toLowerCase().includes(q) ||
      r.parentName.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  async function exportCSV() {
    const res = await fetch("/api/admin/registrations/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Заявки</h2>
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Экспорт CSV
        </button>
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
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Лагерь</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Имя ребёнка</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Дата рождения</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Возраст</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Родитель</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Телефон</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Email</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Город</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Здоровье</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Дата подачи</th>
              <th className="px-3 py-3 text-left text-gray-600 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  Загрузка...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  {search ? "Ничего не найдено" : "Заявок пока нет"}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-3 py-3"><CampBadge camp={r.camp} /></td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/registrations/${r.id}`} className="text-[#1a73e8] hover:underline">
                      {r.childName}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{r.childDOB}</td>
                  <td className="px-3 py-3">{r.childAge}</td>
                  <td className="px-3 py-3">{r.parentName}</td>
                  <td className="px-3 py-3">{r.parentPhone}</td>
                  <td className="px-3 py-3">{r.parentEmail}</td>
                  <td className="px-3 py-3">{r.city}</td>
                  <td className="px-3 py-3 max-w-[200px] truncate" title={r.healthInfo}>{r.healthInfo}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
