"use client";
import { Field } from "../fields/Field";
import { Chips } from "../fields/Chips";
import { Area } from "../fields/Area";
import type { useCampForm } from "@/lib/camp/useCampForm";
import { CAMPS } from "@/lib/camp/camp";

export function StepChild({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, touch, errors, age } = form;
  const camp = CAMPS.find((c) => c.id === data.camp);
  const ageLabel = camp ? `Возраст на ${formatStart(camp.startDate)}` : "Возраст";
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      {/* Pre-filled child name (read-only display, but editable if needed) */}
      <Field
        id="childName"
        label="Имя и фамилия ребёнка"
        required
        value={data.childName}
        onChange={(v) => set("childName", v)}
        onBlur={() => touch("childName")}
        error={errors.childName}
        placeholder="Лев Иванов"
        hint="Заполнено на предыдущем шаге — при необходимости можно поправить."
      />

      <Field
        id="childBirth"
        label="Дата рождения"
        required
        type="date"
        value={data.childBirth}
        onChange={(v) => set("childBirth", v)}
        onBlur={() => touch("childBirth")}
        error={errors.childBirth}
      />

      <div
        className={[
          "rounded-2xl p-4 flex items-center justify-between gap-3 border-[1.5px] transition-all",
          age != null
            ? "bg-accent-soft border-accent"
            : "bg-surface-soft border-dashed border-line-strong",
        ].join(" ")}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute font-bold">
            {ageLabel}
          </span>
          <span className="text-[13px] text-ink-soft">
            {age != null
              ? "Будет в первый день смены"
              : "Заполнится автоматически"}
          </span>
        </div>
        <div className="font-extrabold text-2xl text-accent-strong tabular-nums">
          {age != null
            ? `${age} ${age === 1 ? "год" : age < 5 ? "года" : "лет"}`
            : "—"}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Field
          id="childCode"
          label="Персональный код"
          value={data.childCode}
          onChange={(v) => set("childCode", v)}
          placeholder="123456-12345"
          hint="Если есть. Поможет с оформлением страховки."
        />
        <Field
          id="childCity"
          label="Город / посёлок"
          required
          value={data.childCity}
          onChange={(v) => set("childCity", v)}
          onBlur={() => touch("childCity")}
          error={errors.childCity}
          placeholder="Рига"
        />
      </div>

      <Chips
        label="Язык общения"
        required
        value={data.childLanguage}
        onChange={(v) => set("childLanguage", v)}
        options={[
          { value: "Русский", label: "🇷🇺 Русский" },
          { value: "Latviešu", label: "🇱🇻 Latviešu" },
          { value: "English", label: "🇬🇧 English" },
        ]}
      />

      <Field
        id="groupWith"
        label="Хочет быть в одной группе с"
        value={data.groupWith}
        onChange={(v) => set("groupWith", v)}
        placeholder="Имя и фамилия друга/подруги"
        hint="Если ребёнок едет с друзьями — постараемся объединить их в одну группу."
      />

      <div className="bg-tint rounded-2xl p-5 border border-line flex flex-col gap-4">
        <h3 className="font-display text-[19px] font-semibold mt-0 mb-0 text-ink">
          Кто может забирать ребёнка
        </h3>
        <Area
          id="pickupPersons"
          value={data.pickupPersons}
          onChange={(v) => set("pickupPersons", v)}
          placeholder="Имя, родство, телефон. По одному в строке."
        />
        <label className="flex items-center gap-3 text-[14px] text-ink-soft">
          <input
            type="checkbox"
            checked={data.selfDismissal}
            onChange={(e) => set("selfDismissal", e.target.checked)}
            className="w-[18px] h-[18px] accent-[rgb(var(--accent))]"
          />
          Ребёнок может уходить домой самостоятельно
        </label>
      </div>
    </div>
  );
}

function formatStart(iso: string) {
  const d = new Date(iso);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
