import type { FormData, StepId } from "./camp";

export const isFilled = (v: unknown) =>
  v != null && String(v).trim().length > 0;
export const isEmail = (v: unknown) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());
export const isPhone = (v: unknown) =>
  /^[+\d][\d\s\-()]{6,}$/.test(String(v ?? "").trim());
export const isDate = (v: unknown) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ""));
/** Latvian personas kods: 6 digits + dash + 5 digits. */
export const isPersonalCode = (v: unknown) =>
  /^\d{6}-\d{5}$/.test(String(v ?? "").trim());
/** "yes" / "no" answer must be picked (non-empty). */
export const isYesNo = (v: unknown) => v === "yes" || v === "no";
/** Swimming chip — one of three values must be picked. */
export const isSwimmingAnswer = (v: unknown) =>
  v === "yes" || v === "no" || v === "weak";

export type Errors = Partial<Record<keyof FormData, string>>;

export function validate(
  data: FormData,
  touched: Partial<Record<keyof FormData, boolean>>,
  force = false
): Errors {
  const errs: Errors = {};
  const need = (k: keyof FormData, ok: boolean, msg: string) => {
    if ((touched[k] || force) && !ok) errs[k] = msg;
  };
  need("camp", isFilled(data.camp), "Выберите лагерь");
  need("childName", isFilled(data.childName), "Укажите имя ребёнка");
  need("parentName", isFilled(data.parentName), "Укажите имя и фамилию");
  need("parentPhone", isPhone(data.parentPhone), "Введите номер телефона");
  need("parentEmail", isEmail(data.parentEmail), "Проверьте e-mail");
  need("childBirth", isDate(data.childBirth), "Укажите дату рождения");
  need(
    "childPersonalCode",
    isPersonalCode(data.childPersonalCode),
    "Формат: 6 цифр - 5 цифр (например 010203-12345)"
  );
  need("childCity", isFilled(data.childCity), "Укажите город");
  need(
    "declaredAddress",
    isFilled(data.declaredAddress),
    "Укажите декларированный адрес"
  );
  if (!data.actualSameAsDeclared) {
    need(
      "actualAddress",
      isFilled(data.actualAddress),
      "Укажите фактический адрес"
    );
  }
  // Pickup contact #1 required (2nd is optional but if started must be valid).
  need("pickup1Name", isFilled(data.pickup1Name), "Имя и фамилия контакта");
  need("pickup1Phone", isPhone(data.pickup1Phone), "Телефон контакта");
  need(
    "pickup1Relation",
    isFilled(data.pickup1Relation),
    "Кем приходится семье"
  );
  need("pickup2Name", isFilled(data.pickup2Name), "Имя и фамилия контакта");
  need("pickup2Phone", isPhone(data.pickup2Phone), "Телефон контакта");
  need(
    "pickup2Relation",
    isFilled(data.pickup2Relation),
    "Кем приходится семье"
  );
  // New health questions — Yes/No must be answered.
  need(
    "encephalitisVaccine",
    isYesNo(data.encephalitisVaccine),
    "Выберите Да или Нет"
  );
  need(
    "participatedOtherCamps",
    isYesNo(data.participatedOtherCamps),
    "Выберите Да или Нет"
  );
  need(
    "swimmingAbility",
    isSwimmingAnswer(data.swimmingAbility),
    "Выберите вариант"
  );
  if (force) {
    if (!data.confirmTrue) errs.confirmTrue = "_";
    if (!data.confirmFirst) errs.confirmFirst = "_";
    if (!data.confirmRules) errs.confirmRules = "_";
  }
  return errs;
}

export const STEP_REQUIRED: Record<StepId, (keyof FormData)[]> = {
  camp: ["camp"],
  parent: ["childName", "parentName", "parentPhone", "parentEmail"],
  child: [
    "childBirth",
    "childPersonalCode",
    "childCity",
    "declaredAddress",
    "pickup1Name",
    "pickup1Phone",
    "pickup1Relation",
    "pickup2Name",
    "pickup2Phone",
    "pickup2Relation",
  ],
  health: ["encephalitisVaccine", "participatedOtherCamps", "swimmingAbility"],
  payment: [],
  confirm: ["confirmTrue", "confirmFirst", "confirmRules"],
};
