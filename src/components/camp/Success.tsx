"use client";
import Script from "next/script";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { FormData } from "@/lib/camp/camp";
import { CAMPS } from "@/lib/camp/camp";

// Stripe's buy-button.js registers a <stripe-buy-button> custom element.
// React/TypeScript needs the intrinsic declared so JSX accepts it.
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          "buy-button-id": string;
          "publishable-key": string;
        },
        HTMLElement
      >;
    }
  }
}

type Props = {
  data: FormData;
  onReset: () => void;
  onAddAnother: () => void;
};

export function Success({ data, onReset, onAddAnother }: Props) {
  const camp = CAMPS.find((c) => c.id === data.camp);

  const mailto = (() => {
    const subject = `Регистрация в лагерь — ${data.childName || "ребёнок"}`;
    const lines = [
      `Лагерь: ${camp?.label || ""} (${camp?.dates || ""})`,
      `Ребёнок: ${data.childName}`,
      data.childGender === "boy"
        ? "Пол: Мальчик"
        : data.childGender === "girl"
        ? "Пол: Девочка"
        : "",
      data.childBirth ? `Дата рождения: ${data.childBirth}` : "",
      `Город: ${data.childCity}`,
      data.groupWith ? `Хочет в одной группе с: ${data.groupWith}` : "",
      "",
      `Родитель: ${data.parentName}`,
      `Телефон: +371 ${data.parentPhone}`,
      `E-mail: ${data.parentEmail}`,
      "",
      "Спасибо! Мы получили заявку.",
      "Координатор лагеря: Эсфирь · 27626010",
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join("\n"));
    const to = encodeURIComponent(data.parentEmail || "");
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
  })();

  return (
    <div className="py-8 flex flex-col items-center gap-4 animate-fadeUp text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft text-accent-strong flex items-center justify-center mb-1">
        <svg viewBox="0 0 32 32" width="28" height="28">
          <path
            d="M8 16.5l5 5 11-12"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="font-display text-[28px] font-semibold m-0 text-ink">
        Заявка принята
      </h2>
      <p className="m-0 text-ink-soft max-w-[480px]">
        Спасибо! Мы получили заявку для{" "}
        <strong>{data.childName || "ребёнка"}</strong>
        {camp ? (
          <>
            {" "}на смену{" "}
            <strong>{camp.label.toLowerCase()}</strong> ({camp.dates})
          </>
        ) : null}
        .
      </p>
      <p className="m-0 text-ink-soft max-w-[480px] text-[14px]">
        Договор и список необходимых вещей придут на{" "}
        <strong className="text-ink">
          {data.parentEmail || "указанный e-mail"}
        </strong>
        . Если возникнут вопросы — звоните координатору лагеря{" "}
        <strong className="text-ink">Эсфирь · 27626010</strong>.
      </p>

      {/* Stripe payment block — only when the family chose card payment */}
      {data.paymentMethod === "stripe" && (
        <div className="w-full max-w-[480px] mt-6 p-5 rounded-2xl bg-tint border border-line flex flex-col gap-3 items-center">
          <h3 className="font-display text-[19px] font-semibold m-0 text-ink">
            Оплата картой
          </h3>
          <p className="text-[13px] text-ink-mute m-0 text-center">
            Защищённая страница Stripe. После оплаты придёт чек на e-mail.
          </p>
          <Script
            id="stripe-buy-button-js"
            src="https://js.stripe.com/v3/buy-button.js"
            strategy="afterInteractive"
          />
          <stripe-buy-button
            buy-button-id="buy_btn_1TSsHQE9EzqEVnFDuAYpNLEy"
            publishable-key="pk_live_51T6VPaE9EzqEVnFD3daKO8jAHtCXkjrIWP5NoftTFAF2d5Gddklfq9wfpy3BXlvBYlTOOtTnCnv49uMB6mmyjf1q00icVSQjNP"
          ></stripe-buy-button>
        </div>
      )}

      {data.paymentMethod === "cash" && (
        <div className="w-full max-w-[480px] mt-6 p-5 rounded-2xl bg-tint border border-line text-[14px] text-ink-soft leading-[1.5] text-center">
          Вы выбрали оплату наличными при подписании договора. Координатор
          свяжется с вами для согласования встречи.
        </div>
      )}

      {/* Send copy / call */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {data.parentEmail && (
          <a
            href={mailto}
            className="h-[42px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[14px] bg-surface-soft hover:bg-tint text-ink-soft border border-line transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1.5"
                y="3"
                width="13"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M1.5 4l6.5 5 6.5-5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Отправить копию на e-mail
          </a>
        )}
        <a
          href="tel:+37127626010"
          className="h-[42px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[14px] bg-surface-soft hover:bg-tint text-ink-soft border border-line transition-all"
        >
          📞 Позвонить координатору
        </a>
      </div>

      {/* Primary actions */}
      <div className="w-full max-w-[480px] mt-4 pt-5 border-t border-line flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onAddAnother}
          className="h-[46px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[15px] bg-accent hover:bg-accent-strong text-white shadow-[0_4px_12px_rgba(36,95,167,0.25)] hover:-translate-y-px transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Добавить ещё одного ребёнка
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-[46px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[15px] bg-surface-soft hover:bg-tint text-ink-soft border border-line transition-all"
        >
          Начать новую анкету
        </button>
      </div>
    </div>
  );
}
