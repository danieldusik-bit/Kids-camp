"use client";
import type { FormData } from "@/lib/camp/camp";
import { CAMPS } from "@/lib/camp/camp";

export function Success({ data }: { data: FormData }) {
  const camp = CAMPS.find((c) => c.id === data.camp);

  const mailto = (() => {
    const subject = `Регистрация в лагерь — ${data.childName || "ребёнок"}`;
    const lines = [
      `Лагерь: ${camp?.label || ""} (${camp?.dates || ""})`,
      `Ребёнок: ${data.childName}`,
      data.childBirth ? `Дата рождения: ${data.childBirth}` : "",
      `Город: ${data.childCity}`,
      data.groupWith ? `Хочет в одной группе с: ${data.groupWith}` : "",
      "",
      `Родитель: ${data.parentName}`,
      `Телефон: +371 ${data.parentPhone}`,
      `E-mail: ${data.parentEmail}`,
      "",
      "Спасибо! Мы получили заявку.",
      "Координатор лагеря: Эсфирь · 27627010",
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
        <strong className="text-ink">Эсфирь · 27627010</strong>.
      </p>

      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {data.parentEmail && (
          <a
            href={mailto}
            className="h-[42px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[14px] bg-accent hover:bg-accent-strong text-white shadow-[0_4px_12px_rgba(179,107,61,0.25)] transition-all"
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
          href="tel:+37127627010"
          className="h-[42px] px-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[14px] bg-surface-soft hover:bg-tint text-ink-soft border border-line transition-all"
        >
          📞 Позвонить координатору
        </a>
      </div>
    </div>
  );
}
