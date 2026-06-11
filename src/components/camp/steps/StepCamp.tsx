"use client";
import { CAMPS, type CampId, type CampInfo } from "@/lib/camp/camp";
import type { useCampForm } from "@/lib/camp/useCampForm";
import { Notice } from "../Notice";

export function StepCamp({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set } = form;
  const selectedCamp = CAMPS.find((c) => c.id === data.camp) || null;
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <Notice tone="info" icon="📝">
        Пожалуйста, заполняйте всю анкету на латышском языке{" "}
        <strong>(Latviešu valodā)</strong> — имена, фамилии и адреса должны
        совпадать с официальными документами и договором (Līgums).
      </Notice>

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
                  ? "bg-accent-soft/40 border-accent shadow-[0_4px_16px_rgba(36,95,167,0.18)]"
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
              </div>
            </button>
          );
        })}
      </div>

      {data.camp === "kids" && (
        <Notice tone="warn" icon="⚠️">
          Обратите внимание: места для <strong>мальчиков</strong> в детском
          лагере уже закончились. Для девочек места ещё есть. По вопросам —
          Эсфирь&nbsp;·&nbsp;27626010.
        </Notice>
      )}

      {selectedCamp && <CampDescription camp={selectedCamp} />}
    </div>
  );
}

function CampDescription({ camp }: { camp: CampInfo }) {
  return (
    <div className="bg-surface-soft border border-line rounded-2xl p-5 sm:p-6 flex flex-col gap-4 animate-slideIn">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-[19px] font-semibold m-0 text-ink leading-snug">
          {camp.tagline}
        </h3>
        <p className="text-[14px] text-ink-soft m-0 leading-[1.55]">
          {camp.intro}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-6 gap-y-4">
        {camp.sections.map((s) => (
          <div key={s.title} className="flex flex-col gap-1.5">
            <div className="text-[14px] font-semibold text-ink">{s.title}</div>
            <ul className="m-0 p-0 list-none flex flex-col gap-1">
              {s.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[13.5px] text-ink-soft leading-snug"
                >
                  <span className="text-accent-strong leading-tight">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
