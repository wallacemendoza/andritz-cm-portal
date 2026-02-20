import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Colors ─────────────────────────────────────────────────────────────────
const BLUE       = [0, 117, 190];
const DARK_BLUE  = [0, 58, 112];
const RED        = [228, 0, 43];
const WHITE      = [255, 255, 255];
const DARK_TEXT  = [33, 43, 54];
const BODY_TEXT  = [66, 82, 100];
const MUTED      = [130, 148, 166];
const PAGE_BG    = [218, 232, 242];
const CARD_BG    = [238, 246, 252];
const ROW_BG     = [232, 243, 251];
const BORDER     = [183, 202, 216];
const BORDER_LT  = [208, 222, 232];
const GREEN_DARK = [46, 125, 50];
const GREEN_MED  = [76, 175, 80];

const STATUS = {
  acceptable: { bg: [232, 245, 233], border: [76, 175, 80] },
  caution:    { bg: [255, 248, 225], border: [255, 193, 7]  },
  alert:      { bg: [253, 236, 234], border: [229, 57, 53]  },
};

// ─── Page geometry ───────────────────────────────────────────────────────────
const PW   = 210;
const PH   = 297;
const ML   = 8;
const MR   = 8;
const SW   = 18;
const CX   = ML + SW + 3;
const CW   = PW - CX - MR;
const GAP  = 2.5;
const RH   = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function bg(doc) {
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, PW, PH, 'F');
}

function tf(doc, size, style, color) {
  doc.setFont('helvetica', style || 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(color || DARK_TEXT));
}

function rr(doc, x, y, w, h, r, fill, stroke, lw) {
  doc.setLineWidth(lw || 0.45);
  if (fill)   doc.setFillColor(...fill);
  if (stroke) doc.setDrawColor(...stroke);
  else        doc.setDrawColor(255, 255, 255);
  const mode = fill && stroke ? 'FD' : fill ? 'F' : 'D';
  doc.roundedRect(x, y, w, h, r, r, mode);
}

function dot(doc, x, y) {
  doc.setFillColor(...RED);
  doc.circle(x, y, 1.9, 'F');
}

function row(doc, label, value, x, y, w, h, rowBg, valColor) {
  rr(doc, x, y, w, h, 4, rowBg || ROW_BG, BORDER_LT, 0.4);
  dot(doc, x + 7, y + h / 2);
  tf(doc, 9.5, 'bold', DARK_TEXT);
  doc.text(label + ':', x + 12, y + h / 2 + 1.3);
  const lw = doc.getTextWidth(label + ': ');
  tf(doc, 9.5, 'bold', valColor || BLUE);
  doc.text(String(value || '\u2014'), x + 12 + lw, y + h / 2 + 1.3);
}

function card(doc, y, h) {
  rr(doc, ML, y, PW - ML - MR, h, 7, CARD_BG, BORDER, 0.5);
}

function sideLabel(doc, text, cardY, cardH) {
  tf(doc, 8, 'boldoblique', [85, 128, 170]);
  doc.saveGraphicsState();
  doc.text(text, ML + SW / 2, cardY + cardH / 2, { angle: 90, align: 'center' });
  doc.restoreGraphicsState();
}

function imgBox(doc, x, y, w, h, headerLabel, headerBold, imgData) {
  rr(doc, x, y, w, h, 6, WHITE, BORDER, 0.5);
  rr(doc, x + 2, y + 2, w - 4, 11, 3, ROW_BG, null, 0);
  dot(doc, x + 8, y + 7.8);
  tf(doc, 9, 'normal', DARK_TEXT);
  doc.text(headerLabel + ' ', x + 13, y + 9);
  const lw2 = doc.getTextWidth(headerLabel + ' ');
  tf(doc, 9, 'bold', BLUE);
  doc.text(headerBold, x + 13 + lw2, y + 9);
  const ix = x + 3, iy = y + 15, iw = w - 6, ih = h - 18;
  if (imgData) {
    try {
      const fmt = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(imgData, fmt, ix, iy, iw, ih);
    } catch (_) {
      rr(doc, ix, iy, iw, ih, 3, [240, 245, 250], BORDER_LT, 0.3);
    }
  } else {
    rr(doc, ix, iy, iw, ih, 3, [240, 245, 250], BORDER_LT, 0.3);
  }
}

