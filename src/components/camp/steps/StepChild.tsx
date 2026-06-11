"use client";
import { Field } from "../fields/Field";
import { Chips } from "../fields/Chips";
import { Area } from "../fields/Area";
import { Notice } from "../Notice";
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
        label="Имя и фамилия ребёнка (на латышском)"
        required
        value={data.childName}
        onChange={(v) => set("childName", v)}
        onBlur={() => touch("childName")}
        error={errors.childName}
        placeholder="Jānis Jansons"
        hint="Заполнено на предыдущем шаге — при необходимости можно поправить."
      />

      <Chips
        label="Пол"
        value={data.childGender}
        onChange={(v) => set("childGender", v as "boy" | "girl")}
        options={[
          { value: "boy", label: "👦 Мальчик" },
          { value: "girl", label: "👧 Девочка" },
        ]}
      />

      {data.childGender === "boy" && data.camp === "kids" && (
        <Notice tone="warn" icon="⚠️">
          К сожалению, места для <strong>мальчиков</strong> в детском лагере
          закончились — регистрация мальчиков на эту смену сейчас закрыта, и
          продолжить с этим выбором нельзя. Пожалуйста, свяжитесь с
          координатором: Эсфирь&nbsp;·&nbsp;27626010 — мы сообщим, если место
          освободится.
        </Notice>
      )}

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

      <Field
        id="childPersonalCode"
        label="Personas kods (личный код)"
        required
        value={data.childPersonalCode}
        onChange={(v) => set("childPersonalCode", v)}
        onBlur={() => touch("childPersonalCode")}
        error={errors.childPersonalCode}
        placeholder="010203-12345"
        hint="Латвийский personas kods ребёнка — формат 6 цифр - 5 цифр."
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

      <div className="bg-tint rounded-2xl p-5 border border-line flex flex-col gap-4">
        <h3 className="font-display text-[19px] font-semibold mt-0 mb-0 text-ink">
          Адрес проживания
        </h3>
        <Area
          id="declaredAddress"
          label="Декларированный адрес"
          required
          rows={2}
          value={data.declaredAddress}
          onChange={(v) => set("declaredAddress", v)}
          onBlur={() => touch("declaredAddress")}
          error={errors.declaredAddress}
          placeholder="Brīvības iela 1-15, Rīga, LV-1010"
        />
        <label className="flex items-center gap-3 text-[14px] text-ink-soft">
          <input
            type="checkbox"
            checked={data.actualSameAsDeclared}
            onChange={(e) => set("actualSameAsDeclared", e.target.checked)}
            className="w-[18px] h-[18px] accent-[rgb(var(--accent))]"
          />
          Фактический адрес совпадает с декларированным
        </label>
        {!data.actualSameAsDeclared && (
          <div className="animate-slideIn">
            <Area
              id="actualAddress"
              label="Фактический адрес"
              required
              rows={2}
              value={data.actualAddress}
              onChange={(v) => set("actualAddress", v)}
              onBlur={() => touch("actualAddress")}
              error={errors.actualAddress}
              placeholder="Где ребёнок живёт фактически"
            />
          </div>
        )}
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

      <div className="bg-tint rounded-2xl p-5 border border-line flex flex-col gap-5">
        <div>
          <h3 className="font-display text-[19px] font-semibold mt-0 mb-1 text-ink">
            Кто может забирать ребёнка
          </h3>
          <p className="text-[13px] text-ink-mute mt-0 mb-0">
            Минимум два контакта — оба обязательны. Это могут быть родители,
            бабушка, дедушка, тётя — кто угодно из семьи. Кроме того, кто
            заполняет договор.
          </p>
        </div>

        <PickupContact
          n={1}
          name={data.pickup1Name}
          phone={data.pickup1Phone}
          relation={data.pickup1Relation}
          onName={(v) => set("pickup1Name", v)}
          onPhone={(v) => set("pickup1Phone", v)}
          onRelation={(v) => set("pickup1Relation", v)}
          onTouchName={() => touch("pickup1Name")}
          onTouchPhone={() => touch("pickup1Phone")}
          onTouchRelation={() => touch("pickup1Relation")}
          errName={errors.pickup1Name}
          errPhone={errors.pickup1Phone}
          errRelation={errors.pickup1Relation}
        />

        <PickupContact
          n={2}
          name={data.pickup2Name}
          phone={data.pickup2Phone}
          relation={data.pickup2Relation}
          onName={(v) => set("pickup2Name", v)}
          onPhone={(v) => set("pickup2Phone", v)}
          onRelation={(v) => set("pickup2Relation", v)}
          onTouchName={() => touch("pickup2Name")}
          onTouchPhone={() => touch("pickup2Phone")}
          onTouchRelation={() => touch("pickup2Relation")}
          errName={errors.pickup2Name}
          errPhone={errors.pickup2Phone}
          errRelation={errors.pickup2Relation}
        />
      </div>
    </div>
  );
}

function PickupContact({
  n,
  name,
  phone,
  relation,
  onName,
  onPhone,
  onRelation,
  onTouchName,
  onTouchPhone,
  onTouchRelation,
  errName,
  errPhone,
  errRelation,
}: {
  n: number;
  name: string;
  phone: string;
  relation: string;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onRelation: (v: string) => void;
  onTouchName: () => void;
  onTouchPhone: () => void;
  onTouchRelation: () => void;
  errName?: string;
  errPhone?: string;
  errRelation?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-line flex flex-col gap-3">
      <div className="text-[13px] font-semibold text-ink-soft uppercase tracking-[0.04em]">
        Контакт #{n}
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
        <Field
          id={`pickup${n}Name`}
          label="Имя и фамилия"
          required
          value={name}
          onChange={onName}
          onBlur={onTouchName}
          error={errName}
          placeholder="Aija Bērziņa"
          autoComplete="name"
        />
        <Field
          id={`pickup${n}Phone`}
          label="Телефон"
          required
          type="tel"
          value={phone}
          onChange={onPhone}
          onBlur={onTouchPhone}
          error={errPhone}
          placeholder="20 123 456"
          inputMode="tel"
          prefix="+371"
        />
      </div>
      <Field
        id={`pickup${n}Relation`}
        label="Кем приходится семье"
        required
        value={relation}
        onChange={onRelation}
        onBlur={onTouchRelation}
        error={errRelation}
        placeholder="Мама, папа, бабушка, тётя…"
      />
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
