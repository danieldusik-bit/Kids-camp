"use client";
import { STEPS, CAMP } from "@/lib/camp/camp";

type Props = { current: number; onJump: (i: number) => void };

export function SideNav({ current, onJump }: Props) {
  return (
    <aside className="lg:sticky lg:top-6 bg-surface rounded-3xl p-[18px] border border-line shadow-[0_4px_16px_rgba(60,40,20,0.04)]">
      <div className="text-[11px] uppercase tracking-[0.12em] text-ink-mute font-bold px-2.5 pb-3">
        Шаги
      </div>
      <ol className="list-none m-0 mb-4 flex flex-col gap-0.5">
        {STEPS.map((s, i) => {
          const state =
            i < current ? "done" : i === current ? "active" : "todo";
          const disabled = i > current;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onJump(i)}
                className={[
                  "w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all text-left",
                  state === "active" && "bg-tint text-ink",
                  state === "done" &&
                    "text-ink-soft hover:bg-surface-soft cursor-pointer",
                  state === "todo" && "text-ink-mute cursor-default",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all border-[1.5px]",
                    state === "active" &&
                      "bg-accent border-accent text-white ring-4 ring-accent-soft",
                    state === "done" && "bg-accent border-accent text-white",
                    state === "todo" &&
                      "bg-surface-soft border-line text-ink-mute",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {state === "done" ? (
                    <svg viewBox="0 0 14 14" width="11" height="11">
                      <path
                        d="M2 7.5l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    s.short
                  )}
                </span>
                <span
                  className={
                    state === "active"
                      ? "text-sm font-bold"
                      : "text-sm font-medium"
                  }
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-line pt-3.5 flex flex-col gap-2">
        <Row label="Даты" value={CAMP.dates} />
        <Row label="Место" value={CAMP.location} />
        <Row label="Возраст" value="7 — 14 лет" />
      </div>
    </aside>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 px-2.5 text-[12.5px]">
      <span className="text-ink-mute">{label}</span>
      <strong className="text-ink font-semibold">{value}</strong>
    </div>
  );
}
