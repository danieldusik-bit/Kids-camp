import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const required = [
      "parentName",
      "parentPhone",
      "parentEmail",
      "childName",
      "childDOB",
      "childAge",
      "city",
      "billingName",
      "billingId",
      "billingAddress",
      "billingEmail",
    ];
    for (const key of required) {
      if (!body[key] && body[key] !== 0) {
        return NextResponse.json(
          { error: `Поле "${key}" обязательно` },
          { status: 400 }
        );
      }
    }

    if (!body.confirmInfoTrue || !body.confirmFirstAid || !body.confirmRules || !body.confirmPayment) {
      return NextResponse.json(
        { error: "Необходимо подтвердить все обязательные пункты" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        // Parent / Guardian
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        parentEmail: body.parentEmail,
        emergencyContactName: body.emergencyContactName || "",
        emergencyContactPhone: body.emergencyContactPhone || "",

        // Child
        childName: body.childName,
        childDOB: body.childDOB,
        childAge: parseInt(body.childAge),
        childPersonalId: body.childPersonalId || "",
        childLanguage: body.childLanguage || "Русский",

        // Location
        city: body.city,

        // Billing
        billingName: body.billingName,
        billingId: body.billingId,
        billingAddress: body.billingAddress,
        billingEmail: body.billingEmail,

        // Pickup
        pickupAuthorized: body.pickupAuthorized || "",
        childCanLeaveAlone: !!body.childCanLeaveAlone,

        // Health
        hasAllergies: !!body.hasAllergies,
        allergiesDetails: body.allergiesDetails || "",
        hasChronicIllness: !!body.hasChronicIllness,
        chronicDetails: body.chronicDetails || "",
        takesMedication: !!body.takesMedication,
        medicationDetails: body.medicationDetails || "",
        physicalActivity: body.physicalActivity || "Разрешено",
        physicalLimitations: body.physicalLimitations || "",

        // Diet
        dietRestrictions: body.dietRestrictions || "нет",
        dietDetails: body.dietDetails || "",

        // Additional
        additionalInfo: body.additionalInfo || "",
        hearAboutUs: body.hearAboutUs || "",

        // Confirmations
        confirmInfoTrue: !!body.confirmInfoTrue,
        confirmFirstAid: !!body.confirmFirstAid,
        confirmRules: !!body.confirmRules,
        confirmPayment: !!body.confirmPayment,

        // Legacy
        healthInfo: body.healthInfo || "",
        status: "Новая",
      },
    });

    return NextResponse.json({ success: true, id: registration.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
