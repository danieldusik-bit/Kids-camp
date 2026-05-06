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

export type CampSection = {
  title: string;
  items: string[];
};

export type CampInfo = {
  id: CampId;
  label: string;
  ageRange: string;
  dates: string;
  startDate: string;
  emoji: string;
  /** Headline used at the top of the description panel (selected camp). */
  tagline: string;
  /** Short paragraph below the tagline. */
  intro: string;
  /** Section blocks, rendered as titled bullet lists. */
  sections: CampSection[];
};

export const CAMPS: CampInfo[] = [
  {
    id: "kids",
    label: "Детский лагерь",
    ageRange: "6 — 12 лет",
    dates: "28 июня — 4 июля 2026",
    startDate: "2026-06-28",
    emoji: "🏕️",
    tagline:
      "Детский христианский лагерь для детей от 6 до 12 лет.",
    intro:
      "Это место, где дети могут отдыхать, играть и просто хорошо проводить время. Здесь они знакомятся, находят друзей, учатся дружить и поддерживать друг друга и открывать для себя Божью любовь в простой и понятной форме.",
    sections: [
      {
        title: "Проживание",
        items: ["Уютные домики", "До 10 спальных мест в каждом"],
      },
      {
        title: "Забота и сопровождение",
        items: [
          "В каждой группе: наставник и помощник",
          "Индивидуальное внимание каждому ребёнку",
          "Поддержка, участие и безопасная среда",
        ],
      },
      {
        title: "Безопасность и здоровье",
        items: [
          "Медсестра 24/7 на территории лагеря",
          "Контроль самочувствия детей при въезде",
          "Быстрая помощь при необходимости",
        ],
      },
      {
        title: "Питание",
        items: ["Полноценное 5-разовое питание"],
      },
      {
        title: "Локация",
        items: [
          "Лагерь расположен рядом с озером",
          "Свежий воздух и природа",
          "Отдых у воды и возможность купания",
        ],
      },
      {
        title: "Активности и досуг",
        items: [
          "Велосипеды для активных прогулок",
          "Библейские уроки",
          "Настольные игры",
          "Творческие и командные занятия",
        ],
      },
      {
        title: "Спорт и движение",
        items: ["Ежедневные активные игры", "Спортивные мероприятия"],
      },
    ],
  },
  {
    id: "teens",
    label: "Подростковый лагерь",
    ageRange: "13 — 18 лет",
    dates: "26 июля — 1 августа 2026",
    startDate: "2026-07-26",
    emoji: "🔥",
    tagline:
      "Христианский лагерь для подростков от 13 до 18 лет.",
    intro:
      "Здесь подростки находят новых друзей, участвуют в интересных активностях и говорят о важных вещах — о жизни, выборе, отношениях и вере.",
    sections: [
      {
        title: "🏡 Проживание",
        items: [
          "Размещение в уютных домиках",
          "Рядом лес и свежий воздух",
          "Спокойная и природная атмосфера для отдыха",
        ],
      },
      {
        title: "👥 Сопровождение",
        items: [
          "В каждой группе закреплён лидер",
          "Поддержка, наставничество и внимание к каждому участнику",
          "Формирование доверительных отношений внутри группы",
        ],
      },
      {
        title: "🍽 Питание",
        items: [
          "5-разовое сбалансированное питание",
          "Разнообразное меню с учётом потребностей подростков",
        ],
      },
      {
        title: "🏥 Безопасность",
        items: [
          "Медицинское сопровождение на территории лагеря 24/7",
          "Контроль самочувствия участников",
        ],
      },
      {
        title: "🗣 Дискуссии",
        items: [
          "Организованные обсуждения актуальных тем",
          "Осмысление вопросов веры, ценностей, выбора и отношений",
          "Возможность открыто высказываться и быть услышанным",
        ],
      },
      {
        title: "☕ Кафешка",
        items: [
          "Пространство для неформального общения",
          "Вкусные напитки и угощения включены в стоимость путёвки",
        ],
      },
      {
        title: "⚽ Активности",
        items: [
          "Спортивные и командные мероприятия",
          "Игры и интерактивные форматы",
          "Активный отдых на свежем воздухе",
          "Вечер талантов",
          "Костёр",
        ],
      },
    ],
  },
];

export const CAMP = {
  name: "Летние лагеря ц. Храм Спасения",
  edition: "Сезон 2026",
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
  childGender: "" | "boy" | "girl";
  childBirth: string;
  childPersonalCode: string;
  childCity: string;
  declaredAddress: string;
  actualAddress: string;
  actualSameAsDeclared: boolean;
  childLanguage: string;
  groupWith: string;
  pickup1Name: string;
  pickup1Phone: string;
  pickup1Relation: string;
  pickup2Name: string;
  pickup2Phone: string;
  pickup2Relation: string;
  hasAllergies: "yes" | "no";
  allergiesText: string;
  hasChronic: "yes" | "no";
  chronicText: string;
  hasMeds: "yes" | "no";
  medsText: string;
  hasSpecialTraits: "yes" | "no";
  specialTraitsText: string;
  encephalitisVaccine: "" | "yes" | "no";
  participatedOtherCamps: "" | "yes" | "no";
  swimmingAbility: "" | "yes" | "no" | "weak";
  physicalActivity: "allowed" | "limited";
  physicalLimitations: string;
  diet: "none" | "veg" | "vegan" | "other";
  dietOther: string;
  notes: string;
  source: string;
  largeFamily: boolean;
  paymentMethod: "" | "cash" | "stripe";
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
  childGender: "",
  childBirth: "",
  childPersonalCode: "",
  childCity: "",
  declaredAddress: "",
  actualAddress: "",
  actualSameAsDeclared: true,
  childLanguage: "Русский",
  groupWith: "",
  pickup1Name: "",
  pickup1Phone: "",
  pickup1Relation: "",
  pickup2Name: "",
  pickup2Phone: "",
  pickup2Relation: "",
  hasAllergies: "no",
  allergiesText: "",
  hasChronic: "no",
  chronicText: "",
  hasMeds: "no",
  medsText: "",
  hasSpecialTraits: "no",
  specialTraitsText: "",
  encephalitisVaccine: "",
  participatedOtherCamps: "",
  swimmingAbility: "",
  physicalActivity: "allowed",
  physicalLimitations: "",
  diet: "none",
  dietOther: "",
  notes: "",
  source: "",
  largeFamily: false,
  paymentMethod: "",
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
