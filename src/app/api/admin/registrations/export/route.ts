import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Имя ребёнка",
    "Дата рождения",
    "Возраст",
    "Персональный код",
    "Язык",
    "Имя родителя",
    "Телефон",
    "Email",
    "Экстренный контакт",
    "Тел. экстренного",
    "Город",
    "Имя для счёта",
    "Рег. номер",
    "Адрес",
    "Email для счёта",
    "Кто забирает",
    "Уходит сам",
    "Аллергии",
    "Описание аллергий",
    "Хронические",
    "Описание",
    "Медикаменты",
    "Описание медикаментов",
    "Физ. активность",
    "Ограничения",
    "Питание",
    "Питание (детали)",
    "Дополнительно",
    "Откуда узнали",
    "Здоровье (общ.)",
    "Дата подачи",
    "Статус",
    "Заметки",
  ];

  const rows = registrations.map((r: any) => [
    r.childName,
    r.childDOB,
    r.childAge,
    r.childPersonalId,
    r.childLanguage,
    r.parentName,
    r.parentPhone,
    r.parentEmail,
    r.emergencyContactName,
    r.emergencyContactPhone,
    r.city,
    r.billingName,
    r.billingId,
    r.billingAddress,
    r.billingEmail,
    r.pickupAuthorized,
    r.childCanLeaveAlone ? "Да" : "Нет",
    r.hasAllergies ? "Да" : "Нет",
    r.allergiesDetails,
    r.hasChronicIllness ? "Да" : "Нет",
    r.chronicDetails,
    r.takesMedication ? "Да" : "Нет",
    r.medicationDetails,
    r.physicalActivity,
    r.physicalLimitations,
    r.dietRestrictions,
    r.dietDetails,
    r.additionalInfo,
    r.hearAboutUs,
    r.healthInfo,
    new Date(r.createdAt).toLocaleString("ru-RU"),
    r.status,
    r.internalNotes,
  ]);

  const escape = (val: any) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = "\uFEFF" + [headers.join(","), ...rows.map((row: any[]) => row.map(escape).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=registrations.csv",
    },
  });
}
