"use client";
import type { useCampForm } from "@/lib/camp/useCampForm";
import { CAMP, CAMP_RULES } from "@/lib/camp/camp";

export function StepPayment({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, price } = form;
  const isCash = data.paymentMethod === "cash";
  const isStripe = data.paymentMethod === "stripe";
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      {/* Pricing card */}
      <div className="rounded-2xl p-6 flex items-center justify-between gap-4 bg-gradient-to-br from-accent-soft to-tint border border-line">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute font-bold">
            Стоимость смены
          </span>
          <span className="text-[13px] text-ink-soft">
            7 дней (5 полных дней) · полное проживание · все занятия
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[56px] font-semibold leading-none text-ink tabular-nums">
            {price}
          </span>
          <span className="font-display text-[28px] font-semibold text-accent-strong">
            €
          </span>
          <span className="text-[13px] text-ink-mute ml-1">/ ребёнок</span>
        </div>
      </div>

      <label
        className={[
          "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
          data.largeFamily
            ? "bg-accent-soft/50 border-accent"
            : "bg-surface-soft border-line hover:border-line-strong",
        ].join(" ")}
      >
        <input
          type="checkbox"
          checked={data.largeFamily}
          onChange={(e) => set("largeFamily", e.target.checked)}
          className="mt-0.5 w-[18px] h-[18px] accent-[rgb(var(--accent))] flex-shrink-0"
        />
        <span className="text-[14px] leading-[1.45] text-ink-soft">
          <strong className="text-ink">
            Многодетная семья · Goda ģimene 3+
          </strong>
          <span className="block text-[13px] text-ink-mute mt-0.5">
            {CAMP.familyPrice} € за ребёнка вместо {CAMP.basePrice} €
          </span>
        </span>
      </label>

      {/* Payment options — pick one. The actual payment happens after submit. */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {/* Cash on contract handover */}
        <button
          type="button"
          role="radio"
          aria-checked={isCash}
          onClick={() => set("paymentMethod", "cash")}
          className={[
            "text-left rounded-2xl p-5 border flex flex-col cursor-pointer transition-all",
            isCash
              ? "bg-accent-soft/50 border-accent ring-4 ring-accent-soft"
              : "bg-tint border-line hover:border-line-strong",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-[19px] font-semibold mt-0 mb-0 text-ink">
              Наличными
            </h3>
            <RadioDot on={isCash} />
          </div>
          <p className="text-[13px] text-ink-mute mt-0 mb-4">
            Оплата при подписании договора. Сумма передаётся координатору
            лагеря в день встречи.
          </p>

          <div
            className="flex-1 flex items-center justify-center my-4"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 96 96"
              width="120"
              height="120"
              fill="none"
              role="img"
              aria-label="Наличные деньги"
            >
              <rect
                x="26"
                y="10"
                width="46"
                height="26"
                rx="3"
                fill="#fdf5dd"
                stroke="#c89028"
                strokeWidth="2"
              />
              <circle
                cx="49"
                cy="23"
                r="6.5"
                fill="none"
                stroke="#c89028"
                strokeWidth="1.6"
              />
              <text
                x="49"
                y="27"
                textAnchor="middle"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="11"
                fontWeight="700"
                fill="#c89028"
              >
                €
              </text>
              <rect
                x="10"
                y="32"
                width="76"
                height="52"
                rx="7"
                fill="#e8d5a4"
                stroke="#7a5530"
                strokeWidth="2.4"
              />
              <path d="M10 50 L86 50" stroke="#7a5530" strokeWidth="1.6" />
              <circle cx="70" cy="67" r="4" fill="#7a5530" />
              <circle
                cx="20"
                cy="80"
                r="7"
                fill="#e8c971"
                stroke="#7a5530"
                strokeWidth="1.6"
              />
              <text
                x="20"
                y="84"
                textAnchor="middle"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="9"
                fontWeight="700"
                fill="#7a5530"
              >
                €
              </text>
            </svg>
          </div>

          <p className="text-[14px] text-ink font-medium mt-auto">
            Заплачу наличными при подписании договора
          </p>
        </button>

        {/* Card via Stripe — selection only. Actual button appears on success screen. */}
        <button
          type="button"
          role="radio"
          aria-checked={isStripe}
          onClick={() => set("paymentMethod", "stripe")}
          className={[
            "text-left rounded-2xl p-5 border flex flex-col cursor-pointer transition-all",
            isStripe
              ? "bg-accent-soft/50 border-accent ring-4 ring-accent-soft"
              : "bg-tint border-line hover:border-line-strong",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-[19px] font-semibold mt-0 mb-0 text-ink">
              Картой онлайн
            </h3>
            <RadioDot on={isStripe} />
          </div>
          <p className="text-[13px] text-ink-mute mt-0 mb-4">
            Защищённая оплата через Stripe.
          </p>

          <div
            className="flex-1 flex items-center justify-center my-4"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 96 96"
              width="120"
              height="120"
              fill="none"
              role="img"
              aria-label="Оплата картой"
            >
              {/* Card body */}
              <rect
                x="12"
                y="22"
                width="72"
                height="48"
                rx="6"
                fill="#e8d5a4"
                stroke="#7a5530"
                strokeWidth="2.4"
              />
              {/* Magnetic stripe */}
              <rect x="12" y="32" width="72" height="8" fill="#7a5530" />
              {/* Chip */}
              <rect
                x="22"
                y="48"
                width="14"
                height="11"
                rx="2"
                fill="#e8c971"
                stroke="#7a5530"
                strokeWidth="1.6"
              />
              <path
                d="M26 48 L26 59 M32 48 L32 59 M22 53.5 L36 53.5"
                stroke="#7a5530"
                strokeWidth="1"
              />
              {/* Card number dots */}
              <circle cx="44" cy="62" r="1.5" fill="#7a5530" />
              <circle cx="50" cy="62" r="1.5" fill="#7a5530" />
              <circle cx="56" cy="62" r="1.5" fill="#7a5530" />
              <circle cx="62" cy="62" r="1.5" fill="#7a5530" />
              {/* Wave / contactless */}
              <path
                d="M70 47 q4 4 0 8"
                stroke="#7a5530"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M74 44 q6 6 0 14"
                stroke="#7a5530"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[14px] text-ink font-medium mt-auto">
            Оплачу картой через Stripe
          </p>
        </button>
      </div>

      {isStripe && (
        <div className="bg-accent-soft/30 border border-accent-soft rounded-xl p-4 text-[13.5px] text-ink-soft leading-[1.5] animate-slideIn">
          После заполнения и отправки анкеты на финальном экране появится
          кнопка <strong className="text-ink">«Оплатить через Stripe»</strong>.
          Сейчас никуда переходить не нужно.
        </div>
      )}

      {/* Camp rules */}
      <div className="bg-surface-soft rounded-2xl p-5 border border-line">
        <h3 className="font-display text-[19px] font-semibold mt-0 mb-2 text-ink">
          Правила лагеря
        </h3>
        <p className="text-[13px] text-ink-mute mt-0 mb-3">
          Ознакомьтесь с основными правилами вместе с ребёнком — на следующем
          шаге нужно будет подтвердить согласие с ними.
        </p>
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {CAMP_RULES.map((rule, i) => (
            <li
              key={i}
              className="flex gap-3 text-[14px] text-ink-soft leading-snug"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-soft text-accent-strong grid place-items-center font-bold text-[11px] mt-0.5">
                {i + 1}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RadioDot({ on }: { on: boolean }) {
  return (
    <div
      className={[
        "w-5 h-5 rounded-full border-[1.5px] flex-shrink-0 grid place-items-center transition-all",
        on ? "bg-accent border-accent" : "bg-surface border-line-strong",
      ].join(" ")}
      aria-hidden="true"
    >
      {on && <span className="w-2 h-2 rounded-full bg-white block" />}
    </div>
  );
}
