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
  declaredAddress?: string;
  actualAddress?: string;
  billingName?: string;
  billingId?: string;
  billingAddress?: string;
  billingEmail?: string;
  pickupAuthorized?: string;
  childCanLeaveAlone?: boolean;
  pickup1Name?: string;
  pickup1Phone?: string;
  pickup1Relation?: string;
  pickup2Name?: string;
  pickup2Phone?: string;
  pickup2Relation?: string;
  hasAllergies?: boolean;
  allergiesDetails?: string;
  hasChronicIllness?: boolean;
  chronicDetails?: string;
  takesMedication?: boolean;
  medicationDetails?: string;
  hasSpecialTraits?: boolean;
  specialTraitsDetails?: string;
  hasEncephalitisVaccine?: string;
  participatedOtherCamps?: string;
  swimmingAbility?: string;
  physicalActivity?: string;
  physicalLimitations?: string;
  dietRestrictions?: string;
  dietDetails?: string;
  additionalInfo?: string;
  hearAboutUs?: string;
  paymentMethod?: string;
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

/** Fields the admin can mutate via PATCH. Matches the whitelist in the API. */
const EDITABLE_KEYS = [
  "camp",
  "groupWith",
  "childName",
  "childDOB",
  "childAge",
  "childPersonalId",
  "childGender",
  "childLanguage",
  "city",
  "declaredAddress",
  "actualAddress",
  "parentName",
  "parentPhone",
  "parentEmail",
  "emergencyContactName",
  "emergencyContactPhone",
  "pickup1Name",
  "pickup1Phone",
  "pickup1Relation",
  "pickup2Name",
  "pickup2Phone",
  "pickup2Relation",
  "hasAllergies",
  "allergiesDetails",
  "hasChronicIllness",
  "chronicDetails",
  "takesMedication",
  "medicationDetails",
  "hasSpecialTraits",
  "specialTraitsDetails",
  "hasEncephalitisVaccine",
  "participatedOtherCamps",
  "swimmingAbility",
  "physicalActivity",
  "physicalLimitations",
  "dietRestrictions",
  "dietDetails",
  "additionalInfo",
  "hearAboutUs",
  "paymentMethod",
] as const satisfies readonly (keyof Registration)[];

