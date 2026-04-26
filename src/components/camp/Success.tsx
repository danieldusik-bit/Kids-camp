"use client";
import type { FormData } from "@/lib/camp/camp";

export function Success({ data }: { data: FormData }) {
  return (
    <div className="py-8 text-center flex flex-col items-center gap-2 animate-fadeUp">
      <div className="w-16 h-16 rounded-full bg-accent-soft text-accent-strong flex items-center justify-center mb-2">
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
      <p className="m-0 text-ink-soft max-w-[440px]">
        Спасибо! Мы получили заявку для{" "}
        <strong>{data.childName || "ребёнка"}</strong> и пришлём счёт на{" "}
        <strong>{data.billEmail}</strong> в ближайшие дни.
      </p>
      <p className="m-0 text-ink-soft max-w-[440px] text-[13px]">
        Место в лагере резервируется после оплаты счёта.
      </p>
    </div>
  );
}
