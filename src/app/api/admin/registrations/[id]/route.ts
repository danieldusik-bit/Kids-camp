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
  const { status, internalNotes, teamId } = body;

  // Load current state so we can detect a NEW transition to "Подтверждена"
  // and skip emailing when the status is just being re-saved unchanged.
  const existing = await prisma.registration.findUnique({
    where: { id: params.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;
  if (teamId !== undefined) data.teamId = teamId || null;

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
      await sendApprovalEmail({
        registration: {
          camp: registration.camp,
          parentEmail: registration.parentEmail,
          parentName: registration.parentName,
          parentPhone: registration.parentPhone,
          childName: registration.childName,
          childDOB: registration.childDOB,
          childPersonalId: registration.childPersonalId,
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
