import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childName, childDOB, childAge, parentName, parentPhone, parentEmail, city, healthInfo } = body;

    if (!childName || !childDOB || !childAge || !parentName || !parentPhone || !parentEmail || !city || !healthInfo) {
      return NextResponse.json({ error: "Все обязательные поля должны быть заполнены" }, { status: 400 });
    }

    const registration = await prisma.registration.create({
      data: {
        childName,
        childDOB,
        childAge: parseInt(childAge),
        parentName,
        parentPhone,
        parentEmail,
        city,
        healthInfo,
        status: "Новая",
      },
    });

    return NextResponse.json({ success: true, id: registration.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
