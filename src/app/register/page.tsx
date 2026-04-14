"use client";

import { useState } from "react";
import Image from "next/image";

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
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100 py-10 px-4">
        {/* Floating decorations */}
        <div className="fixed top-10 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: "3s" }}>🌈</div>
        <div className="fixed bottom-20 right-10 text-5xl opacity-20 animate-bounce" style={{ animationDuration: "4s" }}>⛺</div>
        <div className="fixed top-1/3 right-20 text-4xl opacity-15 animate-bounce" style={{ animationDuration: "5s" }}>🌲</div>

        <div className="max-w-[640px] mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 text-center border-2 border-green-200">
            <div className="text-7xl mb-5">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Спасибо! Ваша заявка успешно отправлена.
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Мы свяжемся с вами в ближайшее время.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                clearForm();
              }}
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-full text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Подать ещё одну заявку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100 py-10 px-4 relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="fixed top-8 left-8 text-6xl opacity-15 animate-bounce select-none pointer-events-none" style={{ animationDuration: "3s" }}>🌈</div>
      <div className="fixed bottom-16 right-8 text-5xl opacity-15 animate-bounce select-none pointer-events-none" style={{ animationDuration: "4s" }}>⛺</div>
      <div className="fixed top-1/4 right-16 text-4xl opacity-10 animate-bounce select-none pointer-events-none" style={{ animationDuration: "5s" }}>🌲</div>
      <div className="fixed bottom-1/3 left-12 text-4xl opacity-10 animate-bounce select-none pointer-events-none" style={{ animationDuration: "3.5s" }}>☀️</div>
      <div className="fixed top-2/3 right-1/3 text-3xl opacity-10 animate-bounce select-none pointer-events-none" style={{ animationDuration: "4.5s" }}>🦋</div>

      <div className="max-w-[640px] mx-auto relative z-10">
        <form onSubmit={handleSubmit}>
          {/* Header Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl mb-4 overflow-hidden border border-white/50">
            <Image
              src="/banner.jpeg"
              alt="Код Приключений — детский лагерь 28 июня - 4 июля"
              width={1280}
              height={720}
              className="w-full h-auto"
              priority
            />
            <div className="p-7 pt-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  👦 7-12 лет
                </span>
                <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  📅 28 июня - 4 июля 2026
                </span>
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  📍 Norkalni
                </span>
              </div>
              <hr className="border-dashed border-gray-200 my-4" />
              <p className="text-sm text-red-500 font-medium">* Обязательный вопрос</p>
            </div>
          </div>

          {/* Section: Child Info */}
          <SectionTitle icon="👧" title="Информация о ребёнке" color="blue" />

          <FormCard color="blue">
            <FormLabel label="Имя и фамилия ребёнка" required />
            <input
              type="text"
              name="childName"
              value={form.childName}
              onChange={handleChange}
              required
              placeholder="Введите имя и фамилию"
              className="form-input"
            />
          </FormCard>

          <FormCard color="blue">
            <FormLabel label="Дата рождения ребёнка" required />
            <input
              type="date"
              name="childDOB"
              value={form.childDOB}
              onChange={handleChange}
              required
              className="form-input"
            />
          </FormCard>

          <FormCard color="blue">
            <FormLabel label="Полный возраст ребенка на момент лагеря" required />
            <p className="text-xs text-gray-400 mb-2 italic">Возраст на 28 июня 2026</p>
            <input
              type="number"
              name="childAge"
              value={form.childAge}
              onChange={handleChange}
              required
              min="1"
              max="18"
              placeholder="Например: 9"
              className="form-input"
            />
          </FormCard>

          {/* Section: Parent Info */}
          <SectionTitle icon="👨‍👩‍👧" title="Информация о родителе" color="purple" />

          <FormCard color="purple">
            <FormLabel label="Имя и фамилия родителя" required />
            <input
              type="text"
              name="parentName"
              value={form.parentName}
              onChange={handleChange}
              required
              placeholder="Введите имя и фамилию"
              className="form-input"
            />
          </FormCard>

          <FormCard color="purple">
            <FormLabel label="Номер телефона родителя" required />
            <input
              type="tel"
              name="parentPhone"
              value={form.parentPhone}
              onChange={handleChange}
              required
              placeholder="+371 xxxxxxxx"
              className="form-input"
            />
          </FormCard>

          <FormCard color="purple">
            <FormLabel label="Электронная почта родителя" required />
            <input
              type="email"
              name="parentEmail"
              value={form.parentEmail}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              className="form-input"
            />
          </FormCard>

          <FormCard color="purple">
            <FormLabel label="Город" required />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              placeholder="Ваш город"
              className="form-input"
            />
          </FormCard>

          {/* Section: Health */}
          <SectionTitle icon="🏥" title="Здоровье" color="green" />

          <FormCard color="green">
            <FormLabel label="Есть ли у ребенка проблемы со здоровьем, о которых необходимо знать мед.работнику и наставнику?" required />
            <p className="text-xs text-gray-400 mb-2 italic">Аллергия на питание, ежедневное употребление медикаментов и т.д.</p>
            <textarea
              name="healthInfo"
              value={form.healthInfo}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Опишите здесь..."
              className="form-input-textarea"
            />
          </FormCard>

          {/* Payment Info Card */}
          <SectionTitle icon="💳" title="Оплата" color="amber" />

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md mb-4 p-6 border-l-4 border-amber-400">
            <p className="font-bold text-gray-800 mb-3 text-base">
              Стоимость лагеря 230&euro;*
            </p>
            <div className="text-sm text-gray-700 space-y-1.5">
              <p>*Многодетным семьям (Goda &#291;imene 3+) цена 180&euro; за ребенка</p>
              <p>*** Отдельная плата за автобус (цена будет известна ближе к лету)</p>
              <div className="h-3"></div>
              <p className="font-medium text-gray-800">Реквизиты для оплаты:</p>
              <div className="bg-white/70 rounded-xl p-3 mt-2 font-mono text-sm border border-amber-200">
                <p className="font-bold">JK NAMS BIEDRIBA</p>
                <p className="font-bold text-amber-700">LV31PARX0033210230002</p>
                <p className="text-gray-600 mt-1 font-sans">Цель платежа: ZIEDOJUMS b&#275;rnu nometnei 2026 + имя и фамилия ребенка</p>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md mb-4 p-6 border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📄</span>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold text-base hover:underline">
                Документы для заполнения
              </a>
            </div>
            <p className="text-sm text-gray-500 ml-8">
              Обязательно заполнить и подписать договор и доверенность.
            </p>
          </div>

          {/* Important Notice Card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-md mb-4 p-6 border-l-4 border-red-400">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚠️</span>
              <p className="font-bold text-red-700 text-base">ВАЖНО!</p>
            </div>
            <div className="text-sm text-gray-700 space-y-2.5">
              <p>
                — Родители должны обеспечить ребенку возможность вернуться домой
                во время лагеря, если возникнет такая необходимость (болезнь;
                многократное нарушение правил лагеря; поведение, которое негативно
                сказывается на других детях).
              </p>
              <p>
                — Просим обратить внимание на то, что регистрация является
                успешной после полной оплаты.
              </p>
              <div className="h-2"></div>
              <div className="bg-white/70 rounded-xl p-3 border border-red-200">
                <p className="font-medium text-gray-800 mb-1">📞 Контактный телефон:</p>
                <p className="text-gray-700">Дан — <a href="tel:+37126809250" className="text-blue-600 hover:underline font-medium">26809250</a></p>
                <p className="text-gray-700">Елена — <a href="tel:+37129164485" className="text-blue-600 hover:underline font-medium">29164485</a></p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between py-5">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-full text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? "Отправка..." : "🚀 Отправить"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
            >
              Очистить форму
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          background: white;
        }
        .form-input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
        }
        .form-input::placeholder {
          color: #c5c9d2;
        }
        .form-input-textarea {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          background: white;
          resize: none;
        }
        .form-input-textarea:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
        }
        .form-input-textarea::placeholder {
          color: #c5c9d2;
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ icon, title, color }: { icon: string; title: string; color: string }) {
  const gradients: Record<string, string> = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };

  return (
    <div className="flex items-center gap-2 mb-3 mt-6">
      <span className="text-2xl">{icon}</span>
      <h2 className={`text-lg font-bold bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
        {title}
      </h2>
    </div>
  );
}

function FormCard({ color, children }: { color: string; children: React.ReactNode }) {
  const borders: Record<string, string> = {
    blue: "border-l-blue-400",
    purple: "border-l-purple-400",
    green: "border-l-emerald-400",
    amber: "border-l-amber-400",
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-md mb-3 p-5 border-l-4 ${borders[color]} hover:shadow-lg transition-shadow duration-200`}>
      {children}
    </div>
  );
}

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-[14px] font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