export default function RegistrationModal({
  registrationId,
  onClose,
  onChanged,
  onDeleted,
}: Props) {
  const { data: session } = useSession();
  const [reg, setReg] = useState<Registration | null>(null);
  const [edited, setEdited] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
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
      setEdited(null);
      setEditMode(false);
      setShowDelete(false);
      return;
    }
    setLoading(true);
    setReg(null);
    setEdited(null);
    setEditMode(false);
    fetch(`/api/admin/registrations/${registrationId}`)
      .then((r) => r.json())
      .then((data) => {
        setReg(data);
        setEdited(data);
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

  /** Patch a single field on the edited draft. */
  function patch<K extends keyof Registration>(k: K, v: Registration[K]) {
    setEdited((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function handleSave() {
    if (!registrationId) return;
    setSaving(true);
    // Always send status + internalNotes. If we're in edit mode, also send
    // the full editable field set.
    const body: Record<string, unknown> = { status, internalNotes: notes };
    if (editMode && edited) {
      for (const k of EDITABLE_KEYS) {
        body[k] = edited[k];
      }
    }
    const res = await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setReg(updated);
      setEdited(updated);
      setEditMode(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      onChanged?.();
    } else {
      alert("Не удалось сохранить — проверь подключение");
    }
  }

  function handleCancelEdit() {
    if (reg) {
      setEdited(reg);
      setStatus(reg.status);
      setNotes(reg.internalNotes || "");
    }
    setEditMode(false);
  }

  async function handleDelete() {
    if (!registrationId) return;
    await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "DELETE",
    });
    onDeleted?.();
    onClose();
  }

  // EField wrapper bound to this modal's edit-mode + draft state.
  function EF<K extends keyof Registration>(props: {
    label: string;
    k: K;
    type?: "text" | "date" | "tel" | "email" | "number";
    options?: { value: string; label: string }[];
    textarea?: boolean;
    rows?: number;
    display?: React.ReactNode;
    colSpan2?: boolean;
  }) {
    if (!edited) return null;
    return (
      <EditableField
        label={props.label}
        value={edited[props.k] as any}
        onChange={(v) => patch(props.k, v as Registration[K])}
        editMode={editMode && canEdit}
        type={props.type}
        options={props.options}
        textarea={props.textarea}
        rows={props.rows}
        display={props.display}
        colSpan2={props.colSpan2}
      />
    );
  }

  const yesNoOpts = [
    { value: "", label: "—" },
    { value: "yes", label: "Да" },
    { value: "no", label: "Нет" },
  ];
  const boolOpts = [
    { value: "false", label: "Нет" },
    { value: "true", label: "Да" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={editMode ? undefined : onClose}
      />

      <div className="relative bg-white w-full sm:max-w-3xl sm:m-6 sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-7 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {reg ? `Заявка: ${reg.childName}` : "Загрузка..."}
              {editMode && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium align-middle">
                  редактирование
                </span>
              )}
            </h2>
            {reg && (
              <p className="text-xs text-gray-500 mt-0.5">
                {CAMP_LABEL[reg.camp || ""] || reg.camp || "—"} · подана{" "}
                {new Date(reg.createdAt).toLocaleString("ru-RU")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {reg && canEdit && !editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9.5 1.5l3 3-7 7H2.5v-3l7-7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Редактировать
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-2 -mt-1 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 sm:px-7 py-5 flex-1">
          {loading || !reg || !edited ? (
            <p className="text-gray-500 text-sm">Загрузка...</p>
          ) : (
            <>
              {/* Mobile-only edit button (header version is hidden < sm) */}
              {canEdit && !editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="sm:hidden mb-4 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M9.5 1.5l3 3-7 7H2.5v-3l7-7z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Редактировать
                </button>
              )}

              <SubHeading>Лагерь</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF
                  label="Смена"
                  k="camp"
                  options={[
                    { value: "kids", label: "Детский (28.06 – 4.07)" },
                    { value: "teens", label: "Подростковый (26.07 – 1.08)" },
                  ]}
                  display={CAMP_LABEL[edited.camp || ""] || edited.camp || "—"}
                />
                <EF label="В одной группе с" k="groupWith" />
              </div>

              <SubHeading>Ребёнок</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF label="Имя и фамилия" k="childName" />
                <EF
                  label="Пол"
                  k="childGender"
                  options={[
                    { value: "", label: "—" },
                    { value: "Мальчик", label: "Мальчик" },
                    { value: "Девочка", label: "Девочка" },
                  ]}
                />
                <EF label="Дата рождения" k="childDOB" type="date" />
                <EF label="Возраст" k="childAge" type="number" />
                <EF label="Personas kods" k="childPersonalId" />
                <EF
                  label="Язык общения"
                  k="childLanguage"
                  options={[
                    { value: "Русский", label: "Русский" },
                    { value: "Latviešu", label: "Latviešu" },
                    { value: "English", label: "English" },
                  ]}
                />
                <EF label="Город" k="city" />
                <EF
                  label="Декларированный адрес"
                  k="declaredAddress"
                  textarea
                  rows={2}
                />
                <EF
                  label="Фактический адрес"
                  k="actualAddress"
                  textarea
                  rows={2}
                  display={
                    edited.actualAddress
                      ? edited.actualAddress === edited.declaredAddress
                        ? "= декларированный"
                        : edited.actualAddress
                      : "—"
                  }
                />
              </div>

              <SubHeading>Родитель / Опекун</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF label="Имя и фамилия" k="parentName" />
                <EF
                  label="Телефон"
                  k="parentPhone"
                  type="tel"
                  display={
                    edited.parentPhone ? (
                      <a
                        href={`tel:+371${edited.parentPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        +371 {edited.parentPhone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <EF
                  label="Email"
                  k="parentEmail"
                  type="email"
                  display={
                    edited.parentEmail ? (
                      <a
                        href={`mailto:${edited.parentEmail}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {edited.parentEmail}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <EF label="Экстренный контакт" k="emergencyContactName" />
                <EF
                  label="Телефон экстренного"
                  k="emergencyContactPhone"
                  type="tel"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF label="Контакт #1: имя" k="pickup1Name" />
                <EF label="Контакт #1: телефон" k="pickup1Phone" type="tel" />
                <EF label="Контакт #1: кем" k="pickup1Relation" />
                <EF label="Контакт #2: имя" k="pickup2Name" />
                <EF label="Контакт #2: телефон" k="pickup2Phone" type="tel" />
                <EF label="Контакт #2: кем" k="pickup2Relation" />
                {reg.pickupAuthorized && (
                  <div className="md:col-span-2">
                    <Field
                      label="Разрешено забирать (старая форма)"
                      value={reg.pickupAuthorized}
                    />
                  </div>
                )}
              </div>

              <SubHeading>Здоровье</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF
                  label="Аллергии"
                  k="hasAllergies"
                  options={boolOpts}
                  display={
                    edited.hasAllergies
                      ? `Да${
                          edited.allergiesDetails
                            ? " — " + edited.allergiesDetails
                            : ""
                        }`
                      : "Нет"
                  }
                />
                <EF
                  label="Аллергии: детали"
                  k="allergiesDetails"
                  textarea
                  rows={2}
                />
                <EF
                  label="Хронические заболевания"
                  k="hasChronicIllness"
                  options={boolOpts}
                  display={
                    edited.hasChronicIllness
                      ? `Да${
                          edited.chronicDetails
                            ? " — " + edited.chronicDetails
                            : ""
                        }`
                      : "Нет"
                  }
                />
                <EF
                  label="Хронические: детали"
                  k="chronicDetails"
                  textarea
                  rows={2}
                />
                <EF
                  label="Медикаменты"
                  k="takesMedication"
                  options={boolOpts}
                  display={
                    edited.takesMedication
                      ? `Да${
                          edited.medicationDetails
                            ? " — " + edited.medicationDetails
                            : ""
                        }`
                      : "Нет"
                  }
                />
                <EF
                  label="Медикаменты: детали"
                  k="medicationDetails"
                  textarea
                  rows={2}
                />
                <EF
                  label="Особенности характера / психики"
                  k="hasSpecialTraits"
                  options={boolOpts}
                  display={
                    edited.hasSpecialTraits
                      ? `Да${
                          edited.specialTraitsDetails
                            ? " — " + edited.specialTraitsDetails
                            : ""
                        }`
                      : "Нет"
                  }
                />
                <EF
                  label="Особенности: детали"
                  k="specialTraitsDetails"
                  textarea
                  rows={2}
                />
                <EF
                  label="Прививка от энцефалита"
                  k="hasEncephalitisVaccine"
                  options={yesNoOpts}
                  display={yesNoLabel(edited.hasEncephalitisVaccine)}
                />
                <EF
                  label="Был в других лагерях"
                  k="participatedOtherCamps"
                  options={yesNoOpts}
                  display={yesNoLabel(edited.participatedOtherCamps)}
                />
                <EF
                  label="Умеет плавать"
                  k="swimmingAbility"
                  options={[
                    { value: "", label: "—" },
                    { value: "yes", label: "Да, умеет" },
                    { value: "weak", label: "Умеет, но плохо" },
                    { value: "no", label: "Нет, не умеет" },
                  ]}
                  display={swimmingLabel(edited.swimmingAbility)}
                />
                <EF
                  label="Физическая активность"
                  k="physicalActivity"
                  options={[
                    { value: "Разрешено", label: "Без ограничений" },
                    { value: "С ограничениями", label: "С ограничениями" },
                  ]}
                  display={
                    edited.physicalActivity === "С ограничениями"
                      ? `С ограничениями${
                          edited.physicalLimitations
                            ? " — " + edited.physicalLimitations
                            : ""
                        }`
                      : edited.physicalActivity || "—"
                  }
                />
                <EF
                  label="Физ. ограничения: детали"
                  k="physicalLimitations"
                  textarea
                  rows={2}
                />
                {reg.healthInfo && !editMode && (
                  <div className="md:col-span-2">
                    <Field
                      label="Прочая информация о здоровье"
                      value={reg.healthInfo}
                    />
                  </div>
                )}
              </div>

              <SubHeading>Питание</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF
                  label="Ограничения"
                  k="dietRestrictions"
                  options={[
                    { value: "нет", label: "Нет" },
                    { value: "вегетарианское", label: "Вегетарианец" },
                    { value: "веганское", label: "Веган" },
                    { value: "другое", label: "Другое" },
                  ]}
                  display={
                    edited.dietRestrictions === "другое"
                      ? `Другое${
                          edited.dietDetails ? " — " + edited.dietDetails : ""
                        }`
                      : edited.dietRestrictions || "—"
                  }
                />
                <EF label="Питание: детали" k="dietDetails" />
              </div>

              <SubHeading>Дополнительно</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EF
                  label="Способ оплаты"
                  k="paymentMethod"
                  options={[
                    { value: "", label: "—" },
                    { value: "cash", label: "Наличными" },
                    { value: "stripe", label: "Картой (Stripe)" },
                  ]}
                  display={paymentMethodLabel(edited.paymentMethod)}
                />
                <EF
                  label="Дополнительная информация"
                  k="additionalInfo"
                  textarea
                  rows={2}
                />
                <EF label="Откуда узнали" k="hearAboutUs" />
              </div>

              {/* Management */}
              <SubHeading>Управление заявкой</SubHeading>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        {
                          value: "Новая",
                          label: "Новая",
                          bg: "#dbeafe",
                          fg: "#1e40af",
                          ring: "#3b82f6",
                        },
                        {
                          value: "Подтверждена",
                          label: "✓ Подтвердить",
                          bg: "#d1f0dd",
                          fg: "#15693a",
                          ring: "#22c55e",
                        },
                        {
                          value: "Отклонена",
                          label: "✕ Отклонить",
                          bg: "#fbdada",
                          fg: "#a02b2b",
                          ring: "#ef4444",
                        },
                      ] as const
                    ).map((opt) => {
                      const active = status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => canEdit && setStatus(opt.value)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          style={
                            active
                              ? {
                                  background: opt.bg,
                                  color: opt.fg,
                                  borderColor: opt.ring,
                                  boxShadow: `0 0 0 3px ${opt.ring}33`,
                                }
                              : {
                                  background: "#fff",
                                  color: "#5b574d",
                                  borderColor: "#e5e7eb",
                                }
                          }
                        >
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: opt.ring }}
                          />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
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
              {canDelete && !editMode &&
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
              {editMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50"
                  >
                    {saving ? "Сохранение..." : "Сохранить изменения"}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Renders a label + value in view mode, or label + input/select/textarea in
 * edit mode. Booleans are encoded as the strings "true"/"false" inside the
 * <select> and converted back on change.
 */
function EditableField({
  label,
  value,
  onChange,
  editMode,
  type = "text",
  options,
  textarea,
  rows = 2,
  display,
  colSpan2,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  editMode: boolean;
  type?: "text" | "date" | "tel" | "email" | "number";
  options?: { value: string; label: string }[];
  textarea?: boolean;
  rows?: number;
  display?: React.ReactNode;
  colSpan2?: boolean;
}) {
  const wrapperClass = colSpan2 ? "md:col-span-2" : "";

  if (editMode) {
    // Booleans get encoded as "true" / "false" while in the select.
    const isBool = options && options.some((o) => o.value === "true");
    const strValue = isBool
      ? value === true
        ? "true"
        : value === false
        ? "false"
        : ""
      : value == null
      ? ""
      : String(value);
    const handleStringChange = (v: string) => {
      if (isBool) onChange(v === "true");
      else if (type === "number") onChange(v === "" ? 0 : Number(v));
      else onChange(v);
    };
    const inputClass =
      "w-full mt-0.5 border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent";
    return (
      <div className={wrapperClass}>
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        {options ? (
          <select
            value={strValue}
            onChange={(e) => handleStringChange(e.target.value)}
            className={inputClass + " bg-white"}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : textarea ? (
          <textarea
            value={strValue}
            onChange={(e) => handleStringChange(e.target.value)}
            rows={rows}
            className={inputClass + " resize-y"}
          />
        ) : (
          <input
            type={type}
            value={strValue}
            onChange={(e) => handleStringChange(e.target.value)}
            className={inputClass}
          />
        )}
      </div>
    );
  }

  // View mode
  return (
    <div className={wrapperClass}>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap break-words">
        {display ?? (value == null || value === "" ? "—" : String(value))}
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

function yesNoLabel(v?: string) {
  if (v === "yes") return "Да";
  if (v === "no") return "Нет";
  return "—";
}

function paymentMethodLabel(v?: string) {
  if (v === "cash") return "Наличными при подписании договора";
  if (v === "stripe") return "Картой онлайн (Stripe)";
  return "—";
}

function swimmingLabel(v?: string) {
  if (v === "yes") return "Да, умеет";
  if (v === "weak") return "Умеет, но плохо";
  if (v === "no") return "Нет, не умеет";
  return "—";
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-6 mb-3 first:mt-0">
      {children}
    </h3>
  );
}
