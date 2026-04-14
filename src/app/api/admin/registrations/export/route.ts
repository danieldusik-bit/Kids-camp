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
    "Имя родителя",
    "Телефон",
    "Email",
    "Город",
    "Здоровье",
    "Дата подачи",
    "Статус",
    "Заметки",
  ];

  const rows = registrations.map((r) => [
    r.childName,
    r.childDOB,
    r.childAge,
    r.parentName,
    r.parentPhone,
    r.parentEmail,
    r.city,
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

  const csv = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=registrations.csv",
    },
  });
}
