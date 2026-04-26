"use client";
import { STEPS } from "@/lib/camp/camp";

type Props = {
  stepIdx: number;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting?: boolean;
};

export function Footer({
  stepIdx,
  isLast,
  onPrev,
  onNext,
  onSubmit,
  submitting,
}: Props) {
  const pct = ((stepIdx + 1) / STEPS.length) * 100;
  return (
    <footer className="grid sm:grid-cols-[auto_1fr_auto] grid-cols-1 items-center gap-y-3 sm:gap-x-[18px] mt-7 pt-[22px] border-t border-line">
      <button
        type="button"
        onClick={onPrev}
        disabled={stepIdx === 0}
        className="h-[46px] px-[22px] rounded-full font-semibold text-[15px] text-ink-soft hover:text-ink transition-colors disabled:opacity-35 disabled:cursor-default justify-self-start"
      >
        ← Назад
      </button>
      <div className="flex flex-col gap-1.5 sm:order-none order-3">
        <span className="text-xs text-ink-mute font-medium">
          Шаг {stepIdx + 1} из {STEPS.length}
        </span>
        <div className="h-1 bg-line rounded overflow-hidden">
          <div
            className="h-full bg-accent rounded transition-[width] duration-300 ease-out"
            style={{ width: pct + "%" }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={isLast ? onSubmit : onNext}
        disabled={submitting}
        className="h-[46px] px-[22px] rounded-full font-semibold text-[15px] bg-accent hover:bg-accent-strong text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(179,107,61,0.3)] hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_6px_16px_rgba(179,107,61,0.35)] transition-all justify-self-end disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLast
          ? submitting
            ? "Отправка..."
            : "Отправить заявку"
          : "Далее →"}
      </button>
    </footer>
  );
}
