import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApprovalEmail } from "@/lib/email/send-confirmation";

// nodemailer needs Node — not Edge-friendly.
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  const userId = (session.user as any)?.id as string | undefined;

  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
  });

  if (!registration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mentors can only see registrations assigned to teams they lead.
  if (role === "MENTOR") {
    if (!registration.teamId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const team = await prisma.team.findUnique({
      where: { id: registration.teamId },
      select: { leaderId: true },
    });
    if (!team || team.leaderId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(registration);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "SUPERADMIN" && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Load current state so we can detect a NEW transition to "Подтверждена"
  // and skip emailing when the status is just being re-saved unchanged.
  const existing = await prisma.registration.findUnique({
    where: { id: params.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Whitelist of admin-editable fields. Any other field on the request body
  // is silently ignored.
  const ADMIN_EDITABLE = [
    "status",
    "internalNotes",
    "camp",
    "groupWith",
    "childName",
    "childDOB",
    "childAge",
    "childPersonalId",
    "childGender",
    "childLanguage",
    "city",
    "declaredAddress",
    "actualAddress",
    "parentName",
    "parentPhone",
    "parentEmail",
    "emergencyContactName",
    "emergencyContactPhone",
    "pickup1Name",
    "pickup1Phone",
    "pickup1Relation",
    "pickup2Name",
    "pickup2Phone",
    "pickup2Relation",
    "hasAllergies",
    "allergiesDetails",
    "hasChronicIllness",
    "chronicDetails",
    "takesMedication",
    "medicationDetails",
    "hasSpecialTraits",
    "specialTraitsDetails",
    "hasEncephalitisVaccine",
    "participatedOtherCamps",
    "swimmingAbility",
    "physicalActivity",
    "physicalLimitations",
    "dietRestrictions",
    "dietDetails",
    "additionalInfo",
    "hearAboutUs",
    "paymentMethod",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const k of ADMIN_EDITABLE) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  // teamId is separate — null vs undefined matters (null = unassign)
  if (body.teamId !== undefined) data.teamId = body.teamId || null;

  // childAge is an Int — coerce if it came in as a string from a form input
  if (typeof data.childAge === "string") {
    const n = parseInt(data.childAge, 10);
    data.childAge = Number.isFinite(n) ? n : 0;
  }

  const status = body.status as string | undefined;

  const registration = await prisma.registration.update({
    where: { id: params.id },
    data,
  });

  // Fire approval email when the status flips TO "Подтверждена". Failure is
  // swallowed so an SMTP hiccup never undoes the admin's status change.
  if (
    status === "Подтверждена" &&
    existing.status !== "Подтверждена" &&
    registration.parentEmail
  ) {
    try {
      // Pass the full row so PDF generation can pre-fill all child/parent
      // fields (declared address, pickup contacts, health answers, etc.).
      await sendApprovalEmail({
        registration: {
          camp: registration.camp,
          parentEmail: registration.parentEmail,
          parentName: registration.parentName,
          parentPhone: registration.parentPhone,
          childName: registration.childName,
          childDOB: registration.childDOB,
          childPersonalId: registration.childPersonalId,
          childGender: registration.childGender,
          declaredAddress: registration.declaredAddress,
          actualAddress: registration.actualAddress,
          pickup1Name: registration.pickup1Name,
          pickup1Phone: registration.pickup1Phone,
          pickup1Relation: registration.pickup1Relation,
          pickup2Name: registration.pickup2Name,
          pickup2Phone: registration.pickup2Phone,
          pickup2Relation: registration.pickup2Relation,
          hasAllergies: registration.hasAllergies,
          allergiesDetails: registration.allergiesDetails,
          hasChronicIllness: registration.hasChronicIllness,
          chronicDetails: registration.chronicDetails,
          takesMedication: registration.takesMedication,
          medicationDetails: registration.medicationDetails,
          hasSpecialTraits: registration.hasSpecialTraits,
          specialTraitsDetails: registration.specialTraitsDetails,
          hasEncephalitisVaccine: registration.hasEncephalitisVaccine,
          participatedOtherCamps: registration.participatedOtherCamps,
          swimmingAbility: registration.swimmingAbility,
          additionalInfo: registration.additionalInfo,
          paymentMethod: registration.paymentMethod || "",
        },
      });
    } catch (err) {
      console.error(
        "[admin patch] approval email failed (status update kept):",
        err
      );
    }
  }

  return NextResponse.json(registration);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.registration.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
