export const STEPS = [
  { id: "camp", label: "Лагерь", short: "01" },
  { id: "parent", label: "Родитель", short: "02" },
  { id: "child", label: "Ребёнок", short: "03" },
  { id: "health", label: "Здоровье", short: "04" },
  { id: "payment", label: "Оплата", short: "05" },
  { id: "confirm", label: "Подтверждение", short: "06" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export type CampId = "kids" | "teens";

export const CAMPS: {
  id: CampId;
  label: string;
  ageRange: string;
  dates: string;
  startDate: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "kids",
    label: "Детский лагерь",
    ageRange: "7 — 12 лет",
    dates: "28 июня — 4 июля 2026",
    startDate: "2026-06-28",
    emoji: "🏕️",
    description: "Семь дней (5 полных дней) приключений в Norkalni для детей.",
  },
  {
    id: "teens",
    label: "Подростковый лагерь",
    ageRange: "13 — 17 лет",
    dates: "26 июля — 1 августа 2026",
    startDate: "2026-07-26",
    emoji: "🔥",
    description:
      "Семь дней (5 полных дней) насыщенной программы для подростков.",
  },
];

export const CAMP = {
  name: "Код Приключений",
  edition: "Смены 2026",
  location: "Norkalni, Latvija",
  basePrice: 230,
  familyPrice: 180,
};

export type FormData = {
  camp: CampId | "";
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
  groupWith: string;
  pickupPersons: string;
  selfDismissal: boolean;
  hasAllergies: "yes" | "no";
  allergiesText: string;
  hasChronic: "yes" | "no";
  chronicText: string;
  hasMeds: "yes" | "no";
  medsText: string;
  physicalActivity: "allowed" | "limited";
  physicalLimitations: string;
  diet: "none" | "veg" | "vegan" | "other";
  dietOther: string;
  notes: string;
  source: string;
  largeFamily: boolean;
  confirmTrue: boolean;
  confirmFirst: boolean;
  confirmRules: boolean;
};

export const INITIAL_DATA: FormData = {
  camp: "",
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
  groupWith: "",
  pickupPersons: "",
  selfDismissal: false,
  hasAllergies: "no",
  allergiesText: "",
  hasChronic: "no",
  chronicText: "",
  hasMeds: "no",
  medsText: "",
  physicalActivity: "allowed",
  physicalLimitations: "",
  diet: "none",
  dietOther: "",
  notes: "",
  source: "",
  largeFamily: false,
  confirmTrue: false,
  confirmFirst: false,
  confirmRules: false,
};

export const CAMP_RULES = [
  "Слушаться вожатых, медсестру и руководителя лагеря — это вопрос безопасности.",
  "Не покидать территорию лагеря без разрешения.",
  "Уважительно относиться к другим участникам, вожатым и сотрудникам.",
  "Соблюдать распорядок дня (подъём, занятия, приёмы пищи, отбой).",
  "Беречь имущество лагеря и окружающую природу.",
  "Запрещены алкоголь, табачные изделия, вейпы и любые наркотические вещества.",
  "В случае болезни или плохого самочувствия сразу обратиться к вожатому или медсестре.",
  "При многократном нарушении правил родители обязаны забрать ребёнка из лагеря.",
];
