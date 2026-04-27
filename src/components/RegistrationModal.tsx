"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Registration {
  id: string;
  camp?: string;
  groupWith?: string;
  childName: string;
  childDOB: string;
  childAge: number;
  childPersonalId?: string;
  childLanguage?: string;
  childGender?: string;
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

const CAMP_LABEL: Record<string, string> = {
  kids: "Детский лагерь (28.06 – 4.07)",
  teens: "Подростковый лагерь (26.07 – 1.08)",
};

type Props = {
  registrationId: string | null;
  onClose: () => void;
  onChanged?: () => void;
  onDeleted?: () => void;
};

export default function RegistrationModal({
  registrationId,
  onClose,
  onChanged,
  onDeleted,
}: Props) {
  const { data: session } = useSession();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const role = (session?.user as any)?.role;
  const canEdit = role === "SUPERADMIN" || role === "MANAGER";
  const canDelete = role === "SUPERADMIN";

  // Fetch when id changes
  useEffect(() => {
    if (!registrationId) {
      setReg(null);
      setShowDelete(false);
      return;
    }
    setLoading(true);
    setReg(null);
    fetch(`/api/admin/registrations/${registrationId}`)
      .then((r) => r.json())
      .then((data) => {
        setReg(data);
        setStatus(data.status);
        setNotes(data.internalNotes || "");
      })
      .finally(() => setLoading(false));
  }, [registrationId]);

  // ESC closes
  useEffect(() => {
    if (!registrationId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [registrationId, onClose]);

  if (!registrationId) return null;

  async function handleSave() {
    if (!registrationId) return;
    setSaving(true);
    await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    onChanged?.();
  }

  async function handleDelete() {
    if (!registrationId) return;
    await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "DELETE",
    });
    onDeleted?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white w-full sm:max-w-3xl sm:m-6 sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-7 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {reg ? `Заявка: ${reg.childName}` : "Загрузка..."}
            </h2>
            {reg && (
              <p className="text-xs text-gray-500 mt-0.5">
                {CAMP_LABEL[reg.camp || ""] || reg.camp || "—"} · подана{" "}
                {new Date(reg.createdAt).toLocaleString("ru-RU")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex-shrink-0 -mr-2 -mt-1 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 sm:px-7 py-5 flex-1">
          {loading || !reg ? (
            <p className="text-gray-500 text-sm">Загрузка...</p>
          ) : (
            <>
              <SubHeading>Лагерь</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Смена"
                  value={CAMP_LABEL[reg.camp || ""] || reg.camp || "—"}
                />
                <Field
                  label="В одной группе с"
                  value={reg.groupWith || "—"}
                />
              </div>

              <SubHeading>Ребёнок</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Имя и фамилия" value={reg.childName} />
                <Field label="Пол" value={reg.childGender || "—"} />
                <Field label="Дата рождения" value={reg.childDOB} />
                <Field label="Возраст" value={String(reg.childAge)} />
                <Field
                  label="Язык общения"
                  value={reg.childLanguage || "—"}
                />
                <Field label="Город" value={reg.city} />
              </div>

              <SubHeading>Родитель / Опекун</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Имя и фамилия" value={reg.parentName} />
                <Field
                  label="Телефон"
                  value={
                    reg.parentPhone ? (
                      <a
                        href={`tel:+371${reg.parentPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        +371 {reg.parentPhone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  label="Email"
                  value={
                    reg.parentEmail ? (
                      <a
                        href={`mailto:${reg.parentEmail}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {reg.parentEmail}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  label="Экстренный контакт"
                  value={reg.emergencyContactName || "—"}
                />
                <Field
                  label="Телефон экстренного"
                  value={reg.emergencyContactPhone || "—"}
                />
              </div>

              {(reg.billingName ||
                reg.billingId ||
                reg.billingAddress ||
                reg.billingEmail) && (
                <>
                  <SubHeading>Реквизиты для счёта (старая форма)</SubHeading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Имя / Компания" value={reg.billingName || "—"} />
                    <Field
                      label="Персональный код / Рег. номер"
                      value={reg.billingId || "—"}
                    />
                    <Field
                      label="Юридический адрес"
                      value={reg.billingAddress || "—"}
                    />
                    <Field
                      label="Email для счёта"
                      value={reg.billingEmail || "—"}
                    />
                  </div>
                </>
              )}

              <SubHeading>Забор из лагеря</SubHeading>
              <div className="grid grid-cols-1 gap-4">
                <Field
                  label="Разрешено забирать"
                  value={reg.pickupAuthorized || "—"}
                />
                <Field
                  label="Может покидать лагерь самостоятельно"
                  value={reg.childCanLeaveAlone ? "Да" : "Нет"}
                />
              </div>

              <SubHeading>Здоровье</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Аллергии"
                  value={
                    reg.hasAllergies
                      ? `Да${reg.allergiesDetails ? " — " + reg.allergiesDetails : ""}`
                      : "Нет"
                  }
                />
                <Field
                  label="Хронические заболевания"
                  value={
                    reg.hasChronicIllness
                      ? `Да${reg.chronicDetails ? " — " + reg.chronicDetails : ""}`
                      : "Нет"
                  }
                />
                <Field
                  label="Медикаменты"
                  value={
                    reg.takesMedication
                      ? `Да${reg.medicationDetails ? " — " + reg.medicationDetails : ""}`
                      : "Нет"
                  }
                />
                <Field
                  label="Физическая активность"
                  value={
                    reg.physicalActivity === "С ограничениями"
                      ? `С ограничениями${reg.physicalLimitations ? " — " + reg.physicalLimitations : ""}`
                      : reg.physicalActivity || "—"
                  }
                />
                {reg.healthInfo && (
                  <div className="md:col-span-2">
                    <Field
                      label="Прочая информация о здоровье"
                      value={reg.healthInfo}
                    />
                  </div>
                )}
              </div>

              <SubHeading>Питание</SubHeading>
              <div className="grid grid-cols-1 gap-4">
                <Field
                  label="Ограничения"
                  value={
                    reg.dietRestrictions === "другое"
                      ? `Другое${reg.dietDetails ? " — " + reg.dietDetails : ""}`
                      : reg.dietRestrictions || "—"
                  }
                />
              </div>

              <SubHeading>Дополнительно</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Дополнительная информация"
                  value={reg.additionalInfo || "—"}
                />
                <Field label="Откуда узнали" value={reg.hearAboutUs || "—"} />
              </div>

              {/* Management */}
              <SubHeading>Управление заявкой</SubHeading>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Внутренние заметки
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] disabled:bg-gray-100"
                    placeholder="Заметки видны только администраторам..."
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {reg && (
          <div className="border-t border-gray-200 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
            <div className="flex items-center gap-3">
              {canDelete &&
                (showDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Уверены?</span>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded-md text-xs"
                    >
                      Да, удалить
                    </button>
                    <button
                      onClick={() => setShowDelete(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1.5 px-3 rounded-md text-xs"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Удалить заявку
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {savedFlash && (
                <span className="text-xs text-green-700 font-medium">
                  ✓ Сохранено
                </span>
              )}
              <button
                onClick={onClose}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-md text-sm"
              >
                Закрыть
              </button>
              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap break-words">
        {value || "—"}
      </div>
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
