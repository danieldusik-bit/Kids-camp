"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  isPersonalCode,
  isPhone,
  isSwimmingAnswer,
  isYesNo,
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
const GENDER_LABEL: Record<FormData["childGender"], string> = {
  "": "",
  boy: "Мальчик",
  girl: "Девочка",
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

function scrollToFormTop() {
  if (typeof window === "undefined") return;
  // Defer to next frame so the new step has rendered before we measure.
  requestAnimationFrame(() => {
    const el = document.getElementById("wizard-form");
    if (!el) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const rect = el.getBoundingClientRect();
    const target = Math.max(0, window.scrollY + rect.top - 16);
    window.scrollTo({ top: target, behavior: "smooth" });
  });
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
    childGender: GENDER_LABEL[data.childGender] || "",
    childDOB: data.childBirth,
    childAge: age,
    childPersonalId: data.childPersonalCode,
    childLanguage: LANGUAGE_LABEL[data.childLanguage] || data.childLanguage,
    city: data.childCity,
    declaredAddress: data.declaredAddress,
    actualAddress: data.actualSameAsDeclared
      ? data.declaredAddress
      : data.actualAddress,
    // Structured pickup contacts (new form)
    pickup1Name: data.pickup1Name,
    pickup1Phone: data.pickup1Phone,
    pickup1Relation: data.pickup1Relation,
    pickup2Name: data.pickup2Name,
    pickup2Phone: data.pickup2Phone,
    pickup2Relation: data.pickup2Relation,
    // Legacy fields - kept empty for backwards compatibility.
    pickupAuthorized: "",
    childCanLeaveAlone: false,
    hasAllergies: data.hasAllergies === "yes",
    allergiesDetails: data.allergiesText,
    hasChronicIllness: data.hasChronic === "yes",
    chronicDetails: data.chronicText,
    takesMedication: data.hasMeds === "yes",
    medicationDetails: data.medsText,
    hasSpecialTraits: data.hasSpecialTraits === "yes",
    specialTraitsDetails: data.specialTraitsText,
    hasEncephalitisVaccine: data.encephalitisVaccine,
    participatedOtherCamps: data.participatedOtherCamps,
    swimmingAbility: data.swimmingAbility,
    physicalActivity: ACTIVITY_LABEL[data.physicalActivity],
    physicalLimitations: data.physicalLimitations,
    dietRestrictions: DIET_LABEL[data.diet],
    dietDetails: data.dietOther,
    additionalInfo: data.notes,
    hearAboutUs: data.source,
    confirmInfoTrue: data.confirmTrue,
    confirmFirstAid: data.confirmFirst,
    confirmRules: data.confirmRules,
    confirmPayment: true,
    paymentMethod: data.paymentMethod,
    largeFamily: data.largeFamily,
    healthInfo: "",
  };
}

/**
 * localStorage key for the wizard draft.
 *
 * Bump the version suffix whenever FormData gets a breaking change so old
 * saved drafts get ignored cleanly instead of causing weird half-filled
 * forms after a deploy.
 */
const STORAGE_KEY = "kids-camp-portal:form:v1";

