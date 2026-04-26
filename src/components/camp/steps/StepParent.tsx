"use client";
import { Field } from "../fields/Field";
import type { useCampForm } from "@/lib/camp/useCampForm";

export function StepParent({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, touch, errors } = form;
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Field
          id="parentName"
          label="Имя и фамилия"
          required
          value={data.parentName}
          onChange={(v) => set("parentName", v)}
          onBlur={() => touch("parentName")}
          error={errors.parentName}
          placeholder="Анна Иванова"
          autoComplete="name"
        />
        <Field
          id="parentPhone"
          label="Телефон"
          required
          type="tel"
          value={data.parentPhone}
          onChange={(v) => set("parentPhone", v)}
          onBlur={() => touch("parentPhone")}
          error={errors.parentPhone}
          placeholder="20 123 456"
          autoComplete="tel"
          inputMode="tel"
          prefix="+371"
        />
      </div>
      <Field
        id="parentEmail"
        label="E-mail"
        required
        type="email"
        value={data.parentEmail}
        onChange={(v) => set("parentEmail", v)}
        onBlur={() => touch("parentEmail")}
        error={errors.parentEmail}
        placeholder="anna@example.com"
        autoComplete="email"
        inputMode="email"
      />

      <div className="bg-tint rounded-2xl p-5 border border-line">
        <h3 className="font-display text-[19px] font-semibold mt-0 mb-1 text-ink">
          Экстренный контакт
        </h3>
        <p className="text-[13px] text-ink-mute mt-0 mb-4">
          На случай, если мы не сможем связаться с вами.
        </p>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <Field
            id="emergencyName"
            label="Имя контакта"
            value={data.emergencyName}
            onChange={(v) => set("emergencyName", v)}
            placeholder="Мария Иванова"
          />
          <Field
            id="emergencyPhone"
            label="Телефон"
            type="tel"
            value={data.emergencyPhone}
            onChange={(v) => set("emergencyPhone", v)}
            placeholder="20 654 321"
            inputMode="tel"
            prefix="+371"
          />
        </div>
      </div>
    </div>
  );
}
