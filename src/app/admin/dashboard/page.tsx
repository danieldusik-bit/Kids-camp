"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

interface Stats {
  total: number;
  new: number;
  confirmed: number;
  rejected: number;
}

interface Registration {
  id: string;
  childName: string;
  parentName: string;
  parentPhone: string;
  city: string;
  createdAt: string;
  status: string;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Registration[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/registrations?limit=10").then((r) => r.json()).then((d) => setRecent(d.registrations || []));
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Дашборд</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Всего заявок" value={stats?.total} color="bg-gray-50" />
        <StatCard label="Новые заявки" value={stats?.new} color="bg-blue-50" />
        <StatCard label="Подтверждённые" value={stats?.confirmed} color="bg-green-50" />
        <StatCard label="Отклонённые" value={stats?.rejected} color="bg-red-50" />
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium text-gray-800">Последние заявки</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Имя ребёнка</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Родитель</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Телефон</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Город</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Дата подачи</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/registrations/${r.id}`} className="text-[#1a73e8] hover:underline">
                      {r.childName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.parentName}</td>
                  <td className="px-4 py-3">{r.parentPhone}</td>
                  <td className="px-4 py-3">{r.city}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Заявок пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className={`${color} rounded-lg p-5`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-semibold text-gray-800 mt-1">{value ?? "—"}</p>
    </div>
  );
}
