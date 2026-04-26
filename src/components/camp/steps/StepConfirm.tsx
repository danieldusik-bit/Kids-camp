"use client";
import { CheckRow } from "../fields/CheckRow";
import type { useCampForm } from "@/lib/camp/useCampForm";
import { CAMPS, type FormData } from "@/lib/camp/camp";

const LANG_LABEL: Record<string, string> = {
  Русский: "🇷🇺 Русский",
  Latviešu: "🇱🇻 Latviešu",
  English: "🇬🇧 English",
};
const ACTIVITY_LABEL: Record<FormData["physicalActivity"], string> = {
  allowed: "Без ограничений",
  limited: "С ограничениями",
};
const DIET_LABEL: Record<FormData["diet"], string> = {
  none: "Без особенностей",
  veg: "Вегетарианец",
  vegan: "Веган",
  other: "Другое",
};

export function StepConfirm({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, errors, submitError, goTo, age } = form;
  const camp = CAMPS.find((c) => c.id === data.camp);
  const ageText =
    age != null
      ? `${age} ${age === 1 ? "год" : age < 5 ? "года" : "лет"}`
      : "—";

  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <p className="text-[15px] text-ink-soft mt-0 mb-1">
        Проверьте, пожалуйста, данные ниже. Если что-то нужно изменить — нажмите
        «Изменить» рядом с разделом, и вы вернётесь на нужный шаг.
      </p>

      {/* Summary */}
      <div className="flex flex-col gap-3">
        <SummarySection
          title="Лагерь"
          onEdit={() => goTo(0)}
          rows={[
            { label: "Смена", value: camp ? camp.label : "Не выбрана" },
            { label: "Даты", value: camp?.dates || "—" },
            { label: "Возраст группы", value: camp?.ageRange || "—" },
          ]}
        />

        <SummarySection
          title="Родитель и контакты"
          onEdit={() => goTo(1)}
          rows={[
            { label: "Ребёнок", value: data.childName || "—" },
            { label: "Родитель", value: data.parentName || "—" },
            {
              label: "Телефон",
              value: data.parentPhone ? `+371 ${data.parentPhone}` : "—",
            },
            { label: "E-mail", value: data.parentEmail || "—" },
            ...(data.emergencyName || data.emergencyPhone
              ? [
                  {
                    label: "Экстренный контакт",
                    value: [
                      data.emergencyName,
                      data.emergencyPhone
                        ? `+371 ${data.emergencyPhone}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  },
                ]
              : []),
          ]}
        />

        <SummarySection
          title="Ребёнок"
          onEdit={() => goTo(2)}
          rows={[
            { label: "Имя и фамилия", value: data.childName || "—" },
            { label: "Дата рождения", value: data.childBirth || "—" },
            ...(camp
              ? [{ label: `Возраст на ${formatStartShort(camp.startDate)}`, value: ageText }]
              : []),
            ...(data.childCode
              ? [{ label: "Персональный код", value: data.childCode }]
              : []),
            { label: "Город", value: data.childCity || "—" },
            {
              label: "Язык общения",
              value:
                LANG_LABEL[data.childLanguage] || data.childLanguage || "—",
            },
            ...(data.groupWith
              ? [{ label: "В одной группе с", value: data.groupWith }]
              : []),
            ...(data.pickupPersons
              ? [{ label: "Кто забирает", value: data.pickupPersons }]
              : []),
            ...(data.selfDismissal
              ? [{ label: "Может уходить сам", value: "Да" }]
              : []),
          ]}
        />

        <SummarySection
          title="Здоровье"
          onEdit={() => goTo(3)}
          rows={[
            {
              label: "Аллергии",
              value:
                data.hasAllergies === "yes"
                  ? `Да${data.allergiesText ? " — " + data.allergiesText : ""}`
                  : "Нет",
            },
            {
              label: "Хронические заболевания",
              value:
                data.hasChronic === "yes"
                  ? `Да${data.chronicText ? " — " + data.chronicText : ""}`
                  : "Нет",
            },
            {
              label: "Регулярные лекарства",
              value:
                data.hasMeds === "yes"
                  ? `Да${data.medsText ? " — " + data.medsText : ""}`
                  : "Нет",
            },
            {
              label: "Физическая активность",
              value:
                data.physicalActivity === "limited"
                  ? `С ограничениями${data.physicalLimitations ? " — " + data.physicalLimitations : ""}`
                  : ACTIVITY_LABEL[data.physicalActivity],
            },
            {
              label: "Питание",
              value:
                data.diet === "other"
                  ? `Другое${data.dietOther ? " — " + data.dietOther : ""}`
                  : DIET_LABEL[data.diet],
            },
            ...(data.notes ? [{ label: "Примечания", value: data.notes }] : []),
            ...(data.source
              ? [{ label: "Откуда узнали", value: data.source }]
              : []),
          ]}
        />

        <SummarySection
          title="Оплата"
          onEdit={() => goTo(4)}
          rows={[
            {
              label: "Стоимость",
              value: `${data.largeFamily ? 180 : 230} € / ребёнок`,
            },
            ...(data.largeFamily
              ? [
                  {
                    label: "Скидка",
                    value: "Многодетная семья · Goda ģimene 3+",
                  },
                ]
              : []),
          ]}
        />
      </div>

      {/* Confirmations */}
      <div className="flex flex-col gap-2.5 pt-2">
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
          После отправки мы пришлём договор и список необходимых вещей на{" "}
          <strong className="text-ink">
            {data.parentEmail || "указанный e-mail"}
          </strong>
          . Если возникнут вопросы — звоните координатору лагеря{" "}
          <strong className="text-ink">Эсфирь · 27627010</strong>.
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

function SummarySection({
  title,
  onEdit,
  rows,
}: {
  title: string;
  onEdit: () => void;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="bg-surface-soft border border-line rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-display text-[17px] font-semibold m-0 text-ink">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-strong hover:text-accent transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M9.5 1.5l3 3-7 7H2.5v-3l7-7z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Изменить
        </button>
      </div>
      <dl className="grid sm:grid-cols-[140px_1fr] grid-cols-1 gap-x-4 gap-y-2 m-0">
        {rows.map((r, i) => (
          <div
            key={i}
            className="contents sm:grid sm:grid-cols-subgrid sm:col-span-2"
          >
            <dt className="text-[12.5px] text-ink-mute font-medium uppercase tracking-[0.04em] sm:normal-case sm:tracking-normal sm:text-[13px]">
              {r.label}
            </dt>
            <dd className="m-0 text-[14px] text-ink whitespace-pre-wrap break-words">
              {r.value || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatStartShort(iso: string) {
  const d = new Date(iso);
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июня",
    "июля",
    "авг",
    "сен",
    "окт",
    "нояб",
    "дек",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
