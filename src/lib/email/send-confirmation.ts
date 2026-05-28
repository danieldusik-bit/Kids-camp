/**
 * Sends the post-registration confirmation email to the parent.
 *
 * Transport: Gmail SMTP. Set up by Kristiana:
 *   GMAIL_USER         = Kristiana.vjatere@gmail.com
 *   GMAIL_APP_PASSWORD = 16-char App Password (https://myaccount.google.com/apppasswords)
 *
 * Email body: short Russian HTML summary of the application.
 * Attachments: Info Sheet (static) + filled Contract + filled Annexes.
 *
 * Designed to fail soft — if SMTP isn't configured or any step errors, the
 * caller should log and continue rather than failing the user's submission.
 */
import nodemailer from "nodemailer";
import {
  fillAnnexesPdf,
  fillContractPdf,
  getInfoSheetPdf,
  type RegistrationForPdf,
} from "@/lib/pdf/fill-documents";

const FROM_NAME = "Kristiāna Vjatere · Bērnu nometne 2026";

type SendArgs = {
  registration: RegistrationForPdf & {
    parentEmail: string;
    camp: string;
    paymentMethod?: string;
  };
};

const CAMP_LABEL: Record<string, string> = {
  kids: "Детский лагерь (28 июня – 4 июля 2026)",
  teens: "Подростковый лагерь (26 июля – 1 августа 2026)",
};

const CAMP_MEETING: Record<string, string> = {
  kids: "28 июня, 12:00–13:00, Lāčplēša iela 117, Rīga",
  teens: "26 июля, 12:00–13:00, Lāčplēša iela 117, Rīga",
};

