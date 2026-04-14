"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    childName: "",
    childDOB: "",
    childAge: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    city: "",
    healthInfo: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function clearForm() {
    setForm({
      childName: "",
      childDOB: "",
      childAge: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      city: "",
      healthInfo: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          childAge: parseInt(form.childAge),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при отправке");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#e8f0fe] py-8 px-4">
        <div className="max-w-[640px] mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">&#10003;</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Спасибо! Ваша заявка успешно отправлена.
            </h2>
            <p className="text-gray-600 mb-6">
              Мы свяжемся с вами в ближайшее время.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                clearForm();
              }}
              className="text-[#1a73e8] hover:underline font-medium"
            >
              Подать ещё одну заявку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f0fe] py-8 px-4">
      <div className="max-w-[640px] mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
            <div className="h-2.5 bg-[#1a73e8] rounded-t-lg"></div>
            <div className="p-6">
              <h1 className="text-[32px] text-gray-800">
                Регистрация в детский лагерь 2026
              </h1>
              <p className="text-gray-600 mt-2 text-[15px]">7-12 лет</p>
              <p className="text-gray-600 text-[15px]">13-18 июля 2026</p>
              <p className="text-gray-600 text-[15px]">Norkalni</p>
              <hr className="my-4" />
              <p className="text-sm text-red-600">* Обязательный вопрос</p>
            </div>
          </div>

          {/* Child Name */}
          <FormCard label="Имя и фамилия ребёнка" required>
            <input
              type="text"
              name="childName"
              value={form.childName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* Child DOB */}
          <FormCard label="Дата рождения ребёнка" required>
            <input
              type="date"
              name="childDOB"
              value={form.childDOB}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* Child Age */}
          <FormCard label="Полный возраст ребенка на момент лагеря" required hint="Возраст на 13 июля 2026">
            <input
              type="number"
              name="childAge"
              value={form.childAge}
              onChange={handleChange}
              required
              min="1"
              max="18"
              className="form-input"
            />
          </FormCard>

          {/* Parent Name */}
          <FormCard label="Имя и фамилия родителя" required>
            <input
              type="text"
              name="parentName"
              value={form.parentName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* Parent Phone */}
          <FormCard label="Номер телефона родителя" required>
            <input
              type="tel"
              name="parentPhone"
              value={form.parentPhone}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* Parent Email */}
          <FormCard label="Электронная почта родителя" required>
            <input
              type="email"
              name="parentEmail"
              value={form.parentEmail}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* City */}
          <FormCard label="Город" required>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          {/* Health Info */}
          <FormCard
            label="Есть ли у ребенка проблемы со здоровьем, о которых необходимо знать мед.работнику и наставнику?"
            required
            hint="Аллергия на питание, ежедневное употребление медикаментов и т.д."
          >
            <textarea
              name="healthInfo"
              value={form.healthInfo}
              onChange={handleChange}
              required
              rows={3}
              className="form-input resize-none"
            />
          </FormCard>

          {/* Payment Info Card */}
          <div className="bg-white rounded-lg shadow-sm mb-3 p-6">
            <p className="font-bold text-gray-800 mb-3">
              Стоимость лагеря 225&euro; (до 30 июня)*
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>*Многодетным семьям (Goda &#291;imene 3+) цена 180&euro; за ребенка (до 30 июня)</p>
              <p>** С 1 июля стоимость лагеря 250&euro;</p>
              <p>*** Отдельная плата за автобус (цена будет известна ближе к лету)</p>
              <br />
              <p>Реквизиты для оплаты:</p>
              <br />
              <p className="font-medium">JK NAMS BIEDRIBA</p>
              <p className="font-medium">LV31PARX0033210230002</p>
              <p>Цель платежа: ZIEDOJUMS b&#275;rnu nometnei 2026 + имя и фамилия ребенка</p>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-lg shadow-sm mb-3 p-6">
            <a href="#" className="text-[#1a73e8] hover:underline font-medium">
              Документы для заполнения
            </a>
            <p className="text-sm text-gray-600 mt-2">
              Обязательно заполнить и подписать договор и доверенность.
            </p>
          </div>

          {/* Important Notice Card */}
          <div className="bg-white rounded-lg shadow-sm mb-3 p-6">
            <p className="font-bold text-gray-800 mb-3">ВАЖНО!</p>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                - Родители должны обеспечить ребенку возможность вернуться домой
                во время лагеря, если возникнет такая необходимость (болезнь;
                многократное нарушение правил лагеря; поведение, которое негативно
                сказывается на других детях).
              </p>
              <p>
                - Просим обратить внимание на то, что регистрация является
                успешной после полной оплаты.
              </p>
              <br />
              <p>Контактный телефон:</p>
              <p>Дан (26809250)</p>
              <p>Елена (29164485)</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between py-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2.5 px-6 rounded-md text-sm disabled:opacity-50"
            >
              {loading ? "Отправка..." : "Отправить"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="text-[#1a73e8] hover:text-[#1557b0] font-medium text-sm"
            >
              Очистить форму
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid #dadce0;
          padding: 8px 0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          background: transparent;
        }
        .form-input:focus {
          border-bottom: 2px solid #1a73e8;
          margin-bottom: -1px;
        }
        textarea.form-input {
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 8px 12px;
        }
        textarea.form-input:focus {
          border: 2px solid #1a73e8;
          margin-bottom: 0;
          padding: 7px 11px;
        }
      `}</style>
    </div>
  );
}

function FormCard({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-3 p-6">
      <label className="block text-[14px] text-gray-800 mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
