import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email/send-confirmation";

// Node runtime — pdf-lib + nodemailer need fs / Buffer (not Edge-friendly).
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const required = [
      "camp",
      "parentName",
      "parentPhone",
      "parentEmail",
      "childName",
      "childDOB",
      "childAge",
      "city",
    ];
    for (const key of required) {
      if (!body[key] && body[key] !== 0) {
        return NextResponse.json(
          { error: `Поле "${key}" обязательно` },
          { status: 400 }
        );
      }
    }

    if (!body.confirmInfoTrue || !body.confirmFirstAid || !body.confirmRules) {
      return NextResponse.json(
        { error: "Необходимо подтвердить все обязательные пункты" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        // Camp & group
        camp: body.camp,
        groupWith: body.groupWith || "",

        // Parent / Guardian
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        parentEmail: body.parentEmail,
        parentPersonalId: body.parentPersonalId || "",
        emergencyContactName: body.emergencyContactName || "",
        emergencyContactPhone: body.emergencyContactPhone || "",

        // Child
        childName: body.childName,
        childDOB: body.childDOB,
        childAge: parseInt(body.childAge),
        childPersonalId: body.childPersonalId || "",
        childLanguage: body.childLanguage || "Русский",
        childGender: body.childGender || "",

        // Location
        city: body.city,
        declaredAddress: body.declaredAddress || "",
        actualAddress: body.actualAddress || "",

        // Billing (now optional / unused but kept for backward compatibility)
        billingName: body.billingName || "",
        billingId: body.billingId || "",
        billingAddress: body.billingAddress || "",
        billingEmail: body.billingEmail || "",

        // Pickup — legacy free-text (kept for backward compatibility)
        pickupAuthorized: body.pickupAuthorized || "",
        childCanLeaveAlone: !!body.childCanLeaveAlone,

        // Pickup — structured contacts (new form)
        pickup1Name: body.pickup1Name || "",
        pickup1Phone: body.pickup1Phone || "",
        pickup1Relation: body.pickup1Relation || "",
        pickup2Name: body.pickup2Name || "",
        pickup2Phone: body.pickup2Phone || "",
        pickup2Relation: body.pickup2Relation || "",

        // Health
        hasAllergies: !!body.hasAllergies,
        allergiesDetails: body.allergiesDetails || "",
        hasChronicIllness: !!body.hasChronicIllness,
        chronicDetails: body.chronicDetails || "",
        takesMedication: !!body.takesMedication,
        medicationDetails: body.medicationDetails || "",
        hasSpecialTraits: !!body.hasSpecialTraits,
        specialTraitsDetails: body.specialTraitsDetails || "",
        hasEncephalitisVaccine: body.hasEncephalitisVaccine || "",
        participatedOtherCamps: body.participatedOtherCamps || "",
        swimmingAbility: body.swimmingAbility || "",
        physicalActivity: body.physicalActivity || "Разрешено",
        physicalLimitations: body.physicalLimitations || "",

        // Diet
        dietRestrictions: body.dietRestrictions || "нет",
        dietDetails: body.dietDetails || "",

        // Additional
        additionalInfo: body.additionalInfo || "",
        hearAboutUs: body.hearAboutUs || "",

        // Confirmations (confirmPayment retained for backward compatibility)
        confirmInfoTrue: !!body.confirmInfoTrue,
        confirmFirstAid: !!body.confirmFirstAid,
        confirmRules: !!body.confirmRules,
        confirmPayment: !!body.confirmPayment,

        // Payment intent
        paymentMethod: body.paymentMethod || "",

        // Legacy
        healthInfo: body.healthInfo || "",
        status: "Новая",
      },
    });

    // Fire off the confirmation email (with 3 PDF attachments). We await it
    // so the user only sees the success screen after the email is actually
    // accepted by Gmail — but we swallow errors so an SMTP hiccup never
    // breaks the registration itself.
    try {
      await sendConfirmationEmail({
        registration: {
          camp: body.camp,
          childName: body.childName,
          childDOB: body.childDOB,
          childPersonalId: body.childPersonalId || "",
          childGender: body.childGender,
          parentName: body.parentName,
          parentPhone: body.parentPhone,
          parentEmail: body.parentEmail,
          declaredAddress: body.declaredAddress || "",
          actualAddress: body.actualAddress || "",
          pickup1Name: body.pickup1Name,
          pickup1Phone: body.pickup1Phone,
          pickup1Relation: body.pickup1Relation,
          pickup2Name: body.pickup2Name,
          pickup2Phone: body.pickup2Phone,
          pickup2Relation: body.pickup2Relation,
          hasAllergies: !!body.hasAllergies,
          allergiesDetails: body.allergiesDetails,
          hasChronicIllness: !!body.hasChronicIllness,
          chronicDetails: body.chronicDetails,
          takesMedication: !!body.takesMedication,
          medicationDetails: body.medicationDetails,
          hasSpecialTraits: !!body.hasSpecialTraits,
          specialTraitsDetails: body.specialTraitsDetails,
          hasEncephalitisVaccine: body.hasEncephalitisVaccine,
          participatedOtherCamps: body.participatedOtherCamps,
          swimmingAbility: body.swimmingAbility,
          additionalInfo: body.additionalInfo,
        },
      });
    } catch (emailErr) {
      console.error(
        "[register] Confirmation email failed, registration kept:",
        emailErr
      );
    }

    return NextResponse.json({ success: true, id: registration.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
