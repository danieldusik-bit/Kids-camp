"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

interface Registration {
  id: string;
  childName: string;
  childDOB: string;
  childAge: number;
  childPersonalId?: string;
  childLanguage?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  city: string;
  billingName?: string;
  billingId?: string;
  billingAddress?: string;
  billingEmail?: string;
  pickupAuthorized?: string;
  childCanLeaveAlone?: boolean;
  hasAllergies?: boolean;
  allergiesDetails?: string;
  hasChronicIllness?: boolean;
  chronicDetails?: string;
  takesMedication?: boolean;
  medicationDetails?: string;
  physicalActivity?: string;
  physicalLimitations?: string;
  dietRestrictions?: string;
  dietDetails?: string;
  additionalInfo?: string;
  hearAboutUs?: string;
  healthInfo: string;
  internalNotes: string;
  createdAt: string;
  status: string;
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [reg, setReg] = useState<Registration | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const role = (session?.user as any)?.role;
  const canEdit = role === "SUPERADMIN" || role === "MANAGER";
  const canDelete = role === "SUPERADMIN";

  useEffect(() => {
    fetch(`/api/admin/registrations/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setReg(data);
        setStatus(data.status);
        setNotes(data.internalNotes || "");
      });
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/registrations/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
    setSaving(false);
  }

  async function handleDelete() {
    await fetch(`/api/admin/registrations/${params.id}`, { method: "DELETE" });
    router.push("/admin/registrations");
  }

  if (!reg) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Загрузка...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link href="/admin/registrations" className="text-[#1a73e8] hover:underline text-sm mb-4 inline-block">
        &larr; Назад к списку
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Заявка: {reg.childName}
        </h2>

        <SubHeading>Ребёнок</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Имя и фамилия" value={reg.childName} />
          <Field label="Дата рождения" value={reg.childDOB} />
          <Field label="Возраст" value={String(reg.childAge)} />
          <Field label="Персональный код" value={reg.childPersonalId || "—"} />
          <Field label="Язык общения" value={reg.childLanguage || "—"} />
          <Field label="Город" value={reg.city} />
        </div>

        <SubHeading>Родитель / Опекун</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Имя и фамилия" value={reg.parentName} />
          <Field label="Телефон" value={reg.parentPhone} />
          <Field label="Email" value={reg.parentEmail} />
          <Field label="Экстренный контакт" value={reg.emergencyContactName || "—"} />
          <Field label="Телефон экстренного контакта" value={reg.emergencyContactPhone || "—"} />
        </div>

        <SubHeading>Реквизиты для счёта</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Имя / Компания" value={reg.billingName || "—"} />
          <Field label="Персональный код / Рег. номер" value={reg.billingId || "—"} />
          <Field label="Юридический адрес" value={reg.billingAddress || "—"} />
          <Field label="Email для счёта" value={reg.billingEmail || "—"} />
        </div>

        <SubHeading>Забор из лагеря</SubHeading>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Разрешено забирать" value={reg.pickupAuthorized || "—"} />
          <Field
            label="Может покидать лагерь самостоятельно"
            value={reg.childCanLeaveAlone ? "Да" : "Нет"}
          />
        </div>

        <SubHeading>Здоровье</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Аллергии" value={reg.hasAllergies ? `Да — ${reg.allergiesDetails || ""}` : "Нет"} />
          <Field
            label="Хронические заболевания"
            value={reg.hasChronicIllness ? `Да — ${reg.chronicDetails || ""}` : "Нет"}
          />
          <Field
            label="Медикаменты"
            value={reg.takesMedication ? `Да — ${reg.medicationDetails || ""}` : "Нет"}
          />
          <Field
            label="Физическая активность"
            value={
              reg.physicalActivity === "С ограничениями"
                ? `С ограничениями — ${reg.physicalLimitations || ""}`
                : reg.physicalActivity || "—"
            }
          />
          {reg.healthInfo && (
            <div className="md:col-span-2">
              <Field label="Прочая информация о здоровье" value={reg.healthInfo} />
            </div>
          )}
        </div>

        <SubHeading>Питание</SubHeading>
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Ограничения"
            value={
              reg.dietRestrictions === "другое"
                ? `Другое — ${reg.dietDetails || ""}`
                : reg.dietRestrictions || "—"
            }
          />
        </div>

        <SubHeading>Дополнительно</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Дополнительная информация" value={reg.additionalInfo || "—"} />
          <Field label="Откуда узнали" value={reg.hearAboutUs || "—"} />
          <Field label="Дата подачи" value={new Date(reg.createdAt).toLocaleString("ru-RU")} />
        </div>
      </div>

      {/* Status & Notes */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="font-medium text-gray-800 mb-4">Управление заявкой</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!canEdit}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] disabled:bg-gray-100"
          >
            <option value="Новая">Новая</option>
            <option value="Подтверждена">Подтверждена</option>
            <option value="Отклонена">Отклонена</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Внутренние заметки
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!canEdit}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] disabled:bg-gray-100"
            placeholder="Заметки видны только администраторам..."
          />
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2 px-5 rounded-md text-sm disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        )}
      </div>

      {/* Delete */}
      {canDelete && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-medium text-red-600 mb-2">Удаление заявки</h3>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-md text-sm"
            >
              Удалить заявку
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">Вы уверены? Это действие необратимо.</p>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm"
              >
                Да, удалить
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md text-sm"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-6 mb-3 first:mt-0">
      {children}
    </h3>
  );
}