function drawHeader(doc, title, subtitle, millName) {
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PW, 42, 'F');
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(0, 42, PW, 42);

  // Logo box
  rr(doc, ML, 4, 58, 34, 5, WHITE, BORDER, 0.6);
  tf(doc, 17, 'bold', DARK_BLUE);
  doc.text('ANDRiTZ', ML + 5, 16);
  doc.setFillColor(...GREEN_MED);
  doc.circle(ML + 6, 24, 4, 'F');
  doc.setFillColor(...GREEN_DARK);
  doc.circle(ML + 12, 27, 3.2, 'F');
  tf(doc, 7.5, 'bold', DARK_TEXT);
  // Use mill name if short enough, otherwise use generic
  const displayName = millName && millName.length < 20 ? millName.toUpperCase() : 'CLEARWATER PAPER';
  const mLines = doc.splitTextToSize(displayName, 38);
  doc.text(mLines[0] || 'CLEARWATER', ML + 19, 23);
  doc.text(mLines[1] || 'PAPER', ML + 19, 30);

  // Divider
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.7);
  doc.line(ML + 62, 5, ML + 62, 38);

  // Title
  tf(doc, 20, 'bold', DARK_BLUE);
  doc.text(title, ML + 67, 18);
  tf(doc, 12, 'bold', BLUE);
  doc.text(subtitle, ML + 67, 30);
}

function drawFooter(doc, formId) {
  doc.setDrawColor(...BORDER_LT);
  doc.setLineWidth(0.3);
  doc.line(ML, PH - 12, PW - MR, PH - 12);
  tf(doc, 6.5, 'normal', MUTED);
  doc.text('ANDRITZ Condition Monitoring System  \u00b7  ' + formId + '  \u00b7  ' + new Date().toLocaleDateString(), ML, PH - 7);
  tf(doc, 6.5, 'bold', MUTED);
  doc.text('CONFIDENTIAL', PW - MR, PH - 7, { align: 'right' });
}