export function useCampForm() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Hydration gate so the persistence effect doesn't overwrite the saved
  // draft with INITIAL_DATA before we get a chance to load it.
  const hydratedRef = useRef(false);

  /** Restore draft from localStorage on first mount (browser only). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          data?: Partial<FormData>;
          stepIdx?: number;
        };
        if (parsed.data && typeof parsed.data === "object") {
          setData((d) => ({ ...d, ...parsed.data }));
        }
        if (
          typeof parsed.stepIdx === "number" &&
          parsed.stepIdx >= 0 &&
          parsed.stepIdx < STEPS.length
        ) {
          setStepIdx(parsed.stepIdx);
        }
      }
    } catch {
      // Corrupt or quota-exceeded — ignore and start fresh.
    }
    hydratedRef.current = true;
  }, []);

  /** Persist draft on every change (after the first hydration). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data, stepIdx })
      );
    } catch {
      // Storage might be disabled (private mode, full disk) — non-fatal.
    }
  }, [data, stepIdx]);

  const clearStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

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
      if (k === "parentPhone" || k === "pickup1Phone" || k === "pickup2Phone")
        return isPhone(v);
      if (k === "childBirth") return isDate(v);
      if (k === "childPersonalCode") return isPersonalCode(v);
      if (k === "encephalitisVaccine" || k === "participatedOtherCamps")
        return isYesNo(v);
      if (k === "swimmingAbility") return isSwimmingAnswer(v);
      if (k === "declaredAddress") return isFilled(v);
      if (k === "paymentMethod") return v === "cash" || v === "stripe";
      return isFilled(v);
    });
  }, [data, stepId]);

  // Boys can't register for the kids camp — spots are full. This combination
  // hard-blocks navigation past the child step and submission.
  const boysKidsBlocked = data.camp === "kids" && data.childGender === "boy";

  // The actual address is conditionally required: only when the
  // "same as declared" toggle is off, the actualAddress must be filled.
  const stepValidWithCond = useMemo(() => {
    // Hard stop: a boy on the kids camp can't leave the child step.
    if (boysKidsBlocked && stepId === "child") return false;
    if (!stepValid) return false;
    if (stepId === "child" && !data.actualSameAsDeclared) {
      return isFilled(data.actualAddress);
    }
    return true;
  }, [
    stepValid,
    stepId,
    data.actualSameAsDeclared,
    data.actualAddress,
    boysKidsBlocked,
  ]);

  const goNext = useCallback(() => {
    setTouched((t) => {
      const next = { ...t };
      STEP_REQUIRED[STEPS[stepIdx].id].forEach((k) => {
        next[k] = true;
      });
      // Conditionally require actualAddress when the toggle is off.
      if (
        STEPS[stepIdx].id === "child" &&
        !data.actualSameAsDeclared
      ) {
        next.actualAddress = true;
      }
      return next;
    });
    if (stepValidWithCond) {
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
      scrollToFormTop();
    }
  }, [stepIdx, stepValidWithCond, data.actualSameAsDeclared]);
  const goPrev = useCallback(() => {
    setStepIdx((i) => Math.max(i - 1, 0));
    scrollToFormTop();
  }, []);
  const goTo = useCallback((i: number) => {
    setStepIdx(Math.max(0, Math.min(i, STEPS.length - 1)));
    scrollToFormTop();
  }, []);

  const submit = useCallback(async () => {
    // Hard stop: boys can't register for the kids camp (spots full). Bounce
    // back to the child step where the explanatory notice lives.
    if (data.camp === "kids" && data.childGender === "boy") {
      setStepIdx(STEPS.findIndex((s) => s.id === "child"));
      scrollToFormTop();
      return;
    }
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
      // Submission succeeded — wipe the persisted draft so a refresh on
      // the success screen doesn't restore the just-submitted form.
      clearStorage();
      setSubmitted(true);
      scrollToFormTop();
    } catch (e: any) {
      setSubmitError(e.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }, [data, clearStorage]);

  /** Full reset — start a fresh new application from scratch. */
  const resetAll = useCallback(() => {
    clearStorage();
    setData(INITIAL_DATA);
    setTouched({});
    setStepIdx(0);
    setSubmitted(false);
    setSubmitError("");
    scrollToFormTop();
  }, [clearStorage]);

  /**
   * Add another child — keep family-level data (parent + emergency contacts,
   * pickup contacts, addresses, camp choice, payment method, large-family
   * toggle); reset only the per-child fields (name, DOB, personas kods,
   * health answers, confirmations).
   * Jumps the wizard back to the parent step so the child name field is at
   * the top.
   */
  const addAnotherChild = useCallback(() => {
    setData((d) => ({
      ...INITIAL_DATA,
      camp: d.camp,
      parentName: d.parentName,
      parentPhone: d.parentPhone,
      parentEmail: d.parentEmail,
      emergencyName: d.emergencyName,
      emergencyPhone: d.emergencyPhone,
      // Addresses are family-level
      declaredAddress: d.declaredAddress,
      actualAddress: d.actualAddress,
      actualSameAsDeclared: d.actualSameAsDeclared,
      childCity: d.childCity,
      // Pickup contacts are family-level
      pickup1Name: d.pickup1Name,
      pickup1Phone: d.pickup1Phone,
      pickup1Relation: d.pickup1Relation,
      pickup2Name: d.pickup2Name,
      pickup2Phone: d.pickup2Phone,
      pickup2Relation: d.pickup2Relation,
      // Payment method usually applies to the whole family
      paymentMethod: d.paymentMethod,
      largeFamily: d.largeFamily,
    }));
    setTouched({});
    setStepIdx(1); // step "parent" — kid name lives there
    setSubmitted(false);
    setSubmitError("");
    scrollToFormTop();
  }, []);

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
    stepValid: stepValidWithCond,
    boysKidsBlocked,
    goNext,
    goPrev,
    goTo,
    submit,
    submitted,
    submitting,
    submitError,
    resetAll,
    addAnotherChild,
  };
}
