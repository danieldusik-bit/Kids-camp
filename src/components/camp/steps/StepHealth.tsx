"use client";
import { Chips } from "../fields/Chips";
import { Area } from "../fields/Area";
import { Field } from "../fields/Field";
import type { useCampForm } from "@/lib/camp/useCampForm";

const yesNo = [
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
];
const yesNoBlank = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
];

export function StepHealth({
  form,
}: {
  form: ReturnType<typeof useCampForm>;
}) {
  const { data, set, errors, touch } = form;
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Аллергии"
          value={data.hasAllergies}
          onChange={(v) => set("hasAllergies", v as "yes" | "no")}
          options={yesNo}
        />
        {data.hasAllergies === "yes" && (
          <div className="animate-slideIn">
            <Area
              id="allergiesText"
              value={data.allergiesText}
              onChange={(v) => set("allergiesText", v)}
              placeholder="Например: орехи, пыльца, амоксициллин."
            />
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Хронические заболевания"
          value={data.hasChronic}
          onChange={(v) => set("hasChronic", v as "yes" | "no")}
          options={yesNo}
        />
        {data.hasChronic === "yes" && (
          <div className="animate-slideIn">
            <Area
              id="chronicText"
              value={data.chronicText}
              onChange={(v) => set("chronicText", v)}
              placeholder="Диагноз, особенности ухода, ограничения."
            />
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Регулярные лекарства"
          value={data.hasMeds}
          onChange={(v) => set("hasMeds", v as "yes" | "no")}
          options={yesNo}
        />
        {data.hasMeds === "yes" && (
          <div className="animate-slideIn">
            <Area
              id="medsText"
              value={data.medsText}
              onChange={(v) => set("medsText", v)}
              placeholder="Препарат, дозировка, время приёма."
            />
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Особенности характера или психики"
          value={data.hasSpecialTraits}
          onChange={(v) => set("hasSpecialTraits", v as "yes" | "no")}
          options={yesNo}
        />
        {data.hasSpecialTraits === "yes" && (
          <div className="animate-slideIn">
            <Area
              id="specialTraitsText"
              value={data.specialTraitsText}
              onChange={(v) => set("specialTraitsText", v)}
              placeholder="Особенности поведения, тревожности, СДВГ, аутизм, страхи, нюансы общения и т. д."
            />
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Прививка от энцефалита"
          required
          value={data.encephalitisVaccine}
          onChange={(v) =>
            set("encephalitisVaccine", v as "" | "yes" | "no")
          }
          options={yesNoBlank}
        />
        {errors.encephalitisVaccine && (
          <div
            className="text-xs text-err"
            onClick={() => touch("encephalitisVaccine")}
          >
            {errors.encephalitisVaccine}
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Участвовал ли ваш ребёнок в других лагерях?"
          required
          value={data.participatedOtherCamps}
          onChange={(v) =>
            set("participatedOtherCamps", v as "" | "yes" | "no")
          }
          options={yesNoBlank}
        />
        {errors.participatedOtherCamps && (
          <div className="text-xs text-err">
            {errors.participatedOtherCamps}
          </div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Умеет ли ребёнок плавать?"
          required
          value={data.swimmingAbility}
          onChange={(v) =>
            set("swimmingAbility", v as "" | "yes" | "no" | "weak")
          }
          options={[
            { value: "yes", label: "Да, умеет" },
            { value: "weak", label: "Умеет, но плохо" },
            { value: "no", label: "Нет, не умеет" },
          ]}
        />
        {errors.swimmingAbility && (
          <div className="text-xs text-err">{errors.swimmingAbility}</div>
        )}
      </div>

      <div className="bg-surface-soft border border-line rounded-2xl p-5 flex flex-col gap-3">
        <Chips
          label="Физическая активность"
          value={data.physicalActivity}
          onChange={(v) =>
            set("physicalActivity", v as "allowed" | "limited")
          }
          options={[
            { value: "allowed", label: "Без ограничений" },
            { value: "limited", label: "С ограничениями" },
          ]}
        />
        {data.physicalActivity === "limited" && (
          <div className="animate-slideIn">
            <Area
              id="physicalLimitations"
              value={data.physicalLimitations}
              onChange={(v) => set("physicalLimitations", v)}
              placeholder="Опишите ограничения: какие виды активности нельзя, когда нужен перерыв и т. д."
            />
          </div>
        )}
      </div>

      <Chips
        label="Особенности питания"
        value={data.diet}
        onChange={(v) =>
          set("diet", v as "none" | "veg" | "vegan" | "other")
        }
        options={[
          { value: "none", label: "Без особенностей" },
          { value: "veg", label: "Вегетарианец" },
          { value: "vegan", label: "Веган" },
          { value: "other", label: "Другое" },
        ]}
      />
      {data.diet === "other" && (
        <div className="animate-slideIn">
          <Field
            id="dietOther"
            label="Опишите особенности питания"
            value={data.dietOther}
            onChange={(v) => set("dietOther", v)}
            placeholder="Например: безглютеновая диета"
          />
        </div>
      )}

      <Area
        id="notes"
        label="Что ещё стоит знать вожатым"
        rows={3}
        value={data.notes}
        onChange={(v) => set("notes", v)}
        placeholder="Страхи, привычки, особенности характера, любимые занятия."
      />

      <Field
        id="source"
        label="Откуда вы узнали о лагере"
        value={data.source}
        onChange={(v) => set("source", v)}
        placeholder="Друзья, Instagram, школа..."
      />
    </div>
  );
}
