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
  parentPersonalId?: string;
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

  // Coordinates extracted directly from the template PDF via pdfjs-dist —
  // each value matches the baseline of the actual underline / form field
  // in the original document.

  // Page 1 ───────────────────────────────────────────────────────────────────
  // "2026. gada ____. __________" at y=785. Header text starts at x=405,
  // first blank starts around x=460.
  drawAt(p1, font, dateInline, 463, 787, 10);

  // Triple-row blanks at y=716, labels at y=702.
  //   (Vārds, Uzvārds)        — underline x≈45-280
  //   (personas kods)         — underline x≈285-380
  //   (dzīvesvietas adrese)   — underline x≈390-560
  drawAt(p1, font, reg.parentName, 50, 718, 10, 220);
  drawAt(p1, font, reg.parentPersonalId || "", 287, 718, 10, 130);
  // Address blank runs to the right edge of the page; allow ~165pt and fall
  // back to a slightly smaller font for the few addresses that need more.
  const addr = reg.declaredAddress || "";
  const addrWidth = font.widthOfTextAtSize(addr, 9);
  const addrSize = addrWidth > 165 ? 8 : 9;
  drawAt(p1, font, addr, 425, 718, addrSize, 165);

  // Section 1.1 — underline at y=551, labels at y=540.
  drawAt(p1, font, reg.childName, 50, 553, 10, 230);
  drawAt(p1, font, reg.childPersonalId, 300, 553, 10, 105);

  // Page 2 ───────────────────────────────────────────────────────────────────
  // Right column 5. Pušu rekvizīti — underlines at:
  //   y=372 (Vārds, Uzvārds)
  //   y=334 (Tālruņa nr.)
  //   y=296 (paraksts) — left blank
  drawAt(p2, font, reg.parentName, 325, 374, 10, 235);
  drawAt(p2, font, `+371 ${reg.parentPhone}`, 325, 336, 10, 235);

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

  // Coordinates extracted directly from the template PDF via pdfjs-dist.

  // Page 1 — Anketa, fields 1-11 ────────────────────────────────────────────
  // Header "2026.gada __. _________ Līguma par bērna dalību nometnē" at y=803.
  drawAt(p1, font, dateInline, 340, 805, 9);

  // 1. "Bērna vārds, uzvārds:" — same-line text+underline at y=740.
  drawAt(p1, font, reg.childName, 200, 742, 10, 370);

  // 2. "Bērna dzimšanas datums:" — y=702.
  drawAt(p1, font, reg.childDOB, 210, 704, 10, 230);

  // 3. "Bērna personas kods:" — y=664.
  drawAt(p1, font, reg.childPersonalId, 195, 666, 10, 240);

  // 4. Peldētprasme — options at y=595:
  //    "prot labi peldēt"          x=157
  //    "ir mazliet mācījies/usies" x=251
  //    "neprot peldēt"             x=388
  if (reg.swimmingAbility === "yes") {
    drawOval(p1, 200, 598, 47, 9);
  } else if (reg.swimmingAbility === "weak") {
    drawOval(p1, 313, 598, 65, 9);
  } else if (reg.swimmingAbility === "no") {
    drawOval(p1, 420, 598, 37, 9);
  }

  // 5. Special traits — 2 blank lines at y=519 / y=500.
  if (reg.hasSpecialTraits && reg.specialTraitsDetails) {
    drawWrapped(p1, font, reg.specialTraitsDetails, 50, 521, 9, 495, 2, 19);
  }

  // 6. Veselības problēmas — combine allergies + chronic. Blanks at y=405 / 386.
  const healthParts: string[] = [];
  if (reg.hasAllergies && reg.allergiesDetails)
    healthParts.push("Alerģijas: " + reg.allergiesDetails);
  if (reg.hasChronicIllness && reg.chronicDetails)
    healthParts.push("Hroniskas slimības: " + reg.chronicDetails);
  if (healthParts.length === 0 && !reg.hasAllergies && !reg.hasChronicIllness) {
    healthParts.push("Nav");
  }
  if (healthParts.length) {
    drawWrapped(p1, font, healthParts.join(". "), 50, 407, 9, 495, 2, 19);
  }

  // 7. Medikamenti — blanks at y=310 / 291.
  if (reg.takesMedication && reg.medicationDetails) {
    drawWrapped(p1, font, reg.medicationDetails, 50, 312, 9, 495, 2, 19);
  } else if (reg.takesMedication === false) {
    drawAt(p1, font, "Nav", 50, 312, 9);
  }

  // 8. Encephalitis JĀ / NĒ — JĀ at x=295,y=253; NĒ at x=337,y=253.
  if (reg.hasEncephalitisVaccine === "yes") {
    drawOval(p1, 303, 256, 13, 9);
  } else if (reg.hasEncephalitisVaccine === "no") {
    drawOval(p1, 345, 256, 13, 9);
  }

  // 9. Uzvedības problēmas — not collected, blank.

  // 10. Vai iepriekš piedalījies — JĀ at x=309,y=158; NĒ at x=351,y=158.
  if (reg.participatedOtherCamps === "yes") {
    drawOval(p1, 317, 161, 13, 9);
  } else if (reg.participatedOtherCamps === "no") {
    drawOval(p1, 359, 161, 13, 9);
  }

  // 11. Interešu loks — not collected, blank.

  // Page 2 — Anketa fields 12-14 ────────────────────────────────────────────
  // 12. Pickup persons — three numbered blanks at y=765, y=746, y=727.
  if (reg.pickup1Name) {
    drawAt(
      p2,
      font,
      formatPickup(reg.pickup1Name, reg.pickup1Relation, reg.pickup1Phone),
      85,
      767,
      9,
      460
    );
  }
  if (reg.pickup2Name) {
    drawAt(
      p2,
      font,
      formatPickup(reg.pickup2Name, reg.pickup2Relation, reg.pickup2Phone),
      85,
      748,
      9,
      460
    );
  }
  // Third row left blank.

  // 13. Kas vēl būtu jāzina — blanks at y=671 / 652.
  if (reg.additionalInfo) {
    drawWrapped(p2, font, reg.additionalInfo, 50, 673, 9, 490, 2, 19);
  }

  // 14. "Bērna vecāka vai aizbildņa vārds, uzvārds:" at y=557.
  drawAt(p2, font, reg.parentName, 260, 559, 10, 305);
  // "Datums" at y=481.
  drawAt(p2, font, todayShort, 90, 483, 10);

  // Page 3 — Annex 2 (Rules) ────────────────────────────────────────────────
  // "Dalībnieka Vecāka/Aizbildņa vārds, uzvārds:" at y=118.
  drawAt(p3, font, reg.parentName, 270, 120, 10, 305);
  // "Datums" at y=67.
  drawAt(p3, font, todayShort, 90, 69, 10);

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
