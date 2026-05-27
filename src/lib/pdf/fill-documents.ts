/**
 * Fills the 3 camp documents from a registration payload.
 *
 * Templates live in /public/documents/templates/ and the font (DejaVu Sans,
 * supports Latvian + Cyrillic) lives in /public/documents/fonts/.
 *
 * The Info Sheet is static — returned as-is. The Contract and the Annexes
 * have text drawn on top of the blank lines in the original PDF; coordinates
 * are hand-tuned constants below and may need minor tweaks if the template
 * changes.
 *
 * Coordinate system: pdf-lib uses bottom-left origin, points (1/72 inch).
 * A4 page = 596 × 842 points.
 */
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "public",
  "documents",
  "templates"
);
const FONTS_DIR = path.join(
  process.cwd(),
  "public",
  "documents",
  "fonts"
);

/**
 * What we need from a Registration to fill the documents.
 * Mirrors the shape `prisma.registration.create({ data: ... })` was given.
 */
export type RegistrationForPdf = {
  childName: string;
  childDOB: string;
  childPersonalId: string;
  childGender?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  declaredAddress?: string;
  actualAddress?: string;
  pickup1Name?: string;
  pickup1Phone?: string;
  pickup1Relation?: string;
  pickup2Name?: string;
  pickup2Phone?: string;
  pickup2Relation?: string;
  hasAllergies?: boolean;
  allergiesDetails?: string;
  hasChronicIllness?: boolean;
  chronicDetails?: string;
  takesMedication?: boolean;
  medicationDetails?: string;
  hasSpecialTraits?: boolean;
  specialTraitsDetails?: string;
  hasEncephalitisVaccine?: string; // "yes" | "no" | ""
  participatedOtherCamps?: string; // "yes" | "no" | ""
  swimmingAbility?: string; // "yes" | "no" | "weak" | ""
  additionalInfo?: string;
};

const LV_MONTHS_LOCATIVE = [
  "janvārī",
  "februārī",
  "martā",
  "aprīlī",
  "maijā",
  "jūnijā",
  "jūlijā",
  "augustā",
  "septembrī",
  "oktobrī",
  "novembrī",
  "decembrī",
];

function formatLatvianDateInline(d: Date): string {
  return `${d.getDate()}. ${LV_MONTHS_LOCATIVE[d.getMonth()]}`;
}

async function loadTemplate(filename: string) {
  const buf = await readFile(path.join(TEMPLATES_DIR, filename));
  const pdf = await PDFDocument.load(buf);
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(
    await readFile(path.join(FONTS_DIR, "DejaVuSans.ttf")),
    { subset: true }
  );
  return { pdf, font: regular };
}

function drawAt(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size = 10,
  maxWidth?: number
) {
  if (!text) return;
  let value = text.replace(/\s+/g, " ").trim();
  if (maxWidth) {
    while (font.widthOfTextAtSize(value, size) > maxWidth && value.length > 3) {
      value = value.slice(0, -2) + "…";
    }
  }
  page.drawText(value, { x, y, size, font, color: rgb(0, 0, 0) });
}