export async function sendConfirmationEmail({ registration }: SendArgs) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[confirmation-email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping send."
    );
    return { skipped: true };
  }
  if (!registration.parentEmail) {
    console.warn(
      "[confirmation-email] registration has no parentEmail — skipping send."
    );
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS via STARTTLS
    auth: { user, pass: pass.replace(/\s+/g, "") }, // strip spaces from app pwd
  });

  const childName = registration.childName || "ребёнок";
  const campLabel = CAMP_LABEL[registration.camp] || registration.camp;

  // Submit email — short acknowledgement only. Documents go out separately
  // once an admin approves the registration.
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;color:#2c2a26;line-height:1.55;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f1d18;">Заявка получена</h2>
      <p style="margin:0 0 16px;">
        Здравствуйте! Спасибо, что зарегистрировали
        <strong>${escapeHtml(childName)}</strong> в лагерь. Мы получили вашу
        заявку, она находится в обработке.
      </p>
      <div style="background:#f6efe0;border:1px solid #e3ddcd;border-radius:10px;padding:14px 16px;margin:0 0 18px;">
        <div style="font-size:13px;color:#8b867a;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Смена</div>
        <div style="font-size:15px;margin-top:4px;">${escapeHtml(campLabel)}</div>
      </div>
      <p style="margin:0 0 12px;">
        После подтверждения мы пришлём вам отдельным письмом
        <strong>3 документа</strong> — договор и приложения для подписи.
        Пожалуйста, дождитесь этого письма перед тем как что-либо подписывать.
      </p>
      <p style="margin:0 0 12px;">
        Если возникнут вопросы — звоните координатору лагеря
        <strong>Эсфирь · +371 27626010</strong> или ответьте на это письмо.
      </p>
      <p style="margin:18px 0 0;font-size:13px;color:#8b867a;">
        С теплом,<br/>команда лагерей 2026
      </p>
    </div>
  `;

  const text =
    `Здравствуйте!\n\n` +
    `Спасибо, что зарегистрировали ${childName} в лагерь. Мы получили вашу заявку, она находится в обработке.\n` +
    `Смена: ${campLabel}\n\n` +
    `После подтверждения мы пришлём вам отдельным письмом 3 документа (договор и приложения) для подписи. Пожалуйста, дождитесь этого письма перед тем как что-либо подписывать.\n\n` +
    `Координатор: Эсфирь · +371 27626010.\n`;

  const info = await transporter.sendMail({
    from: { name: FROM_NAME, address: user },
    to: registration.parentEmail,
    replyTo: user,
    subject: `Заявка в лагерь получена — ${childName}`,
    text,
    html,
  });

  return { skipped: false, messageId: info.messageId };
}

/**
 * Sent when an admin flips a registration's status to "Подтверждена".
 *
 * Lighter than the post-submit email — no PDF attachments, just a short
 * "your registration was approved + here's what's next" message tailored
 * to the chosen payment method.
 */
export async function sendApprovalEmail({ registration }: SendArgs) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[approval-email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping send."
    );
    return { skipped: true };
  }
  if (!registration.parentEmail) {
    console.warn(
      "[approval-email] registration has no parentEmail — skipping send."
    );
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });

  // Generate the 3 PDFs in parallel (info sheet is static; the other two are
  // overlaid with this registration's data).
  const [infoSheet, contract, annexes] = await Promise.all([
    getInfoSheetPdf(),
    fillContractPdf(registration),
    fillAnnexesPdf(registration),
  ]);

  const childName = registration.childName || "ребёнок";
  const campLabel = CAMP_LABEL[registration.camp] || registration.camp;
  const meeting = CAMP_MEETING[registration.camp] || "";
  const method = registration.paymentMethod || "";

  // Payment-method-specific block
  const paymentBlock =
    method === "cash"
      ? `<p style="margin:0 0 12px;">
           Вы выбрали оплату <strong>наличными при подписании договора</strong>.
           Координатор согласует с вами день и место.
         </p>`
      : method === "stripe"
      ? `<p style="margin:0 0 12px;">
           Вы выбрали оплату <strong>картой через Stripe</strong>.
           Ссылка на оплату была на финальном экране после регистрации;
           если не оплатили — напишите координатору, пришлём заново.
         </p>`
      : "";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;color:#2c2a26;line-height:1.55;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f1d18;">✓ Заявка одобрена</h2>
      <p style="margin:0 0 16px;">
        Здравствуйте! Рады сообщить — заявка
        <strong>${escapeHtml(childName)}</strong> в лагерь подтверждена.
        Место в смене за вашим ребёнком закреплено.
      </p>
      <div style="background:#d1f0dd;border:1px solid #aed8bd;border-radius:10px;padding:14px 16px;margin:0 0 18px;">
        <div style="font-size:13px;color:#1f5f3a;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Смена</div>
        <div style="font-size:15px;margin-top:4px;color:#15693a;">${escapeHtml(campLabel)}</div>
      </div>

      <p style="margin:0 0 12px;"><strong>Во вложениях три документа:</strong></p>
      <ol style="margin:0 0 18px;padding-left:20px;">
        <li><strong>Informācijas lapa vecākiem</strong> — общая информация о лагере, что взять с собой, контакты.</li>
        <li><strong>Līgums</strong> — договор на участие (часть полей предзаполнена; родителю остаётся вписать personas kods и подписать).</li>
        <li><strong>Pielikumi</strong> — анкета участника (предзаполнена) и правила лагеря.</li>
      </ol>

      <p style="margin:0 0 12px;font-weight:600;">Что нужно сделать до начала лагеря:</p>
      <ol style="margin:0 0 18px;padding-left:20px;">
        <li style="margin-bottom:8px;">
          Подпишите <strong>Līgums</strong> и <strong>Pielikumi</strong>
          (электронно или от руки) и пришлите на
          <a href="mailto:Kristiana.vjatere@gmail.com" style="color:#1f5fb8;">Kristiana.vjatere@gmail.com</a>
          — или принесите распечатки в день регистрации лагеря.
        </li>
        <li style="margin-bottom:8px;">
          Произведите оплату согласно выбранному способу (см. ниже).
        </li>
        ${meeting ? `<li style="margin-bottom:8px;">
          Приходите на регистрацию: <strong>${escapeHtml(meeting)}</strong>.
        </li>` : ""}
      </ol>

      ${paymentBlock}

      <p style="margin:0 0 12px;">
        Если возникнут вопросы — звоните или пишите координатору
        <strong>Эсфирь · +371 27626010</strong>,
        либо ответьте на это письмо.
      </p>
      <p style="margin:18px 0 0;font-size:13px;color:#8b867a;">
        С теплом,<br/>команда лагерей 2026
      </p>
    </div>
  `;

  const text =
    `Здравствуйте!\n\n` +
    `Заявка ${childName} в лагерь подтверждена. Место за вашим ребёнком закреплено.\n` +
    `Смена: ${campLabel}\n\n` +
    `Во вложениях три документа:\n` +
    `1. Informācijas lapa vecākiem — общая информация о лагере\n` +
    `2. Līgums — договор на участие (часть полей предзаполнена)\n` +
    `3. Pielikumi — анкета участника + правила лагеря\n\n` +
    `Что нужно сделать до начала лагеря:\n` +
    `1. Подпишите Līgums и Pielikumi (электронно или от руки) и пришлите на Kristiana.vjatere@gmail.com — или принесите распечатки в день регистрации лагеря.\n` +
    `2. Произведите оплату согласно выбранному способу.\n` +
    (meeting ? `3. Приходите на регистрацию: ${meeting}.\n` : "") +
    `\n` +
    (method === "cash"
      ? `Способ оплаты — наличными при подписании договора. Координатор согласует с вами день и место.\n\n`
      : method === "stripe"
      ? `Способ оплаты — картой через Stripe. Ссылка была на финальном экране; если не оплатили — напишите координатору.\n\n`
      : "") +
    `Координатор: Эсфирь · +371 27626010.\n`;

  const info = await transporter.sendMail({
    from: { name: FROM_NAME, address: user },
    to: registration.parentEmail,
    replyTo: user,
    subject: `Заявка одобрена — ${childName}`,
    text,
    html,
    attachments: [
      {
        filename: "Informacijas-lapa-vecakiem-2026.pdf",
        content: Buffer.from(infoSheet),
        contentType: "application/pdf",
      },
      {
        filename: `Ligums-${slugify(childName)}-2026.pdf`,
        content: Buffer.from(contract),
        contentType: "application/pdf",
      },
      {
        filename: `Pielikumi-${slugify(childName)}-2026.pdf`,
        content: Buffer.from(annexes),
        contentType: "application/pdf",
      },
    ],
  });

  return { skipped: false, messageId: info.messageId };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "child"
  );
}
