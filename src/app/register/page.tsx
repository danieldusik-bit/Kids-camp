"use client";

import { useState } from "react";
import Image from "next/image";

type FormState = {
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  childName: string;
  childDOB: string;
  childAge: string;
  childPersonalId: string;
  childLanguage: string;
  childLanguageOther: string;
  city: string;
  billingName: string;
  billingId: string;
  billingAddress: string;
  billingEmail: string;
  pickupAuthorized: string;
  childCanLeaveAlone: boolean;
  hasAllergies: boolean;
  allergiesDetails: string;
  hasChronicIllness: boolean;
  chronicDetails: string;
  takesMedication: boolean;
  medicationDetails: string;
  physicalActivity: string;
  physicalLimitations: string;
  dietRestrictions: string;
  dietDetails: string;
  additionalInfo: string;
  hearAboutUs: string;
  confirmInfoTrue: boolean;
  confirmFirstAid: boolean;
  confirmRules: boolean;
  confirmPayment: boolean;
};

const initialState: FormState = {
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  childName: "",
  childDOB: "",
  childAge: "",
  childPersonalId: "",
  childLanguage: "Русский",
  childLanguageOther: "",
  city: "",
  billingName: "",
  billingId: "",
  billingAddress: "",
  billingEmail: "",
  pickupAuthorized: "",
  childCanLeaveAlone: false,
  hasAllergies: false,
  allergiesDetails: "",
  hasChronicIllness: false,
  chronicDetails: "",
  takesMedication: false,
  medicationDetails: "",
  physicalActivity: "Разрешено",
  physicalLimitations: "",
  dietRestrictions: "нет",
  dietDetails: "",
  additionalInfo: "",
  hearAboutUs: "",
  confirmInfoTrue: false,
  confirmFirstAid: false,
  confirmRules: false,
  confirmPayment: false,
};

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initialState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const language =
        form.childLanguage === "Другой"
          ? form.childLanguageOther || "Другой"
          : form.childLanguage;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          childAge: parseInt(form.childAge),
          childLanguage: language,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при отправке");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Заявка успешно отправлена
          </h2>
          <p className="text-gray-600 mb-2">
            Спасибо за регистрацию! Подтверждение отправлено на указанный email.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Если письмо не пришло, проверьте папку «Спам».
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm(initialState);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Подать ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="rounded-lg overflow-hidden shadow-sm">
          <Image
            src="/banner.jpeg"
            alt="Код Приключений — детский лагерь"
            width={1280}
            height={720}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Регистрация в лагерь
          </h1>
          <p className="text-gray-600">
            Заполните форму, чтобы зарегистрировать ребёнка в детский лагерь
            «Код Приключений» — 28 июня – 4 июля 2026, Norkalni.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Поля, отмеченные <span className="text-red-500">*</span>, обязательны для заполнения.
          </p>
        </div>

        {/* Section: Parent / Guardian */}
        <Section title="Информация о родителе / опекуне">
          <Field label="Имя и фамилия" required>
            <input
              type="text"
              required
              value={form.parentName}
              onChange={(e) => update("parentName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Номер телефона" required>
            <input
              type="tel"
              required
              placeholder="+371 ..."
              value={form.parentPhone}
              onChange={(e) => update("parentPhone", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="E-mail" required>
            <input
              type="email"
              required
              value={form.parentEmail}
              onChange={(e) => update("parentEmail", e.target.value)}
              className="input"
            />
          </Field>
          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Дополнительный контакт на случай экстренной ситуации
            </p>
            <Field label="Имя и фамилия">
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(e) => update("emergencyContactName", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Номер телефона">
              <input
                type="tel"
                value={form.emergencyContactPhone}
                onChange={(e) => update("emergencyContactPhone", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* Section: Child Info */}
        <Section title="Информация о ребёнке">
          <Field label="Имя и фамилия ребёнка" required>
            <input
              type="text"
              required
              value={form.childName}
              onChange={(e) => update("childName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Дата рождения" required>
            <input
              type="date"
              required
              value={form.childDOB}
              onChange={(e) => update("childDOB", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Полный возраст на момент лагеря" hint="Возраст на 28 июня 2026" required>
            <input
              type="number"
              required
              min={1}
              max={18}
              value={form.childAge}
              onChange={(e) => update("childAge", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Персональный код">
            <input
              type="text"
              placeholder="XXXXXX-XXXXX"
              value={form.childPersonalId}
              onChange={(e) => update("childPersonalId", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Город" required>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Язык общения" required>
            <div className="space-y-2">
              {["Русский", "Латышский", "Английский", "Другой"].map((lang) => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="childLanguage"
                    value={lang}
                    checked={form.childLanguage === lang}
                    onChange={(e) => update("childLanguage", e.target.value)}
                    className="radio"
                  />
                  <span className="text-sm text-gray-700">{lang}</span>
                </label>
              ))}
              {form.childLanguage === "Другой" && (
                <input
                  type="text"
                  placeholder="Укажите язык"
                  value={form.childLanguageOther}
                  onChange={(e) => update("childLanguageOther", e.target.value)}
                  className="input mt-2"
                />
              )}
            </div>
          </Field>
        </Section>

        {/* Section: Billing */}
        <Section title="Реквизиты для счёта">
          <Field label="Имя и фамилия / Название компании" required>
            <input
              type="text"
              required
              value={form.billingName}
              onChange={(e) => update("billingName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Персональный код / Регистрационный номер" required>
            <input
              type="text"
              required
              value={form.billingId}
              onChange={(e) => update("billingId", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Юридический адрес" required>
            <input
              type="text"
              required
              value={form.billingAddress}
              onChange={(e) => update("billingAddress", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="E-mail для счёта" required>
            <input
              type="email"
              required
              value={form.billingEmail}
              onChange={(e) => update("billingEmail", e.target.value)}
              className="input"
            />
          </Field>
        </Section>

        {/* Section: Pickup */}
        <Section title="Забор ребёнка из лагеря">
          <Field
            label="Лица, которым разрешено забирать ребёнка из лагеря"
            hint="Укажите имя, фамилию и связь с ребёнком"
          >
            <textarea
              rows={3}
              value={form.pickupAuthorized}
              onChange={(e) => update("pickupAuthorized", e.target.value)}
              className="input"
            />
          </Field>
          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.childCanLeaveAlone}
              onChange={(e) => update("childCanLeaveAlone", e.target.checked)}
              className="checkbox mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Ребёнок может покидать лагерь самостоятельно
            </span>
          </label>
        </Section>

        {/* Section: Health */}
        <Section title="Здоровье">
          <YesNoToggle
            label="Есть ли у ребёнка аллергии?"
            value={form.hasAllergies}
            onChange={(v) => update("hasAllergies", v)}
          />
          {form.hasAllergies && (
            <Field label="Опишите аллергии">
              <textarea
                rows={2}
                value={form.allergiesDetails}
                onChange={(e) => update("allergiesDetails", e.target.value)}
                className="input"
              />
            </Field>
          )}

          <YesNoToggle
            label="Есть ли у ребёнка хронические заболевания или другие особенности здоровья?"
            value={form.hasChronicIllness}
            onChange={(v) => update("hasChronicIllness", v)}
          />
          {form.hasChronicIllness && (
            <Field label="Опишите состояние здоровья">
              <textarea
                rows={2}
                value={form.chronicDetails}
                onChange={(e) => update("chronicDetails", e.target.value)}
                className="input"
              />
            </Field>
          )}

          <YesNoToggle
            label="Принимает ли ребёнок медикаменты?"
            value={form.takesMedication}
            onChange={(v) => update("takesMedication", v)}
          />
          {form.takesMedication && (
            <Field label="Укажите медикаменты и дозировку">
              <textarea
                rows={2}
                value={form.medicationDetails}
                onChange={(e) => update("medicationDetails", e.target.value)}
                className="input"
              />
            </Field>
          )}
        </Section>

        {/* Section: Physical Activity */}
        <Section title="Физическая активность">
          <div className="space-y-2">
            {[
              { v: "Разрешено", l: "Разрешено" },
              { v: "С ограничениями", l: "С ограничениями" },
            ].map((opt) => (
              <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="physicalActivity"
                  value={opt.v}
                  checked={form.physicalActivity === opt.v}
                  onChange={(e) => update("physicalActivity", e.target.value)}
                  className="radio"
                />
                <span className="text-sm text-gray-700">{opt.l}</span>
              </label>
            ))}
          </div>
          {form.physicalActivity === "С ограничениями" && (
            <div className="mt-3">
              <Field label="Опишите ограничения">
                <textarea
                  rows={2}
                  value={form.physicalLimitations}
                  onChange={(e) => update("physicalLimitations", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          )}
        </Section>

        {/* Section: Diet */}
        <Section title="Питание">
          <Field label="Ограничения в питании">
            <div className="space-y-2">
              {[
                { v: "нет", l: "Нет" },
                { v: "вегетарианское", l: "Вегетарианское" },
                { v: "веганское", l: "Веганское" },
                { v: "другое", l: "Другое" },
              ].map((opt) => (
                <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dietRestrictions"
                    value={opt.v}
                    checked={form.dietRestrictions === opt.v}
                    onChange={(e) => update("dietRestrictions", e.target.value)}
                    className="radio"
                  />
                  <span className="text-sm text-gray-700">{opt.l}</span>
                </label>
              ))}
            </div>
          </Field>
          {form.dietRestrictions === "другое" && (
            <Field label="Укажите ограничения в питании">
              <textarea
                rows={2}
                value={form.dietDetails}
                onChange={(e) => update("dietDetails", e.target.value)}
                className="input"
              />
            </Field>
          )}
        </Section>

        {/* Section: Additional */}
        <Section title="Дополнительная информация">
          <Field label="Дополнительная информация">
            <textarea
              rows={3}
              value={form.additionalInfo}
              onChange={(e) => update("additionalInfo", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Откуда вы узнали о нас?">
            <select
              value={form.hearAboutUs}
              onChange={(e) => update("hearAboutUs", e.target.value)}
              className="input"
            >
              <option value="">— Выберите —</option>
              <option value="Друзья / знакомые">Друзья / знакомые</option>
              <option value="Социальные сети">Социальные сети</option>
              <option value="Церковь">Церковь</option>
              <option value="Поиск в интернете">Поиск в интернете</option>
              <option value="Уже участвовали">Уже участвовали</option>
              <option value="Другое">Другое</option>
            </select>
          </Field>
        </Section>

        {/* Payment info */}
        <Section title="Оплата">
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <span className="font-medium">Стоимость лагеря:</span> 230&nbsp;€
            </p>
            <p>
              Многодетным семьям (Goda ģimene 3+) — 180&nbsp;€ за ребёнка.
            </p>
            <p className="pt-3 font-medium text-gray-800">Реквизиты для оплаты:</p>
            <div className="bg-gray-50 rounded-md border border-gray-200 p-4 font-mono text-sm">
              <div>JK NAMS BIEDRIBA</div>
              <div className="font-semibold">LV31PARX0033210230002</div>
              <div className="font-sans text-gray-600 text-xs mt-2">
                Цель платежа: ZIEDOJUMS bērnu nometnei 2026 + имя и фамилия ребёнка
              </div>
            </div>
          </div>
        </Section>

        {/* Section: Confirmations */}
        <Section title="Подтверждение">
          <Confirm
            checked={form.confirmInfoTrue}
            onChange={(v) => update("confirmInfoTrue", v)}
            label="Подтверждаю, что предоставленная информация является достоверной и полной"
          />
          <Confirm
            checked={form.confirmFirstAid}
            onChange={(v) => update("confirmFirstAid", v)}
            label="Согласен(-на), что в случае необходимости ребёнку будет оказана первая помощь"
          />
          <Confirm
            checked={form.confirmRules}
            onChange={(v) => update("confirmRules", v)}
            label="Ознакомлен(-а) с правилами внутреннего распорядка лагеря и обязуюсь обеспечить их соблюдение"
          />
          <Confirm
            checked={form.confirmPayment}
            onChange={(v) => update("confirmPayment", v)}
            label="Понимаю, что место в лагере резервируется только после оплаты счёта"
          />
        </Section>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <p className="text-sm font-medium text-gray-800 mb-2">Контакты</p>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              Дан —{" "}
              <a href="tel:+37126809250" className="text-blue-600 hover:underline">
                26809250
              </a>
            </div>
            <div>
              Елена —{" "}
              <a href="tel:+37129164485" className="text-blue-600 hover:underline">
                29164485
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 9px 12px;
          font-size: 14px;
          color: #111827;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .input::placeholder {
          color: #9ca3af;
        }
        textarea.input {
          resize: vertical;
        }
        select.input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 18px;
          padding-right: 36px;
        }
        .radio {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function YesNoToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-5 py-1.5 text-sm font-medium transition-colors ${
            value
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Да
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-5 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
            !value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Нет
        </button>
      </div>
    </div>
  );
}

function Confirm({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox mt-0.5"
        required
      />
      <span className="text-sm text-gray-700 leading-snug">
        {label} <span className="text-red-500">*</span>
      </span>
    </label>
  );
}
