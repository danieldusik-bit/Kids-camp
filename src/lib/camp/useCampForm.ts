"use client";
import { useCallback, useMemo, useState } from "react";
import {
  CAMPS,
  INITIAL_DATA,
  STEPS,
  type FormData,
  type StepId,
  type CampId,
} from "./camp";
import {
  isDate,
  isEmail,
  isFilled,
  isPhone,
  STEP_REQUIRED,
  validate,
} from "./validation";

const LANGUAGE_LABEL: Record<string, string> = {
  Русский: "Русский",
  Latviešu: "Латышский",
  English: "Английский",
};
const DIET_LABEL: Record<FormData["diet"], string> = {
  none: "нет",
  veg: "вегетарианское",
  vegan: "веганское",
  other: "другое",
};
const ACTIVITY_LABEL: Record<FormData["physicalActivity"], string> = {
  allowed: "Разрешено",
  limited: "С ограничениями",
};

function startDateFor(camp: CampId | ""): string {
  const c = CAMPS.find((x) => x.id === camp);
  return c?.startDate || CAMPS[0].startDate;
}

function calcAge(birth: string, campStart: string): number | null {
  if (!isDate(birth)) return null;
  const start = new Date(campStart);
  const b = new Date(birth);
  let a = start.getFullYear() - b.getFullYear();
  const m = start.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && start.getDate() < b.getDate())) a--;
  return a >= 0 && a < 100 ? a : null;
}

function toApiPayload(data: FormData) {
  const age = calcAge(data.childBirth, startDateFor(data.camp)) ?? 0;
  return {
    camp: data.camp,
    groupWith: data.groupWith,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    parentEmail: data.parentEmail,
    emergencyContactName: data.emergencyName,
    emergencyContactPhone: data.emergencyPhone,
    childName: data.childName,
    childDOB: data.childBirth,
    childAge: age,
    childPersonalId: data.childCode,
    childLanguage: LANGUAGE_LABEL[data.childLanguage] || data.childLanguage,
    city: data.childCity,
    pickupAuthorized: data.pickupPersons,
    childCanLeaveAlone: data.selfDismissal,
    hasAllergies: data.hasAllergies === "yes",
    allergiesDetails: data.allergiesText,
    hasChronicIllness: data.hasChronic === "yes",
    chronicDetails: data.chronicText,
    takesMedication: data.hasMeds === "yes",
    medicationDetails: data.medsText,
    physicalActivity: ACTIVITY_LABEL[data.physicalActivity],
    physicalLimitations: data.physicalLimitations,
    dietRestrictions: DIET_LABEL[data.diet],
    dietDetails: data.dietOther,
    additionalInfo: data.notes,
    hearAboutUs: data.source,
    confirmInfoTrue: data.confirmTrue,
    confirmFirstAid: data.confirmFirst,
    confirmRules: data.confirmRules,
    confirmPayment: true, // legacy, not collected anymore
    largeFamily: data.largeFamily,
    healthInfo: "",
  };
}

export function useCampForm() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = useCallback(
    <K extends keyof FormData>(k: K, v: FormData[K]) => {
      setData((d) => ({ ...d, [k]: v }));
    },
    []
  );
  const touch = useCallback((k: keyof FormData) => {
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  }, []);

  const errors = useMemo(
    () => validate(data, touched, false),
    [data, touched]
  );
  const campStart = useMemo(() => startDateFor(data.camp), [data.camp]);
  const age = useMemo(
    () => calcAge(data.childBirth, campStart),
    [data.childBirth, campStart]
  );

  const stepId: StepId = STEPS[stepIdx].id;
  const stepValid = useMemo(() => {
    return STEP_REQUIRED[stepId].every((k) => {
      const v = data[k];
      if (typeof v === "boolean") return v;
      if (k === "parentEmail") return isEmail(v);
      if (k === "parentPhone") return isPhone(v);
      if (k === "childBirth") return isDate(v);
      return isFilled(v);
    });
  }, [data, stepId]);

  const goNext = useCallback(() => {
    setTouched((t) => {
      const next = { ...t };
      STEP_REQUIRED[STEPS[stepIdx].id].forEach((k) => {
        next[k] = true;
      });
      return next;
    });
    if (stepValid)
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }, [stepIdx, stepValid]);
  const goPrev = useCallback(
    () => setStepIdx((i) => Math.max(i - 1, 0)),
    []
  );
  const goTo = useCallback(
    (i: number) =>
      setStepIdx(Math.max(0, Math.min(i, STEPS.length - 1))),
    []
  );

  const submit = useCallback(async () => {
    const errs = validate(data, {}, true);
    if (Object.keys(errs).length > 0) {
      const all: Partial<Record<keyof FormData, boolean>> = {};
      (Object.keys(INITIAL_DATA) as (keyof FormData)[]).forEach((k) => {
        all[k] = true;
      });
      setTouched(all);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiPayload(data)),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Не удалось отправить заявку");
      }
      setSubmitted(true);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setSubmitError(e.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  const price = data.largeFamily ? 180 : 230;
  const selectedCamp = useMemo(
    () => CAMPS.find((c) => c.id === data.camp) || null,
    [data.camp]
  );

  return {
    data,
    set,
    touch,
    touched,
    errors,
    age,
    price,
    selectedCamp,
    stepIdx,
    stepId,
    stepValid,
    goNext,
    goPrev,
    goTo,
    submit,
    submitted,
    submitting,
    submitError,
  };
}
