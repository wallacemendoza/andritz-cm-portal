import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const BLUE       = [0, 117, 190];
const DARK_BLUE  = [0, 58, 112];
const RED        = [228, 0, 43];
const WHITE      = [255, 255, 255];
const DARK_TEXT  = [40, 50, 65];
const BODY_TEXT  = [70, 85, 105];
const MUTED      = [130, 150, 170];

const PAGE_BG    = [221, 234, 243];   // light steel-blue page bg
const CARD_BG    = [240, 246, 251];   // section card bg
const ROW_BG     = [235, 244, 251];   // normal row bg
const BORDER_CLR = [187, 204, 216];   // border gray-blue
const BORDER_L   = [210, 225, 235];   // lighter border

// Status condition colors
const STATUS_COLORS = {
  acceptable: { bg: [232, 245, 233], border: [76, 175, 80],  text: DARK_TEXT },
  caution:    { bg: [255, 248, 225], border: [255, 193, 7],   text: DARK_TEXT },
  alert:      { bg: [253, 236, 234], border: [229, 57, 53],   text: DARK_TEXT }
};

const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN  = 11;
const SIDE_W  = 20;   // rotated label column
const CARD_X  = MARGIN + SIDE_W + 4;
const CARD_W  = PAGE_W - CARD_X - MARGIN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pageSetup(doc) {
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

function setF(doc, size, style = 'normal', color = DARK_TEXT) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function rrect(doc, x, y, w, h, r, bg, stroke) {
  if (bg)     { doc.setFillColor(...bg); }
  if (stroke) { doc.setDrawColor(...stroke); doc.setLineWidth(0.5); }
  else        { doc.setDrawColor(255,255,255); doc.setLineWidth(0); }

  // jsPDF has roundedRect
  if (bg && stroke) doc.roundedRect(x, y, w, h, r, r, 'FD');
  else if (bg)      doc.roundedRect(x, y, w, h, r, r, 'F');
  else              doc.roundedRect(x, y, w, h, r, r, 'D');
}

function redDot(doc, x, y, r = 1.8) {
  doc.setFillColor(...RED);
  doc.circle(x, y, r, 'F');
}

function fieldRow(doc, label, value, x, y, w, h, bg, valueFontStyle, valueColor) {
  rrect(doc, x, y, w, h, 4, bg || ROW_BG, BORDER_L);
  redDot(doc, x + 6, y + h / 2 - 0.3);
  setF(doc, 9.5, 'bold', DARK_TEXT);
  doc.text(label + ':', x + 11, y + h / 2 + 1.2);
  const lw = doc.getTextWidth(label + ': ');
  setF(doc, 9.5, valueFontStyle || 'bold', valueColor || BLUE);
  doc.text(String(value || '—'), x + 11 + lw, y + h / 2 + 1.2);
}

function sideLabel(doc, text, x, y, h) {
  doc.setFillColor(...[91, 135, 176]);
  doc.setFont('helvetica', 'boldoblique');
  doc.setFontSize(8.5);
  doc.setTextColor(91, 135, 176);
  doc.saveGraphicsState();
  doc.text(text, x + 5, y + h / 2, { angle: 90, align: 'center' });
  doc.restoreGraphicsState();
}

function sectionCard(doc, y, h) {
  rrect(doc, MARGIN, y, PAGE_W - MARGIN * 2, h, 8, CARD_BG, BORDER_CLR);
}

function chartPlaceholder(doc, x, y, w, h, label, value, imageData) {
  rrect(doc, x, y, w, h, 6, WHITE, BORDER_CLR);
  // header row inside
  rrect(doc, x + 2, y + 2, w - 4, 10, 3, ROW_BG, null);
  redDot(doc, x + 8, y + 7.5);
  setF(doc, 8.5, 'bold', DARK_TEXT);
  doc.text(label + ':', x + 13, y + 8.5);
  const lw = doc.getTextWidth(label + ': ');
  setF(doc, 8.5, 'bold', BLUE);
  doc.text(value || '', x + 13 + lw, y + 8.5);
  // content area
  const cx = x + 3, cy = y + 14, cw = w - 6, ch = h - 17;
  if (imageData) {
    try {
      doc.addImage(imageData, 'JPEG', cx, cy, cw, ch);
    } catch {
      rrect(doc, cx, cy, cw, ch, 3, [245, 248, 252], BORDER_L);
      setF(doc, 7.5, 'normal', MUTED);
      doc.text('Image could not be loaded', cx + cw / 2, cy + ch / 2, { align: 'center' });
    }
  } else {
    rrect(doc, cx, cy, cw, ch, 3, [245, 248, 252], BORDER_L);
    // empty - no placeholder text as per user request
  }
}

function machineImageBox(doc, x, y, w, h, imageData) {
  rrect(doc, x, y, w, h, 6, WHITE, BORDER_CLR);
  rrect(doc, x + 2, y + 2, w - 4, 10, 3, ROW_BG, null);
  redDot(doc, x + 8, y + 7.5);
  setF(doc, 8.5, 'normal', DARK_TEXT);
  doc.text('Machine ', x + 13, y + 8.5);
  const tw = doc.getTextWidth('Machine ');
  setF(doc, 8.5, 'bold', BLUE);
  doc.text('Image', x + 13 + tw, y + 8.5);
  const cx = x + 3, cy = y + 14, cw = w - 6, ch = h - 17;
  if (imageData) {
    try {
      doc.addImage(imageData, 'JPEG', cx, cy, cw, ch);
    } catch {
      rrect(doc, cx, cy, cw, ch, 3, [235, 240, 245], BORDER_L);
      setF(doc, 7.5, 'normal', MUTED);
      doc.text('Image error', cx + cw/2, cy + ch/2, { align: 'center' });
    }
  } else {
    rrect(doc, cx, cy, cw, ch, 3, [235, 240, 245], BORDER_L);
  }
}

function descriptionBox(doc, x, y, w, h, text) {
  rrect(doc, x, y, w, h, 6, [240, 246, 251], BORDER_CLR);
  rrect(doc, x + 2, y + 2, w - 4, 10, 3, ROW_BG, null);
  redDot(doc, x + 8, y + 7.5);
  setF(doc, 9, 'bold', BLUE);
  doc.text('Description', x + 13, y + 8.5);
  setF(doc, 8.5, 'normal', BODY_TEXT);
  const lines = doc.splitTextToSize(text || '', w - 10);
  doc.text(lines.slice(0, Math.floor((h - 18) / 6.5)), x + 6, y + 17);
}

function footer(doc, formId) {
  const y = PAGE_H - 8;
  setF(doc, 7, 'normal', MUTED);
  doc.setDrawColor(...BORDER_CLR);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
  doc.text(`ANDRITZ Condition Monitoring System  ·  ${formId}  ·  ${new Date().toLocaleDateString()}`, MARGIN, y);
  setF(doc, 7, 'bold', MUTED);
  doc.text('CONFIDENTIAL', PAGE_W - MARGIN, y, { align: 'right' });
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function drawHeader(doc, title, subtitle, millName) {
  doc.setFillColor(...WHITE);
  doc.rect(0, PAGE_H - PAGE_H, PAGE_W, 38, 'F');

  // Left logo block with rounded rect
  rrect(doc, MARGIN, 4, 55, 30, 5, WHITE, BORDER_CLR);

  // ANDRITZ bold dark blue
  setF(doc, 14, 'bold', DARK_BLUE);
  doc.text('ANDRiTZ', MARGIN + 3, 16);

  // Green leaf dots
  doc.setFillColor(76, 175, 80);
  doc.circle(MARGIN + 3, 24, 3.5, 'F');
  doc.setFillColor(46, 125, 50);
  doc.circle(MARGIN + 9, 27, 3, 'F');

  // Mill name / CLEARWATER PAPER
  setF(doc, 6.5, 'bold', DARK_TEXT);
  const mLines = doc.splitTextToSize(millName.toUpperCase(), 38);
  doc.text(mLines.slice(0,2), MARGIN + 15, 23);

  // Vertical divider
  doc.setDrawColor(...BORDER_CLR);
  doc.setLineWidth(0.8);
  doc.line(MARGIN + 58, 5, MARGIN + 58, 35);

  // Title + subtitle
  setF(doc, 18, 'bold', DARK_BLUE);
  doc.text(title, MARGIN + 63, 17);
  setF(doc, 11, 'bold', BLUE);
  doc.text(subtitle, MARGIN + 63, 27);

  // Bottom border of header
  doc.setDrawColor(...BORDER_CLR);
  doc.setLineWidth(0.5);
  doc.line(0, 40, PAGE_W, 40);
}

// ─── CONDITION MONITORING REPORT ─────────────────────────────────────────────
export function generateConditionMonitorPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `CMR-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  pageSetup(doc);
  drawHeader(doc, 'Condition Monitoring Report', 'Vibration Diagnosis and Recommendation', millName);

  const statusKey = (data.statusCondition || 'alert').toLowerCase();
  const sc = STATUS_COLORS[statusKey] || STATUS_COLORS.alert;

  let y = 43;

  // ── GENERAL INFORMATION SECTION ──────────────────────────────────
  const ROW_H = 11;
  const GAP   = 2.5;
  const HALF  = (CARD_W - GAP) / 2;
  const GEN_H = ROW_H * 4 + GAP * 5 + 8;

  sectionCard(doc, y, GEN_H);
  sideLabel(doc, 'General Information', MARGIN, y, GEN_H);

  let ry = y + 4;

  // Row 1: Location (full width)
  fieldRow(doc, 'Location', data.area || '—', CARD_X, ry, CARD_W, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;

  // Row 2: Asset & ID (left) | Status Condition (right, colored bg)
  fieldRow(doc, 'Asset & ID', (data.assetName || '—') + (data.assetId ? '  —  ' + data.assetId : ''), CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Status Condition', (data.statusCondition ? data.statusCondition.charAt(0).toUpperCase() + data.statusCondition.slice(1) : 'Alert'), CARD_X + HALF + GAP, ry, HALF, ROW_H, sc.bg, 'bold', BLUE);
  ry += ROW_H + GAP;

  // Row 3: Vibration Diagnosis (left) | Temperature (right, white bg — not colored)
  fieldRow(doc, 'Vibration Diagnosis', data.diagnosis || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Temperature', data.temperature ? data.temperature + ' °F' : '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;

  // Row 4: Risk (left) | CMR (center) | Vibration Level (right, same bg as status)
  const THIRD = (CARD_W - GAP * 2) / 3;
  const riskLabel = data.risk === 'low' ? 'Low Risk' : data.risk === 'medium' ? 'Medium Risk' : 'High Risk';
  fieldRow(doc, 'Risk', riskLabel, CARD_X, ry, THIRD, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'CMR', formId, CARD_X + THIRD + GAP, ry, THIRD, ROW_H, ROW_BG, 'bold', DARK_BLUE);
  fieldRow(doc, 'Vibration Level', data.vibrationLevel ? data.vibrationLevel + ' G' : (data.geLevel || '—'), CARD_X + THIRD * 2 + GAP * 2, ry, THIRD, ROW_H, sc.bg, 'bold', BLUE);

  y += GEN_H + 5;

  // ── VIBRATION DIAGNOSIS SECTION ──────────────────────────────────
  const CHART_H = 52;
  const IMG_H   = 60;
  const REC_H   = Math.max(30, (data.recommendation || '').split('\n').length * 7 + 16);
  const FOOT_H  = 14;
  const VIB_H   = CHART_H + IMG_H + REC_H + FOOT_H + 28;

  sectionCard(doc, y, VIB_H);
  sideLabel(doc, 'Vibration Diagnosis and Recommendation', MARGIN, y, VIB_H);

  const HALF_CW = (CARD_W - GAP) / 2;
  let vy = y + 4;

  // Charts row
  chartPlaceholder(doc, CARD_X, vy, HALF_CW, CHART_H, 'Trend', data.diagnosis || 'Trend Analysis', data.trendImage);
  chartPlaceholder(doc, CARD_X + HALF_CW + GAP, vy, HALF_CW, CHART_H, 'Spectrum', 'Frequency Spectrum', data.spectrumImage);
  vy += CHART_H + 4;

  // Image + Description row
  machineImageBox(doc, CARD_X, vy, HALF_CW, IMG_H, data.machineImage);
  descriptionBox(doc, CARD_X + HALF_CW + GAP, vy, HALF_CW, IMG_H, data.observations);
  vy += IMG_H + 5;

  // Recommendation
  rrect(doc, CARD_X, vy, CARD_W, REC_H, 5, WHITE, BORDER_CLR);
  redDot(doc, CARD_X + 6, vy + 7.5);
  setF(doc, 9.5, 'bold', BLUE);
  doc.text('Recommendation', CARD_X + 11, vy + 8.5);

  setF(doc, 8.5, 'normal', BODY_TEXT);
  const recs = (data.recommendation || '').split('\n').filter(r => r.trim());
  let rly = vy + 16;
  recs.slice(0, 6).forEach(line => {
    const wrapped = doc.splitTextToSize(line, CARD_W - 18);
    doc.setFillColor(...[120, 130, 145]);
    doc.circle(CARD_X + 8, rly + 1, 1.3, 'F');
    setF(doc, 8.5, 'normal', BODY_TEXT);
    doc.text(wrapped[0] || '', CARD_X + 12, rly + 1.5);
    if (wrapped[1]) doc.text(wrapped[1], CARD_X + 12, rly + 7);
    rly += (wrapped.length > 1 ? 13 : 7.5);
  });
  vy += REC_H + 5;

  // Footer row inside card — two cells
  const FOOT_HALF = (CARD_W - GAP) / 2;
  rrect(doc, CARD_X, vy, FOOT_HALF, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + 6, vy + FOOT_H / 2 - 0.3);
  setF(doc, 9, 'bold', DARK_TEXT);
  doc.text('Emitted by ', CARD_X + 11, vy + FOOT_H / 2 + 1.2);
  setF(doc, 9, 'bold', BLUE);
  doc.text(data.technicianName || '________________', CARD_X + 11 + doc.getTextWidth('Emitted by '), vy + FOOT_H / 2 + 1.2);

  rrect(doc, CARD_X + FOOT_HALF + GAP, vy, FOOT_HALF, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + FOOT_HALF + GAP + 6, vy + FOOT_H / 2 - 0.3);
  setF(doc, 9, 'bold', DARK_TEXT);
  doc.text('Note Date ', CARD_X + FOOT_HALF + GAP + 11, vy + FOOT_H / 2 + 1.2);
  setF(doc, 9, 'bold', BLUE);
  doc.text(data.date || new Date().toLocaleDateString(), CARD_X + FOOT_HALF + GAP + 11 + doc.getTextWidth('Note Date '), vy + FOOT_H / 2 + 1.2);

  footer(doc, formId);
  doc.save(`${formId}_Condition_Monitor.pdf`);
  return formId;
}

// ─── POST MAINTENANCE ─────────────────────────────────────────────────────────
export function generatePostMaintenancePDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `PMF-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  pageSetup(doc);
  drawHeader(doc, 'Post Maintenance Form', 'Maintenance Record & Post-Check Readings', millName);

  const ROW_H = 11, GAP = 2.5;
  const HALF  = (CARD_W - GAP) / 2;
  let y = 43;

  // General info section
  const GEN_H = ROW_H * 3 + GAP * 4 + 8;
  sectionCard(doc, y, GEN_H);
  sideLabel(doc, 'General Information', MARGIN, y, GEN_H);
  let ry = y + 4;
  fieldRow(doc, 'Maintenance Date', data.maintenanceDate || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Work Order #', data.woNumber || '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', DARK_BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Technician', data.technicianName || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Asset', (data.assetName || '—') + (data.assetId ? ' / ' + data.assetId : ''), CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Area / Location', data.area || '—', CARD_X, ry, CARD_W, ROW_H, ROW_BG, 'bold', BLUE);
  y += GEN_H + 5;

  // Readings section
  const READ_H = ROW_H * 2 + GAP * 3 + 8;
  sectionCard(doc, y, READ_H);
  sideLabel(doc, 'Pre / Post Readings', MARGIN, y, READ_H);
  ry = y + 4;
  fieldRow(doc, 'Vibration Before', data.vibrationBefore ? data.vibrationBefore + ' in/s' : '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Vibration After', data.vibrationAfter ? data.vibrationAfter + ' in/s' : '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Temperature Before', data.tempBefore ? data.tempBefore + ' °F' : '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Temperature After', data.tempAfter ? data.tempAfter + ' °F' : '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  y += READ_H + 5;

  // Details sections
  const details = [
    { label: 'Maintenance Performed', key: 'maintenancePerformed', sideText: 'Maintenance Details' },
    { label: 'Parts / Components Replaced', key: 'partsReplaced', sideText: 'Parts' },
    { label: 'Notes', key: 'notes', sideText: 'Notes' }
  ];
  details.forEach(({ label, key, sideText }) => {
    const text = data[key] || '—';
    const lines = doc.splitTextToSize(text, CARD_W - 16);
    const dh = Math.max(28, lines.length * 6 + 18);
    sectionCard(doc, y, dh);
    sideLabel(doc, sideText, MARGIN, y, dh);
    rrect(doc, CARD_X, y + 3, CARD_W, dh - 6, 5, WHITE, BORDER_L);
    redDot(doc, CARD_X + 6, y + 10);
    setF(doc, 9, 'bold', BLUE);
    doc.text(label, CARD_X + 11, y + 10.5);
    setF(doc, 8.5, 'normal', BODY_TEXT);
    lines.slice(0, Math.floor((dh - 20) / 6)).forEach((l, i) => {
      if (i === 0) doc.circle(CARD_X + 8, y + 18 + i*6.5, 1.3, 'F');
      doc.text(l, CARD_X + 12, y + 18 + i * 6.5);
    });
    y += dh + 5;
  });

  // Footer cells
  const FOOT_H = 14, FOOT_HALF = (CARD_W - GAP) / 2;
  rrect(doc, CARD_X, y, FOOT_HALF, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + 6, y + FOOT_H/2);
  setF(doc, 9, 'bold', DARK_TEXT); doc.text('Completed by ', CARD_X + 11, y + FOOT_H/2 + 1.2);
  setF(doc, 9, 'bold', BLUE); doc.text(data.technicianName || '___________', CARD_X + 11 + doc.getTextWidth('Completed by '), y + FOOT_H/2 + 1.2);
  rrect(doc, CARD_X + FOOT_HALF + GAP, y, FOOT_HALF, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + FOOT_HALF + GAP + 6, y + FOOT_H/2);
  setF(doc, 9, 'bold', DARK_TEXT); doc.text('Date ', CARD_X + FOOT_HALF + GAP + 11, y + FOOT_H/2 + 1.2);
  setF(doc, 9, 'bold', BLUE); doc.text(data.maintenanceDate || '—', CARD_X + FOOT_HALF + GAP + 11 + doc.getTextWidth('Date '), y + FOOT_H/2 + 1.2);

  footer(doc, formId);
  doc.save(`${formId}_Post_Maintenance.pdf`);
  return formId;
}

// ─── RCFA ─────────────────────────────────────────────────────────────────────
export function generateRCFAPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `RCFA-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  pageSetup(doc);
  drawHeader(doc, 'Root Cause Failure Analysis', '5-Whys Methodology & Corrective Actions', millName);

  const ROW_H = 11, GAP = 2.5;
  const HALF = (CARD_W - GAP) / 2;
  let y = 43;

  // General info
  const GEN_H = ROW_H * 3 + GAP * 4 + 8;
  sectionCard(doc, y, GEN_H);
  sideLabel(doc, 'General Information', MARGIN, y, GEN_H);
  let ry = y + 4;
  fieldRow(doc, 'Event Date', data.eventDate || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Work Order #', data.woNumber || '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', DARK_BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Analyst', data.analystName || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Area', data.area || '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Failed Component', data.failedComponent || '—', CARD_X, ry, CARD_W, ROW_H, ROW_BG, 'bold', BLUE);
  y += GEN_H + 5;

  // 5 Whys
  const WHY_H = ROW_H * 5 + GAP * 6 + 16;
  sectionCard(doc, y, WHY_H);
  sideLabel(doc, '5 Whys Analysis', MARGIN, y, WHY_H);
  ry = y + 4;
  [data.why1, data.why2, data.why3, data.why4, data.why5].forEach((why, i) => {
    const bg = i % 2 === 0 ? ROW_BG : WHITE;
    rrect(doc, CARD_X, ry, CARD_W, ROW_H, 4, bg, BORDER_L);
    rrect(doc, CARD_X, ry, 18, ROW_H, 4, DARK_BLUE, null);
    setF(doc, 7.5, 'bold', WHITE);
    doc.text(`WHY ${i+1}`, CARD_X + 9, ry + ROW_H/2 + 1.2, { align: 'center' });
    setF(doc, 9, 'normal', DARK_TEXT);
    doc.text(doc.splitTextToSize(why || '—', CARD_W - 26)[0], CARD_X + 22, ry + ROW_H/2 + 1.2);
    ry += ROW_H + GAP;
  });
  y += WHY_H + 5;

  // Root Cause
  const RC_H = 18;
  sectionCard(doc, y, RC_H + 8);
  sideLabel(doc, 'Root Cause', MARGIN, y, RC_H + 8);
  rrect(doc, CARD_X, y + 4, CARD_W, RC_H, 4, [255, 240, 240], [229, 57, 53]);
  redDot(doc, CARD_X + 6, y + 14);
  setF(doc, 9, 'bold', DARK_TEXT); doc.text('Root Cause: ', CARD_X + 11, y + 14.5);
  setF(doc, 9, 'bold', RED); doc.text(data.rootCause || '—', CARD_X + 11 + doc.getTextWidth('Root Cause: '), y + 14.5);
  y += RC_H + 13;

  // Corrective actions
  const caLines = doc.splitTextToSize(data.correctiveActions || '—', CARD_W - 16);
  const CA_H = Math.max(28, caLines.length * 6.5 + 16);
  sectionCard(doc, y, CA_H + 6);
  sideLabel(doc, 'Corrective Actions', MARGIN, y, CA_H + 6);
  rrect(doc, CARD_X, y + 3, CARD_W, CA_H, 4, WHITE, BORDER_L);
  redDot(doc, CARD_X + 6, y + 11);
  setF(doc, 9, 'bold', BLUE); doc.text('Corrective Actions', CARD_X + 11, y + 11.5);
  setF(doc, 8.5, 'normal', BODY_TEXT);
  caLines.slice(0, 6).forEach((l, i) => {
    doc.setFillColor(...[120,130,145]); doc.circle(CARD_X + 8, y + 19 + i*6.5, 1.2, 'F');
    doc.text(l, CARD_X + 12, y + 19 + i * 6.5);
  });
  y += CA_H + 11;

  // Footer
  const FOOT_H = 14, FH = (CARD_W - GAP) / 2;
  rrect(doc, CARD_X, y, FH, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + 6, y + FOOT_H/2);
  setF(doc, 9, 'bold', DARK_TEXT); doc.text('Analyst: ', CARD_X + 11, y + FOOT_H/2 + 1.2);
  setF(doc, 9, 'bold', BLUE); doc.text(data.analystName || '___________', CARD_X + 11 + doc.getTextWidth('Analyst: '), y + FOOT_H/2 + 1.2);
  rrect(doc, CARD_X + FH + GAP, y, FH, FOOT_H, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + FH + GAP + 6, y + FOOT_H/2);
  setF(doc, 9, 'bold', DARK_TEXT); doc.text('Date: ', CARD_X + FH + GAP + 11, y + FOOT_H/2 + 1.2);
  setF(doc, 9, 'bold', BLUE); doc.text(data.eventDate || '—', CARD_X + FH + GAP + 11 + doc.getTextWidth('Date: '), y + FOOT_H/2 + 1.2);

  footer(doc, formId);
  doc.save(`${formId}_RCFA.pdf`);
  return formId;
}

// ─── SAFETY FORM ─────────────────────────────────────────────────────────────
export function generateSafetyPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `SF-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  pageSetup(doc);
  drawHeader(doc, 'Safety Form', 'Job Safety Analysis & PPE Checklist', millName);

  const ROW_H = 11, GAP = 2.5;
  const HALF = (CARD_W - GAP) / 2;
  let y = 43;

  // General info
  const GEN_H = ROW_H * 3 + GAP * 4 + 8;
  sectionCard(doc, y, GEN_H);
  sideLabel(doc, 'General Information', MARGIN, y, GEN_H);
  let ry = y + 4;
  fieldRow(doc, 'Date', data.date || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Area', data.area || '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Employee', data.employeeName || '—', CARD_X, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  fieldRow(doc, 'Supervisor', data.supervisor || '—', CARD_X + HALF + GAP, ry, HALF, ROW_H, ROW_BG, 'bold', BLUE);
  ry += ROW_H + GAP;
  fieldRow(doc, 'Task', data.taskDescription || '—', CARD_X, ry, CARD_W, ROW_H, ROW_BG, 'bold', BLUE);
  y += GEN_H + 5;

  // PPE Checklist
  const ppeItems = [
    { key: 'hardHat', label: 'Hard Hat' }, { key: 'safetyGlasses', label: 'Safety Glasses' },
    { key: 'steelToeBoots', label: 'Steel Toe Boots' }, { key: 'highVisVest', label: 'High Vis Vest' },
    { key: 'hearingProtection', label: 'Hearing Protection' }, { key: 'gloves', label: 'Gloves' },
    { key: 'fallProtection', label: 'Fall Protection' }, { key: 'faceShield', label: 'Face Shield' }
  ];
  const PPE_H = 52;
  sectionCard(doc, y, PPE_H);
  sideLabel(doc, 'PPE Checklist', MARGIN, y, PPE_H);
  rrect(doc, CARD_X, y + 3, CARD_W, PPE_H - 6, 5, [240, 246, 251], BORDER_L);
  const COLS = 4;
  ppeItems.forEach((item, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const px = CARD_X + 4 + col * (CARD_W / COLS);
    const py = y + 10 + row * 14;
    const checked = data[item.key];
    doc.setFillColor(...(checked ? [46, 139, 87] : [200, 215, 225]));
    doc.roundedRect(px, py - 3, 6, 6, 1, 1, 'F');
    if (checked) { setF(doc, 6, 'bold', WHITE); doc.text('✓', px + 0.8, py + 2.3); }
    setF(doc, 8.5, checked ? 'bold' : 'normal', checked ? [46, 139, 87] : MUTED);
    doc.text(item.label, px + 8, py + 1.5);
  });
  y += PPE_H + 5;

  // Hazards & Controls
  [
    { label: 'Hazards Identified', key: 'hazards', side: 'Hazards' },
    { label: 'Control Measures', key: 'controlMeasures', side: 'Controls' }
  ].forEach(({ label, key, side }) => {
    const lines = doc.splitTextToSize(data[key] || '—', CARD_W - 16);
    const h = Math.max(28, lines.length * 6.5 + 16);
    sectionCard(doc, y, h + 6);
    sideLabel(doc, side, MARGIN, y, h + 6);
    rrect(doc, CARD_X, y + 3, CARD_W, h, 5, WHITE, BORDER_L);
    redDot(doc, CARD_X + 6, y + 11);
    setF(doc, 9, 'bold', BLUE); doc.text(label, CARD_X + 11, y + 11.5);
    setF(doc, 8.5, 'normal', BODY_TEXT);
    lines.slice(0, 5).forEach((l, i) => {
      doc.setFillColor(...[120,130,145]); doc.circle(CARD_X + 8, y + 19 + i * 6.5, 1.2, 'F');
      doc.text(l, CARD_X + 12, y + 19 + i * 6.5);
    });
    y += h + 11;
  });

  // Sign-off
  const SH = 22;
  rrect(doc, CARD_X, y, HALF, SH, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + 6, y + 8); setF(doc, 8, 'bold', MUTED); doc.text('Employee Signature', CARD_X + 11, y + 8.5);
  doc.setDrawColor(...BORDER_CLR); doc.setLineWidth(0.4); doc.line(CARD_X + 6, y + 18, CARD_X + HALF - 4, y + 18);
  setF(doc, 9, 'bold', BLUE); doc.text(data.employeeName || '', CARD_X + 6, y + 17);

  rrect(doc, CARD_X + HALF + GAP, y, HALF, SH, 4, ROW_BG, BORDER_L);
  redDot(doc, CARD_X + HALF + GAP + 6, y + 8); setF(doc, 8, 'bold', MUTED); doc.text('Supervisor Signature', CARD_X + HALF + GAP + 11, y + 8.5);
  doc.setDrawColor(...BORDER_CLR); doc.line(CARD_X + HALF + GAP + 6, y + 18, CARD_X + CARD_W - 4, y + 18);
  setF(doc, 9, 'bold', BLUE); doc.text(data.supervisor || '', CARD_X + HALF + GAP + 6, y + 17);

  footer(doc, formId);
  doc.save(`${formId}_Safety_Form.pdf`);
  return formId;
}