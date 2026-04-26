"use client";
import { Field } from "../fields/Field";
import type { useCampForm } from "@/lib/camp/useCampForm";
import { CAMP } from "@/lib/camp/camp";

export function StepBilling({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, touch, errors, price } = form;
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <div className="rounded-2xl p-6 flex items-center justify-between gap-4 bg-gradient-to-br from-accent-soft to-tint border border-line">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute font-bold">
            Стоимость смены
          </span>
          <span className="text-[13px] text-ink-soft">
            7 дней · полное проживание · все занятия
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

      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Field
          id="billName"
          label="Имя или название компании"
          required
          value={data.billName}
          onChange={(v) => set("billName", v)}
          onBlur={() => touch("billName")}
          error={errors.billName}
          placeholder="Анна Иванова или SIA Example"
        />
        <Field
          id="billCode"
          label="Персональный или регистрационный код"
          required
          value={data.billCode}
          onChange={(v) => set("billCode", v)}
          onBlur={() => touch("billCode")}
          error={errors.billCode}
          placeholder="123456-12345"
        />
      </div>
      <Field
        id="billAddr"
        label="Юридический адрес"
        required
        value={data.billAddr}
        onChange={(v) => set("billAddr", v)}
        onBlur={() => touch("billAddr")}
        error={errors.billAddr}
        placeholder="Bīriņu iela 6, Rīga, LV-1011"
      />
      <Field
        id="billEmail"
        label="E-mail для счёта"
        required
        type="email"
        value={data.billEmail}
        onChange={(v) => set("billEmail", v)}
        onBlur={() => touch("billEmail")}
        error={errors.billEmail}
        placeholder="invoice@example.com"
        inputMode="email"
        hint="Счёт придёт сюда в течение 2 рабочих дней."
      />

      <div className="bg-tint rounded-2xl p-5 border border-line">
        <h3 className="font-display text-[19px] font-semibold mt-0 mb-2 text-ink">
          Реквизиты для оплаты
        </h3>
        <div className="bg-surface rounded-xl p-4 font-mono text-[13.5px] text-ink-soft border border-line">
          <div className="font-semibold text-ink">JK NAMS BIEDRIBA</div>
          <div className="font-bold text-accent-strong">
            LV31PARX0033210230002
          </div>
          <div className="font-sans text-ink-mute text-[12.5px] mt-2">
            Цель платежа: ZIEDOJUMS bērnu nometnei 2026 + имя и фамилия ребёнка
          </div>
        </div>
      </div>
    </div>
  );
}
