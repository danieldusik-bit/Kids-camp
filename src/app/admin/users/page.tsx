"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" });
  const [error, setError] = useState("");

  const role = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (role && role !== "SUPERADMIN") {
      router.push("/admin/dashboard");
    }
  }, [role, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  function openCreateModal() {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "VIEWER" });
    setError("");
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (editUser) {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка");
        return;
      }
    } else {
      if (!form.password) {
        setError("Пароль обязателен");
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка");
        return;
      }
    }

    setShowModal(false);
    fetchUsers();
  }

  async function toggleActive(user: User) {
    if (user.id === currentUserId) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  }

  const roleLabels: Record<string, string> = {
    SUPERADMIN: "Суперадмин",
    MANAGER: "Менеджер",
    VIEWER: "Просмотр",
  };

  if (role !== "SUPERADMIN") return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Пользователи</h2>
        <button
          onClick={openCreateModal}
          className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Добавить пользователя
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Имя</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Роль</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Статус</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{roleLabels[u.role] || u.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {u.isActive ? "Активен" : "Деактивирован"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="text-[#1a73e8] hover:underline text-sm"
                    >
                      Изменить
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => toggleActive(u)}
                        className={`text-sm hover:underline ${u.isActive ? "text-red-600" : "text-green-600"}`}
                      >
                        {u.isActive ? "Деактивировать" : "Активировать"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editUser ? "Редактировать пользователя" : "Добавить пользователя"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль {editUser && "(оставьте пустым, чтобы не менять)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  {...(!editUser ? { required: true } : {})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                >
                  <option value="SUPERADMIN">Суперадмин</option>
                  <option value="MANAGER">Менеджер</option>
                  <option value="VIEWER">Просмотр</option>
                </select>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2 px-5 rounded-md text-sm"
                >
                  {editUser ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-5 rounded-md text-sm"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