// ─── CONDITION MONITORING REPORT ─────────────────────────────────────────────
export function generateConditionMonitorPDF(data, millName) {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const num  = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const yr   = new Date().getFullYear();
  const formId     = 'CMR-' + num + '-' + yr;
  const cmrDisplay = num + '-' + yr;   // no "CMR-" prefix in the field value

  bg(doc);
  drawHeader(doc, 'Condition Monitoring Report', 'Vibration Diagnosis and Recommendation', millName);

  const sc    = STATUS[(data.statusCondition || 'alert').toLowerCase()] || STATUS.alert;
  const riskL = data.risk === 'low' ? 'Low Risk' : data.risk === 'medium' ? 'Medium Risk' : 'High Risk';

  let y = 45;

  // General Information
  const GEN_H = RH * 4 + GAP * 5 + 6;
  card(doc, y, GEN_H);
  sideLabel(doc, 'General Information', y, GEN_H);

  const HALF  = (CW - GAP) / 2;
  const THIRD = (CW - GAP * 2) / 3;
  let ry = y + GAP;

  row(doc, 'Location', data.area || '\u2014', CX, ry, CW, RH, ROW_BG, BLUE);
  ry += RH + GAP;

  row(doc, 'Asset & ID',
    (data.assetName || '\u2014') + (data.assetId ? '  \u2014  ' + data.assetId : ''),
    CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Status Condition',
    (data.statusCondition || 'Alert').charAt(0).toUpperCase() + (data.statusCondition || 'alert').slice(1),
    CX + HALF + GAP, ry, HALF, RH, sc.bg, BLUE);
  ry += RH + GAP;

  row(doc, 'Vibration Diagnosis', data.diagnosis || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Temperature', data.temperature ? data.temperature + ' \u00b0F' : '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;

  row(doc, 'Risk', riskL, CX, ry, THIRD, RH, ROW_BG, BLUE);
  row(doc, 'CMR', cmrDisplay, CX + THIRD + GAP, ry, THIRD, RH, ROW_BG, DARK_BLUE);
  row(doc, 'Vibration Level',
    data.vibrationLevel ? data.vibrationLevel + ' G' : (data.geLevel || '\u2014'),
    CX + THIRD * 2 + GAP * 2, ry, THIRD, RH, sc.bg, BLUE);

  y += GEN_H + 4;

  // Vibration Diagnosis section
  const recLines = (data.recommendation || '').split('\n').filter(function(r) { return r.trim(); });
  const REC_H    = Math.max(28, recLines.length * 8 + 18);
  const CHART_H  = 55;
  const IMGROW_H = 62;
  const FOOT_H   = 14;
  const VIB_H    = CHART_H + GAP + IMGROW_H + GAP + REC_H + GAP + FOOT_H + GAP * 3 + 4;

  card(doc, y, VIB_H);
  sideLabel(doc, 'Vibration Diagnosis and Recommendation', y, VIB_H);

  const HCW = (CW - GAP) / 2;
  let vy = y + GAP;

  imgBox(doc, CX, vy, HCW, CHART_H, 'Trend:', data.diagnosis || '', data.trendImage);
  imgBox(doc, CX + HCW + GAP, vy, HCW, CHART_H, 'Spectrum:', 'Frequency Spectrum', data.spectrumImage);
  vy += CHART_H + GAP;

  imgBox(doc, CX, vy, HCW, IMGROW_H, 'Machine', 'Image', data.machineImage);

  // Description box
  rr(doc, CX + HCW + GAP, vy, HCW, IMGROW_H, 6, CARD_BG, BORDER, 0.5);
  rr(doc, CX + HCW + GAP + 2, vy + 2, HCW - 4, 11, 3, ROW_BG, null, 0);
  dot(doc, CX + HCW + GAP + 8, vy + 8);
  tf(doc, 9.5, 'bold', BLUE);
  doc.text('Description', CX + HCW + GAP + 13, vy + 9.2);
  tf(doc, 8, 'normal', BODY_TEXT);
  const descLines = doc.splitTextToSize(data.observations || '', HCW - 10);
  descLines.slice(0, 7).forEach(function(l, i) {
    doc.text(l, CX + HCW + GAP + 6, vy + 18 + i * 6.2);
  });
  vy += IMGROW_H + GAP;

  // Recommendation
  rr(doc, CX, vy, CW, REC_H, 5, WHITE, BORDER_LT, 0.4);
  dot(doc, CX + 7, vy + 9);
  tf(doc, 10, 'bold', BLUE);
  doc.text('Recommendation', CX + 12, vy + 10.2);
  tf(doc, 8.5, 'normal', BODY_TEXT);
  let rly = vy + 19;
  recLines.slice(0, 7).forEach(function(line) {
    const wrapped = doc.splitTextToSize(line.replace(/^[-\u2022]\s*/, ''), CW - 18);
    doc.setFillColor(100, 115, 130);
    doc.circle(CX + 8, rly, 1.5, 'F');
    wrapped.forEach(function(wl, wi) { doc.text(wl, CX + 13, rly + wi * 6); });
    rly += wrapped.length * 6 + 2;
  });
  vy += REC_H + GAP;

  // Footer row
  const FH2 = (CW - GAP) / 2;
  rr(doc, CX, vy, FH2, FOOT_H, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + 7, vy + FOOT_H / 2);
  tf(doc, 9.5, 'bold', DARK_TEXT);
  doc.text('Emitted by ', CX + 12, vy + FOOT_H / 2 + 1.3);
  tf(doc, 9.5, 'bold', BLUE);
  doc.text(data.technicianName || '________________', CX + 12 + doc.getTextWidth('Emitted by '), vy + FOOT_H / 2 + 1.3);

  rr(doc, CX + FH2 + GAP, vy, FH2, FOOT_H, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + FH2 + GAP + 7, vy + FOOT_H / 2);
  tf(doc, 9.5, 'bold', DARK_TEXT);
  doc.text('Note Date ', CX + FH2 + GAP + 12, vy + FOOT_H / 2 + 1.3);
  tf(doc, 9.5, 'bold', BLUE);
  doc.text(data.date || new Date().toLocaleDateString(), CX + FH2 + GAP + 12 + doc.getTextWidth('Note Date '), vy + FOOT_H / 2 + 1.3);

  drawFooter(doc, formId);
  doc.save(formId + '_Condition_Monitor.pdf');
  return formId;
}

// ─── POST MAINTENANCE ─────────────────────────────────────────────────────────
export function generatePostMaintenancePDF(data, millName) {
  const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
  const num    = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const formId = 'PMF-' + num + '-' + new Date().getFullYear();
  bg(doc);
  drawHeader(doc, 'Post Maintenance Form', 'Maintenance Record & Post-Check Readings', millName);

  const HALF = (CW - GAP) / 2;
  let y = 45;

  const GEN_H = RH * 3 + GAP * 4 + 6;
  card(doc, y, GEN_H);
  sideLabel(doc, 'General Information', y, GEN_H);
  let ry = y + GAP;
  row(doc, 'Maintenance Date', data.maintenanceDate || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Work Order #', data.woNumber || '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, DARK_BLUE);
  ry += RH + GAP;
  row(doc, 'Technician', data.technicianName || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Asset', (data.assetName || '\u2014') + (data.assetId ? ' / ' + data.assetId : ''), CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Area / Location', data.area || '\u2014', CX, ry, CW, RH, ROW_BG, BLUE);
  y += GEN_H + 4;

  const READ_H = RH * 2 + GAP * 3 + 6;
  card(doc, y, READ_H);
  sideLabel(doc, 'Pre / Post Readings', y, READ_H);
  ry = y + GAP;
  row(doc, 'Vibration Before', data.vibrationBefore ? data.vibrationBefore + ' in/s' : '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Vibration After',  data.vibrationAfter  ? data.vibrationAfter  + ' in/s' : '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Temperature Before', data.tempBefore ? data.tempBefore + ' \u00b0F' : '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Temperature After',  data.tempAfter  ? data.tempAfter  + ' \u00b0F' : '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  y += READ_H + 4;

  [
    { label: 'Maintenance Performed', key: 'maintenancePerformed', side: 'Maintenance' },
    { label: 'Parts / Components Replaced', key: 'partsReplaced', side: 'Parts' },
    { label: 'Notes', key: 'notes', side: 'Notes' },
  ].forEach(function(item) {
    const lines = doc.splitTextToSize(data[item.key] || '\u2014', CW - 16);
    const h = Math.max(26, lines.length * 6.5 + 18);
    card(doc, y, h + 4);
    sideLabel(doc, item.side, y, h + 4);
    rr(doc, CX, y + 2, CW, h, 5, WHITE, BORDER_LT, 0.4);
    dot(doc, CX + 7, y + 10);
    tf(doc, 9.5, 'bold', BLUE); doc.text(item.label, CX + 12, y + 11);
    tf(doc, 8.5, 'normal', BODY_TEXT);
    lines.slice(0, 7).forEach(function(l, i) {
      doc.setFillColor(110, 125, 140); doc.circle(CX + 8, y + 18 + i * 6.5, 1.3, 'F');
      doc.text(l, CX + 13, y + 18 + i * 6.5);
    });
    y += h + 8;
  });

  const FH2 = (CW - GAP) / 2;
  rr(doc, CX, y, FH2, 14, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + 7, y + 7); tf(doc, 9.5, 'bold', DARK_TEXT); doc.text('Completed by ', CX + 12, y + 8.3);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.technicianName || '___________', CX + 12 + doc.getTextWidth('Completed by '), y + 8.3);
  rr(doc, CX + FH2 + GAP, y, FH2, 14, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + FH2 + GAP + 7, y + 7); tf(doc, 9.5, 'bold', DARK_TEXT); doc.text('Date ', CX + FH2 + GAP + 12, y + 8.3);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.maintenanceDate || '\u2014', CX + FH2 + GAP + 12 + doc.getTextWidth('Date '), y + 8.3);

  drawFooter(doc, formId);
  doc.save(formId + '_Post_Maintenance.pdf');
  return formId;
}

// ─── RCFA ─────────────────────────────────────────────────────────────────────
export function generateRCFAPDF(data, millName) {
  const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
  const num    = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const formId = 'RCFA-' + num + '-' + new Date().getFullYear();
  bg(doc);
  drawHeader(doc, 'Root Cause Failure Analysis', '5-Whys Methodology & Corrective Actions', millName);

  const HALF = (CW - GAP) / 2;
  let y = 45;

  const GEN_H = RH * 3 + GAP * 4 + 6;
  card(doc, y, GEN_H);
  sideLabel(doc, 'General Information', y, GEN_H);
  let ry = y + GAP;
  row(doc, 'Event Date', data.eventDate || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Work Order #', data.woNumber || '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, DARK_BLUE);
  ry += RH + GAP;
  row(doc, 'Analyst', data.analystName || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Area', data.area || '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Failed Component', data.failedComponent || '\u2014', CX, ry, CW, RH, ROW_BG, BLUE);
  y += GEN_H + 4;

  const WHY_H = RH * 5 + GAP * 6 + 6;
  card(doc, y, WHY_H);
  sideLabel(doc, '5 Whys Analysis', y, WHY_H);
  ry = y + GAP;
  [data.why1, data.why2, data.why3, data.why4, data.why5].forEach(function(why, i) {
    rr(doc, CX, ry, CW, RH, 4, i % 2 === 0 ? ROW_BG : WHITE, BORDER_LT, 0.35);
    rr(doc, CX, ry, 20, RH, 4, DARK_BLUE, null, 0);
    tf(doc, 7.5, 'bold', WHITE); doc.text('WHY ' + (i + 1), CX + 10, ry + RH / 2 + 1.2, { align: 'center' });
    tf(doc, 9, 'normal', DARK_TEXT); doc.text(doc.splitTextToSize(why || '\u2014', CW - 28)[0], CX + 24, ry + RH / 2 + 1.2);
    ry += RH + GAP;
  });
  y += WHY_H + 4;

  const RC_H = 16;
  card(doc, y, RC_H + 6);
  sideLabel(doc, 'Root Cause', y, RC_H + 6);
  rr(doc, CX, y + 3, CW, RC_H, 4, [255, 240, 240], [229, 57, 53], 0.5);
  dot(doc, CX + 7, y + 11); tf(doc, 9.5, 'bold', DARK_TEXT); doc.text('Root Cause: ', CX + 12, y + 12.3);
  tf(doc, 9.5, 'bold', RED); doc.text(data.rootCause || '\u2014', CX + 12 + doc.getTextWidth('Root Cause: '), y + 12.3);
  y += RC_H + 10;

  const caLines = doc.splitTextToSize(data.correctiveActions || '\u2014', CW - 18);
  const CA_H = Math.max(28, caLines.length * 6.5 + 18);
  card(doc, y, CA_H + 4);
  sideLabel(doc, 'Corrective Actions', y, CA_H + 4);
  rr(doc, CX, y + 2, CW, CA_H, 5, WHITE, BORDER_LT, 0.4);
  dot(doc, CX + 7, y + 10); tf(doc, 9.5, 'bold', BLUE); doc.text('Corrective Actions', CX + 12, y + 11.2);
  tf(doc, 8.5, 'normal', BODY_TEXT);
  caLines.slice(0, 7).forEach(function(l, i) {
    doc.setFillColor(110, 125, 140); doc.circle(CX + 8, y + 18 + i * 6.5, 1.3, 'F');
    doc.text(l, CX + 13, y + 18 + i * 6.5);
  });
  y += CA_H + 8;

  const FH2 = (CW - GAP) / 2;
  rr(doc, CX, y, FH2, 14, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + 7, y + 7); tf(doc, 9.5, 'bold', DARK_TEXT); doc.text('Analyst: ', CX + 12, y + 8.3);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.analystName || '___________', CX + 12 + doc.getTextWidth('Analyst: '), y + 8.3);
  rr(doc, CX + FH2 + GAP, y, FH2, 14, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + FH2 + GAP + 7, y + 7); tf(doc, 9.5, 'bold', DARK_TEXT); doc.text('Date: ', CX + FH2 + GAP + 12, y + 8.3);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.eventDate || '\u2014', CX + FH2 + GAP + 12 + doc.getTextWidth('Date: '), y + 8.3);

  drawFooter(doc, formId);
  doc.save(formId + '_RCFA.pdf');
  return formId;
}

// ─── SAFETY FORM ──────────────────────────────────────────────────────────────
export function generateSafetyPDF(data, millName) {
  const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
  const num    = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const formId = 'SF-' + num + '-' + new Date().getFullYear();
  bg(doc);
  drawHeader(doc, 'Safety Form', 'Job Safety Analysis & PPE Checklist', millName);

  const HALF = (CW - GAP) / 2;
  let y = 45;

  const GEN_H = RH * 3 + GAP * 4 + 6;
  card(doc, y, GEN_H);
  sideLabel(doc, 'General Information', y, GEN_H);
  let ry = y + GAP;
  row(doc, 'Date', data.date || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Area', data.area || '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Employee', data.employeeName || '\u2014', CX, ry, HALF, RH, ROW_BG, BLUE);
  row(doc, 'Supervisor', data.supervisor || '\u2014', CX + HALF + GAP, ry, HALF, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Task', data.taskDescription || '\u2014', CX, ry, CW, RH, ROW_BG, BLUE);
  y += GEN_H + 4;

  const ppeItems = [
    { key: 'hardHat', label: 'Hard Hat' }, { key: 'safetyGlasses', label: 'Safety Glasses' },
    { key: 'steelToeBoots', label: 'Steel Toe Boots' }, { key: 'highVisVest', label: 'High Vis Vest' },
    { key: 'hearingProtection', label: 'Hearing Protection' }, { key: 'gloves', label: 'Gloves' },
    { key: 'fallProtection', label: 'Fall Protection' }, { key: 'faceShield', label: 'Face Shield' },
  ];
  const PPE_H = 50;
  card(doc, y, PPE_H);
  sideLabel(doc, 'PPE Checklist', y, PPE_H);
  rr(doc, CX, y + 2, CW, PPE_H - 4, 5, [238, 246, 252], BORDER_LT, 0.35);
  const COLS = 4;
  ppeItems.forEach(function(item, i) {
    const col = i % COLS;
    const rw  = Math.floor(i / COLS);
    const px  = CX + 4 + col * (CW / COLS);
    const py  = y + 11 + rw * 15;
    const checked = data[item.key];
    doc.setFillColor(...(checked ? [46, 139, 87] : [195, 212, 224]));
    doc.roundedRect(px, py - 4, 6.5, 6.5, 1, 1, 'F');
    if (checked) { tf(doc, 6, 'bold', WHITE); doc.text('\u2713', px + 0.8, py + 2.2); }
    tf(doc, 8.5, checked ? 'bold' : 'normal', checked ? [46, 139, 87] : MUTED);
    doc.text(item.label, px + 9, py + 1);
  });
  y += PPE_H + 4;

  [
    { label: 'Hazards Identified', key: 'hazards', side: 'Hazards' },
    { label: 'Control Measures', key: 'controlMeasures', side: 'Controls' },
  ].forEach(function(item) {
    const lines = doc.splitTextToSize(data[item.key] || '\u2014', CW - 16);
    const h = Math.max(26, lines.length * 6.5 + 18);
    card(doc, y, h + 4);
    sideLabel(doc, item.side, y, h + 4);
    rr(doc, CX, y + 2, CW, h, 5, WHITE, BORDER_LT, 0.4);
    dot(doc, CX + 7, y + 10); tf(doc, 9.5, 'bold', BLUE); doc.text(item.label, CX + 12, y + 11.2);
    tf(doc, 8.5, 'normal', BODY_TEXT);
    lines.slice(0, 6).forEach(function(l, i) {
      doc.setFillColor(110, 125, 140); doc.circle(CX + 8, y + 18 + i * 6.5, 1.3, 'F');
      doc.text(l, CX + 13, y + 18 + i * 6.5);
    });
    y += h + 8;
  });

  const SH = 24;
  rr(doc, CX, y, HALF, SH, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + 7, y + 8); tf(doc, 8, 'bold', MUTED); doc.text('Employee Signature', CX + 12, y + 9);
  doc.setDrawColor(...BORDER); doc.setLineWidth(0.4); doc.line(CX + 5, y + 20, CX + HALF - 4, y + 20);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.employeeName || '', CX + 5, y + 19);
  rr(doc, CX + HALF + GAP, y, HALF, SH, 4, ROW_BG, BORDER_LT, 0.4);
  dot(doc, CX + HALF + GAP + 7, y + 8); tf(doc, 8, 'bold', MUTED); doc.text('Supervisor Signature', CX + HALF + GAP + 12, y + 9);
  doc.setDrawColor(...BORDER); doc.line(CX + HALF + GAP + 5, y + 20, CX + CW - 4, y + 20);
  tf(doc, 9.5, 'bold', BLUE); doc.text(data.supervisor || '', CX + HALF + GAP + 5, y + 19);

  drawFooter(doc, formId);
  doc.save(formId + '_Safety_Form.pdf');
  return formId;
}