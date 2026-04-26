"use client";
import { CAMPS, type CampId } from "@/lib/camp/camp";
import type { useCampForm } from "@/lib/camp/useCampForm";

export function StepCamp({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set } = form;
  return (
    <div className="animate-fadeUp flex flex-col gap-4">
      <p className="text-[15px] text-ink-soft mt-0 mb-1">
        Выберите смену, в которую вы хотите зарегистрировать ребёнка. В сезоне
        2026 проходят два лагеря.
      </p>

      <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
        {CAMPS.map((c) => {
          const on = data.camp === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set("camp", c.id as CampId)}
              className={[
                "text-left rounded-2xl border-[1.5px] p-5 transition-all flex flex-col gap-3",
                on
                  ? "bg-accent-soft/40 border-accent shadow-[0_4px_16px_rgba(179,107,61,0.18)]"
                  : "bg-surface-soft border-line hover:border-line-strong hover:bg-surface",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl leading-none">{c.emoji}</div>
                <div
                  className={[
                    "w-5 h-5 rounded-full border-[1.5px] flex-shrink-0 mt-0.5 grid place-items-center transition-all",
                    on
                      ? "bg-accent border-accent"
                      : "bg-surface border-line-strong",
                  ].join(" ")}
                >
                  {on && (
                    <span className="w-2 h-2 rounded-full bg-white block" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-[19px] font-semibold text-ink leading-tight">
                  {c.label}
                </span>
                <span className="text-[13px] text-ink-mute">
                  {c.ageRange}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-accent-strong"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="10"
                      height="9"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 1.5v3M9 1.5v3M2 6h10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {c.dates}
                </div>
                <div className="text-[12.5px] text-ink-mute leading-snug">
                  {c.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
