"use client";
import { CheckRow } from "../fields/CheckRow";
import type { useCampForm } from "@/lib/camp/useCampForm";

export function StepConfirm({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, errors, submitError } = form;
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <p className="text-[15px] text-ink-soft mt-0 mb-1">
        Подтвердите, пожалуйста, четыре пункта — и можно отправлять заявку.
      </p>

      <div className="flex flex-col gap-2.5">
        <CheckRow
          checked={data.confirmTrue}
          onChange={(v) => set("confirmTrue", v)}
          error={!!errors.confirmTrue}
        >
          Указанные сведения о ребёнке соответствуют действительности.
        </CheckRow>
        <CheckRow
          checked={data.confirmFirst}
          onChange={(v) => set("confirmFirst", v)}
          error={!!errors.confirmFirst}
        >
          Я разрешаю оказание первой медицинской помощи в случае необходимости.
        </CheckRow>
        <CheckRow
          checked={data.confirmRules}
          onChange={(v) => set("confirmRules", v)}
          error={!!errors.confirmRules}
        >
          Я ознакомлен(а) с правилами лагеря и согласен(на) с ними.
        </CheckRow>
        <CheckRow
          checked={data.confirmPaid}
          onChange={(v) => set("confirmPaid", v)}
          error={!!errors.confirmPaid}
        >
          Я понимаю, что место бронируется только после оплаты счёта.
        </CheckRow>
      </div>

      <div className="bg-tint rounded-2xl p-4 flex items-start gap-3 border border-line">
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          className="text-accent-strong flex-shrink-0 mt-0.5"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M10 9v5M10 6.5v.01"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-[13.5px] leading-[1.5] text-ink-soft">
          После отправки мы пришлём счёт на{" "}
          <strong className="text-ink">
            {data.billEmail || "указанный e-mail"}
          </strong>{" "}
          и подтвердим место в смене 28 июня — 4 июля 2026. Если возникнут
          вопросы — звоните <strong className="text-ink">Дану 26809250</strong>{" "}
          или <strong className="text-ink">Елене 29164485</strong>.
        </div>
      </div>

      {submitError && (
        <div className="bg-err/10 border border-err text-err rounded-xl p-4 text-sm font-medium">
          {submitError}
        </div>
      )}
    </div>
  );
}
