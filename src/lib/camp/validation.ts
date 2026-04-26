import type { FormData, StepId } from "./camp";

export const isFilled = (v: unknown) =>
  v != null && String(v).trim().length > 0;
export const isEmail = (v: unknown) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());
export const isPhone = (v: unknown) =>
  /^[+\d][\d\s\-()]{6,}$/.test(String(v ?? "").trim());
export const isDate = (v: unknown) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ""));

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
  need("childCity", isFilled(data.childCity), "Укажите город");
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
  child: ["childBirth", "childCity"],
  health: [],
  payment: [],
  confirm: ["confirmTrue", "confirmFirst", "confirmRules"],
};