/** Draws text wrapped across `lines` lines starting at (x, yTop), each line spaced by lineHeight downward. */
function drawWrapped(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  yTop: number,
  size: number,
  maxWidth: number,
  maxLines: number,
  lineHeight = 14
) {
  if (!text) return;
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const tentative = current ? current + " " + w : w;
    if (font.widthOfTextAtSize(tentative, size) > maxWidth) {
      if (current) lines.push(current);
      current = w;
      if (lines.length >= maxLines) break;
    } else {
      current = tentative;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // truncate the last line with ellipsis if there's overflow
  if (lines.length === maxLines) {
    const consumed =
      cleaned.indexOf(lines[maxLines - 1]) + lines[maxLines - 1].length;
    if (consumed < cleaned.length) {
      let last = lines[maxLines - 1];
      while (
        font.widthOfTextAtSize(last + "…", size) > maxWidth &&
        last.length > 3
      ) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + "…";
    }
  }
  lines.forEach((line, i) => {
    page.drawText(line, {
      x,
      y: yTop - i * lineHeight,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

/** Draw an oval (border only) around a fixed-size rectangle — used to "apvilkt" (circle) the chosen option. */
function drawOval(
  page: PDFPage,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: rx,
    yScale: ry,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.2,
    opacity: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Info sheet — static, return as-is.
// ─────────────────────────────────────────────────────────────────────────────

export async function getInfoSheetPdf(): Promise<Uint8Array> {
  return await readFile(
    path.join(TEMPLATES_DIR, "info-sheet-parents-2026.pdf")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) LĪGUMS — overlay parent + child details on the contract template.
// ─────────────────────────────────────────────────────────────────────────────

export async function fillContractPdf(
  reg: RegistrationForPdf
): Promise<Uint8Array> {
  const { pdf, font } = await loadTemplate("ligums-2026.pdf");
  const [p1, p2] = pdf.getPages();
  const today = new Date();
  const dateInline = formatLatvianDateInline(today);

  // Page 1 ───────────────────────────────────────────────────────────────────
  // "2026. gada ____. __________" — top-right; fills "15. maijā" style
  drawAt(p1, font, dateInline, 470, 793, 10);

  // Top blank row: (Vārds, Uzvārds) | (personas kods) | (dzīvesvietas adrese)
  // We fill parent name + address; personas kods left blank for the parent
  // to fill in by hand at signing.
  drawAt(p1, font, reg.parentName, 60, 707, 10, 240);
  drawAt(p1, font, reg.declaredAddress || "", 430, 707, 9, 150);

  // Section 1.1 — child name and personas kods (one line below "1. Līguma priekšmets")
  drawAt(p1, font, reg.childName, 50, 538, 10, 280);
  drawAt(p1, font, reg.childPersonalId, 345, 538, 10, 110);

  // Page 2 ───────────────────────────────────────────────────────────────────
  // Section 5 — Vecāks/Aizbildnis (right column)
  drawAt(p2, font, reg.parentName, 340, 188, 10, 200);
  drawAt(p2, font, `+371 ${reg.parentPhone}`, 340, 152, 10, 200);
  // Signature line — left blank

  return await pdf.save();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Pielikumi — fill Annex 1 (questionnaire) and parent name in Annex 2.
// ─────────────────────────────────────────────────────────────────────────────

export async function fillAnnexesPdf(
  reg: RegistrationForPdf
): Promise<Uint8Array> {
  const { pdf, font } = await loadTemplate("pielikumi-2026.pdf");
  const pages = pdf.getPages();
  const [p1, p2, p3] = pages;
  const today = new Date();
  const dateInline = formatLatvianDateInline(today);
  const todayShort = `${String(today.getDate()).padStart(2, "0")}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${today.getFullYear()}`;

  // Page 1 — Anketa, fields 1-11 ────────────────────────────────────────────
  // Top date: "2026.gada __. ________ Līguma par bērna dalību nometnē"
  drawAt(p1, font, dateInline, 175, 793, 9);

  // 1. Bērna vārds, uzvārds
  drawAt(p1, font, reg.childName, 165, 728, 10, 380);

  // 2. Bērna dzimšanas datums
  drawAt(p1, font, reg.childDOB, 200, 685, 10, 200);

  // 3. Bērna personas kods
  drawAt(p1, font, reg.childPersonalId, 175, 640, 10, 200);

  // 4. Peldētprasme — apvilkt vajadzīgo
  //    options inline: "prot labi peldēt    ir mazliet mācījies/usies    neprot peldēt"
  if (reg.swimmingAbility === "yes") {
    drawOval(p1, 195, 580, 55, 10);
  } else if (reg.swimmingAbility === "weak") {
    drawOval(p1, 330, 580, 78, 10);
  } else if (reg.swimmingAbility === "no") {
    drawOval(p1, 463, 580, 45, 10);
  }

  // 5. Special traits text (only if explicitly answered)
  if (reg.hasSpecialTraits && reg.specialTraitsDetails) {
    drawWrapped(
      p1,
      font,
      reg.specialTraitsDetails,
      50,
      517,
      9,
      495,
      2,
      14
    );
  }

  // 6. Veselības problēmas — combine allergies + chronic
  const healthParts: string[] = [];
  if (reg.hasAllergies && reg.allergiesDetails)
    healthParts.push("Aлерģijas: " + reg.allergiesDetails);
  if (reg.hasChronicIllness && reg.chronicDetails)
    healthParts.push("Hroniskas slimības: " + reg.chronicDetails);
  if (healthParts.length === 0 && !reg.hasAllergies && !reg.hasChronicIllness) {
    healthParts.push("Nav");
  }
  if (healthParts.length) {
    drawWrapped(
      p1,
      font,
      healthParts.join(". "),
      50,
      415,
      9,
      495,
      2,
      14
    );
  }

  // 7. Medikamenti
  if (reg.takesMedication && reg.medicationDetails) {
    drawWrapped(
      p1,
      font,
      reg.medicationDetails,
      50,
      318,
      9,
      495,
      2,
      14
    );
  } else if (reg.takesMedication === false) {
    drawAt(p1, font, "Nav", 50, 318, 9);
  }

  // 8. Encephalitis JĀ / NĒ
  if (reg.hasEncephalitisVaccine === "yes") {
    drawOval(p1, 290, 240, 12, 9);
  } else if (reg.hasEncephalitisVaccine === "no") {
    drawOval(p1, 325, 240, 12, 9);
  }

  // 9. Uzvedības problēmas — we do not collect, leave blank

  // 10. Vai iepriekš piedalījies — JĀ/NĒ
  if (reg.participatedOtherCamps === "yes") {
    drawOval(p1, 322, 130, 12, 9);
  } else if (reg.participatedOtherCamps === "no") {
    drawOval(p1, 358, 130, 12, 9);
  }

  // 11. Interešu loks — not collected, blank

  // Page 2 — Anketa fields 12-14 ────────────────────────────────────────────
  // 12. Pickup persons — three blank rows. We have two from the form.
  if (reg.pickup1Name) {
    const line1 = formatPickup(
      reg.pickup1Name,
      reg.pickup1Relation,
      reg.pickup1Phone
    );
    drawAt(p2, font, line1, 55, 758, 9, 490);
  }
  if (reg.pickup2Name) {
    const line2 = formatPickup(
      reg.pickup2Name,
      reg.pickup2Relation,
      reg.pickup2Phone
    );
    drawAt(p2, font, line2, 55, 735, 9, 490);
  }
  // Third row left blank.

  // 13. Kas vēl būtu jāzina
  if (reg.additionalInfo) {
    drawWrapped(
      p2,
      font,
      reg.additionalInfo,
      55,
      660,
      9,
      490,
      2,
      14
    );
  }

  // 14. Parent name (signature + date blank for hand signing)
  drawAt(p2, font, reg.parentName, 270, 540, 10, 290);
  drawAt(p2, font, todayShort, 130, 478, 10);

  // Page 3 — Annex 2 (Rules), parent name at bottom ──────────────────────────
  drawAt(p3, font, reg.parentName, 305, 130, 10, 250);
  drawAt(p3, font, todayShort, 130, 75, 10);

  return await pdf.save();
}

function formatPickup(
  name: string,
  relation?: string,
  phone?: string
): string {
  const parts = [name];
  if (relation) parts.push(relation);
  if (phone) parts.push(`+371 ${phone}`);
  return parts.join(", ");
}
