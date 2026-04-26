export const STEPS = [
  { id: "parent", label: "Родитель", short: "01" },
  { id: "child", label: "Ребёнок", short: "02" },
  { id: "health", label: "Здоровье", short: "03" },
  { id: "billing", label: "Реквизиты", short: "04" },
  { id: "confirm", label: "Подтверждение", short: "05" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const CAMP = {
  name: "Код Приключений",
  edition: "Смена 2026",
  dates: "28 июня — 4 июля 2026",
  location: "Norkalni, Latvija",
  basePrice: 230,
  familyPrice: 180,
  campStart: "2026-06-28",
};

export type FormData = {
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyName: string;
  emergencyPhone: string;
  childName: string;
  childBirth: string;
  childCode: string;
  childCity: string;
  childLanguage: string;
  pickupPersons: string;
  selfDismissal: boolean;
  hasAllergies: "yes" | "no";
  allergiesText: string;
  hasChronic: "yes" | "no";
  chronicText: string;
  hasMeds: "yes" | "no";
  medsText: string;
  physicalActivity: "allowed" | "limited";
  diet: "none" | "veg" | "vegan" | "other";
  dietOther: string;
  notes: string;
  source: string;
  largeFamily: boolean;
  billName: string;
  billCode: string;
  billAddr: string;
  billEmail: string;
  confirmTrue: boolean;
  confirmFirst: boolean;
  confirmRules: boolean;
  confirmPaid: boolean;
};

export const INITIAL_DATA: FormData = {
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  emergencyName: "",
  emergencyPhone: "",
  childName: "",
  childBirth: "",
  childCode: "",
  childCity: "",
  childLanguage: "Русский",
  pickupPersons: "",
  selfDismissal: false,
  hasAllergies: "no",
  allergiesText: "",
  hasChronic: "no",
  chronicText: "",
  hasMeds: "no",
  medsText: "",
  physicalActivity: "allowed",
  diet: "none",
  dietOther: "",
  notes: "",
  source: "",
  largeFamily: false,
  billName: "",
  billCode: "",
  billAddr: "",
  billEmail: "",
  confirmTrue: false,
  confirmFirst: false,
  confirmRules: false,
  confirmPaid: false,
};
