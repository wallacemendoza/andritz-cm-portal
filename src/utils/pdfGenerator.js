import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── ANDRITZ Brand Colors ──────────────────────────────────────────────────────
const BLUE       = [0, 117, 191];
const DARK_BLUE  = [0, 58, 112];
const RED        = [228, 0, 43];
const GREEN_LEAF = [76, 175, 80];
const DK_GREEN   = [46, 125, 50];
const WHITE      = [255, 255, 255];
const DARK_TEXT  = [40, 50, 65];
const BODY_TEXT  = [70, 85, 105];
const MUTED      = [140, 158, 175];
const PAGE_BG    = [220, 233, 243];
const CARD_BG    = [238, 246, 252];
const ROW_BG     = [232, 243, 251];
const BORDER_MID = [185, 205, 220];
const BORDER_LT  = [210, 225, 235];

// Status condition colors — bg only, text always BLUE
const SC = {
  acceptable: { bg: [230, 247, 232], border: [76, 175, 80] },
  caution:    { bg: [255, 248, 220], border: [230, 180, 0]  },
  alert:      { bg: [253, 232, 232], border: [220, 60, 60]  }
};

const PW = 210, PH = 297;
const ML = 10;               // margin left
const SW = 18;               // side label width
const CX = ML + SW + 3;     // card content x
const CW = PW - CX - ML;    // card content width
const GAP = 2;
const RH = 11;               // standard row height

// ─── Core drawing helpers ─────────────────────────────────────────────────────

function bg(doc) {
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, PW, PH, 'F');
}

function rr(doc, x, y, w, h, r, fill, stroke, sw = 0.4) {
  if (fill)   { doc.setFillColor(...fill); }
  if (stroke) { doc.setDrawColor(...stroke); doc.setLineWidth(sw); }
  else        { doc.setDrawColor(255, 255, 255, 0); doc.setLineWidth(0); }
  const m = fill && stroke ? 'FD' : fill ? 'F' : 'D';
  doc.roundedRect(x, y, w, h, r, r, m);
}

function tx(doc, size, style, color, text, x, y, opts) {
  doc.setFont('helvetica', style || 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(color || DARK_TEXT));
  doc.text(text, x, y, opts || {});
}

function dot(doc, x, y, r = 1.8) {
  doc.setFillColor(...RED);
  doc.circle(x, y, r, 'F');
}

// A single info row: ● Label: Value  (or two half-rows side by side)
function row(doc, label, value, x, y, w, h, fillBg, valueColor) {
  rr(doc, x, y, w, h, 3.5, fillBg || ROW_BG, BORDER_LT);
  dot(doc, x + 5.5, y + h / 2 - 0.2);
  tx(doc, 9, 'bold', DARK_TEXT, label + ':', x + 10, y + h / 2 + 1.5);
  const lw = doc.getTextWidth(label + ': ');
  tx(doc, 9, 'bold', valueColor || BLUE, String(value || '—'), x + 10 + lw, y + h / 2 + 1.5);
}

// Rotated italic side label
function sideLabel(doc, text, x, y, h) {
  doc.saveGraphicsState();
  doc.setFont('helvetica', 'boldoblique');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text(text, x + 4.5, y + h / 2, { angle: 90, align: 'center' });
  doc.restoreGraphicsState();
}

// Section outer rounded card + side label
function section(doc, y, h, labelText) {
  rr(doc, ML, y, PW - ML * 2, h, 7, CARD_BG, BORDER_MID, 0.6);
  sideLabel(doc, labelText, ML, y, h);
}

// ─── LOGO: ANDRITZ + mill name ────────────────────────────────────────────────
function drawLogo(doc, millName) {
  // Logo box with white bg
  rr(doc, ML, 3, 58, 33, 4, WHITE, BORDER_MID, 0.6);

  // "ANDRiTZ" — exact font style
  tx(doc, 16, 'bold', DARK_BLUE, 'ANDRiTZ', ML + 4, 15);

  // Green parallelogram leaf icon (drawn with lines)
  const lx = ML + 4, ly = 22;
  doc.setFillColor(...GREEN_LEAF);
  doc.triangle(lx, ly + 5, lx + 8, ly, lx + 14, ly, 'F');
  doc.setFillColor(...DK_GREEN);
  doc.triangle(lx + 2, ly + 8, lx + 10, ly + 3, lx + 16, ly + 3, 'F');

  // Mill name below leaf
  tx(doc, 6, 'bold', DARK_TEXT, millName.toUpperCase(), ML + 20, ly + 4);
  tx(doc, 5.5, 'normal', MUTED, 'PAPER', ML + 20, ly + 9);
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
function header(doc, title, subtitle, millName) {
  // White header bg
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PW, 40, 'F');
  doc.setDrawColor(...BORDER_MID);
  doc.setLineWidth(0.5);
  doc.line(0, 40, PW, 40);

  drawLogo(doc, millName);

  // Vertical divider
  doc.setDrawColor(...BORDER_MID);
  doc.setLineWidth(0.8);
  doc.line(ML + 61, 5, ML + 61, 37);

  // Title block
  tx(doc, 20, 'bold', DARK_BLUE, title, ML + 65, 18);
  tx(doc, 11, 'bold', BLUE, subtitle, ML + 65, 29);
}

function pageFooter(doc, formId) {
  const fy = PH - 8;
  doc.setDrawColor(...BORDER_MID);
  doc.setLineWidth(0.3);
  doc.line(ML, PH - 13, PW - ML, PH - 13);
  tx(doc, 6.5, 'normal', MUTED,
    `ANDRITZ Condition Monitoring System  ·  ${formId}  ·  ${new Date().toLocaleDateString()}`,
    ML, fy);
  tx(doc, 6.5, 'bold', MUTED, 'CONFIDENTIAL', PW - ML, fy, { align: 'right' });
}

// Chart / image box
function imgBox(doc, label, value, x, y, w, h, imgData) {
  rr(doc, x, y, w, h, 5, WHITE, BORDER_MID, 0.5);
  // header strip
  rr(doc, x + 2, y + 2, w - 4, 9, 3, ROW_BG, null);
  dot(doc, x + 7, y + 6.8);
  tx(doc, 8.5, 'bold', DARK_TEXT, label + ':', x + 12, y + 7.5);
  const lw = doc.getTextWidth(label + ': ');
  tx(doc, 8.5, 'bold', BLUE, value || '', x + 12 + lw, y + 7.5);

  const ix = x + 2, iy = y + 13, iw = w - 4, ih = h - 15;
  if (imgData) {
    try {
      // Detect format from data URL
      const fmt = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(imgData, fmt, ix, iy, iw, ih);
    } catch (e) {
      rr(doc, ix, iy, iw, ih, 3, [240, 245, 250], BORDER_LT);
    }
  }
  // If no image — just empty white box, per user request
}

function descBox(doc, x, y, w, h, text) {
  rr(doc, x, y, w, h, 5, [240, 246, 252], BORDER_MID, 0.5);
  rr(doc, x + 2, y + 2, w - 4, 9, 3, ROW_BG, null);
  dot(doc, x + 7, y + 6.8);
  tx(doc, 9, 'bold', BLUE, 'Description', x + 12, y + 7.5);

  const lines = doc.splitTextToSize(text || '', w - 8);
  let ly = y + 16;
  lines.slice(0, Math.floor((h - 18) / 6)).forEach(l => {
    tx(doc, 8.5, 'normal', BODY_TEXT, l, x + 5, ly);
    ly += 6;
  });
}

// Footer cells: Emitted by / Note Date
function footerCells(doc, y, leftLabel, leftVal, rightLabel, rightVal) {
  const hw = (CW - GAP) / 2;
  rr(doc, CX, y, hw, RH + 1, 3.5, ROW_BG, BORDER_LT);
  dot(doc, CX + 5.5, y + 6);
  tx(doc, 9, 'bold', DARK_TEXT, leftLabel + ' ', CX + 10, y + 7);
  tx(doc, 9, 'bold', BLUE, leftVal || '—', CX + 10 + doc.getTextWidth(leftLabel + '  '), y + 7);

  rr(doc, CX + hw + GAP, y, hw, RH + 1, 3.5, ROW_BG, BORDER_LT);
  dot(doc, CX + hw + GAP + 5.5, y + 6);
  tx(doc, 9, 'bold', DARK_TEXT, rightLabel + ' ', CX + hw + GAP + 10, y + 7);
  tx(doc, 9, 'bold', BLUE, rightVal || '—', CX + hw + GAP + 10 + doc.getTextWidth(rightLabel + '  '), y + 7);
}

// ─── CONDITION MONITORING REPORT ─────────────────────────────────────────────
export function generateConditionMonitorPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const id = `CMR-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  bg(doc);
  header(doc, 'Condition Monitoring Report', 'Vibration Diagnosis and Recommendation', millName);

  const scKey = (data.statusCondition || 'alert').toLowerCase();
  const scColors = SC[scKey] || SC.alert;
  const riskLabel = data.risk === 'low' ? 'Low Risk' : data.risk === 'medium' ? 'Medium Risk' : 'High Risk';

  let y = 43;

  // ── General Information ───────────────────────────────────────────
  const genH = RH * 4 + GAP * 5 + 6;
  section(doc, y, genH, 'General Information');
  let ry = y + 3;

  // Row 1 — Location (full width)
  row(doc, 'Location', data.area || '—', CX, ry, CW, RH, ROW_BG, BLUE);
  ry += RH + GAP;

  // Row 2 — Asset & ID | Status Condition (colored bg)
  const hw = (CW - GAP) / 2;
  row(doc, 'Asset & ID', `${data.assetName || '—'}${data.assetId ? '  —  ' + data.assetId : ''}`, CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Status Condition', (data.statusCondition || 'Alert').charAt(0).toUpperCase() + (data.statusCondition || 'Alert').slice(1), CX + hw + GAP, ry, hw, RH, scColors.bg, BLUE);
  ry += RH + GAP;

  // Row 3 — Vibration Diagnosis | Temperature (white bg — NOT colored)
  row(doc, 'Vibration Diagnosis', data.diagnosis || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Temperature', data.temperature ? `${data.temperature} °F` : '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;

  // Row 4 — Risk | CMR | Vibration Level (same bg as status)
  const tw = (CW - GAP * 2) / 3;
  row(doc, 'Risk', riskLabel, CX, ry, tw, RH, ROW_BG, BLUE);
  row(doc, 'CMR', id, CX + tw + GAP, ry, tw, RH, ROW_BG, DARK_BLUE);
  row(doc, 'Vibration Level', data.vibrationLevel ? `${data.vibrationLevel} G` : (data.geLevel || '—'), CX + tw * 2 + GAP * 2, ry, tw, RH, scColors.bg, BLUE);

  y += genH + 4;

  // ── Vibration Diagnosis & Recommendation ─────────────────────────
  const recLines = (data.recommendation || '').split('\n').filter(r => r.trim());
  const recH = Math.max(22, recLines.length * 7 + 16);
  const chartH = 52, imgH = 60;
  const vibH = chartH + GAP + imgH + GAP + recH + RH + 16;

  section(doc, y, vibH, 'Vibration Diagnosis and Recommendation');
  let vy = y + 3;

  // Charts row
  imgBox(doc, 'Trend', data.diagnosis || 'Trend Analysis', CX, vy, hw, chartH, data.trendImage);
  imgBox(doc, 'Spectrum', 'Frequency Spectrum', CX + hw + GAP, vy, hw, chartH, data.spectrumImage);
  vy += chartH + GAP;

  // Machine image + Description row
  imgBox(doc, 'Machine', 'Image', CX, vy, hw, imgH, data.machineImage);
  descBox(doc, CX + hw + GAP, vy, hw, imgH, data.observations);
  vy += imgH + GAP;

  // Recommendation box
  rr(doc, CX, vy, CW, recH, 4, WHITE, BORDER_LT);
  dot(doc, CX + 5.5, vy + 7);
  tx(doc, 9.5, 'bold', BLUE, 'Recommendation', CX + 10, vy + 8);
  let rly = vy + 16;
  recLines.slice(0, 7).forEach(line => {
    const wrapped = doc.splitTextToSize(line.replace(/^[-•]\s*/, ''), CW - 18);
    doc.setFillColor(...[110, 125, 145]);
    doc.circle(CX + 7, rly + 1, 1.4, 'F');
    tx(doc, 8.5, 'normal', BODY_TEXT, wrapped[0] || '', CX + 11, rly + 2);
    if (wrapped[1]) { tx(doc, 8.5, 'normal', BODY_TEXT, wrapped[1], CX + 11, rly + 8); rly += 6; }
    rly += 8;
  });
  vy += recH + GAP;

  // Footer cells
  footerCells(doc, vy, 'Emitted by', data.technicianName, 'Note Date', data.date || new Date().toLocaleDateString());

  pageFooter(doc, id);
  doc.save(`${id}_Condition_Monitor.pdf`);
  return id;
}

// ─── POST MAINTENANCE ─────────────────────────────────────────────────────────
export function generatePostMaintenancePDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const id = `PMF-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  bg(doc);
  header(doc, 'Post Maintenance Form', 'Maintenance Record & Post-Check Readings', millName);

  let y = 43;
  const hw = (CW - GAP) / 2;

  // General info
  const genH = RH * 3 + GAP * 4 + 6;
  section(doc, y, genH, 'General Information');
  let ry = y + 3;
  row(doc, 'Maintenance Date', data.maintenanceDate || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Work Order #', data.woNumber || '—', CX + hw + GAP, ry, hw, RH, ROW_BG, DARK_BLUE);
  ry += RH + GAP;
  row(doc, 'Technician', data.technicianName || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Asset', `${data.assetName || '—'}${data.assetId ? ' / ' + data.assetId : ''}`, CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Area / Location', data.area || '—', CX, ry, CW, RH, ROW_BG, BLUE);
  y += genH + 4;

  // Readings
  const readH = RH * 2 + GAP * 3 + 6;
  section(doc, y, readH, 'Pre / Post Readings');
  ry = y + 3;
  row(doc, 'Vibration Before', data.vibrationBefore ? `${data.vibrationBefore} in/s` : '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Vibration After', data.vibrationAfter ? `${data.vibrationAfter} in/s` : '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Temperature Before', data.tempBefore ? `${data.tempBefore} °F` : '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Temperature After', data.tempAfter ? `${data.tempAfter} °F` : '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  y += readH + 4;

  // Text sections
  [
    { text: data.maintenancePerformed, label: 'Maintenance Performed', side: 'Work Done' },
    { text: data.partsReplaced, label: 'Parts / Components Replaced', side: 'Parts' },
    { text: data.notes, label: 'Notes', side: 'Notes' }
  ].forEach(({ text, label, side }) => {
    const lines = doc.splitTextToSize(text || '—', CW - 14);
    const bh = Math.max(24, lines.length * 6.5 + 16);
    section(doc, y, bh + 4, side);
    rr(doc, CX, y + 2, CW, bh, 4, WHITE, BORDER_LT);
    dot(doc, CX + 5.5, y + 9);
    tx(doc, 9, 'bold', BLUE, label, CX + 10, y + 9.5);
    lines.slice(0, 6).forEach((l, i) => {
      doc.setFillColor(...[110, 125, 145]);
      if (i === 0) doc.circle(CX + 7, y + 17 + i * 6.5, 1.3, 'F');
      tx(doc, 8.5, 'normal', BODY_TEXT, l, CX + 11, y + 17 + i * 6.5);
    });
    y += bh + 8;
  });

  footerCells(doc, y, 'Completed by', data.technicianName, 'Date', data.maintenanceDate);
  pageFooter(doc, id);
  doc.save(`${id}_Post_Maintenance.pdf`);
  return id;
}

// ─── RCFA ─────────────────────────────────────────────────────────────────────
export function generateRCFAPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const id = `RCFA-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  bg(doc);
  header(doc, 'Root Cause Failure Analysis', '5-Whys Methodology & Corrective Actions', millName);

  let y = 43;
  const hw = (CW - GAP) / 2;

  const genH = RH * 3 + GAP * 4 + 6;
  section(doc, y, genH, 'General Information');
  let ry = y + 3;
  row(doc, 'Event Date', data.eventDate || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Work Order #', data.woNumber || '—', CX + hw + GAP, ry, hw, RH, ROW_BG, DARK_BLUE);
  ry += RH + GAP;
  row(doc, 'Analyst', data.analystName || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Area', data.area || '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Failed Component', data.failedComponent || '—', CX, ry, CW, RH, ROW_BG, BLUE);
  y += genH + 4;

  // 5 Whys
  const whyH = RH * 5 + GAP * 6 + 6;
  section(doc, y, whyH, '5 Whys Analysis');
  ry = y + 3;
  ['why1', 'why2', 'why3', 'why4', 'why5'].forEach((k, i) => {
    rr(doc, CX, ry, CW, RH, 3.5, i % 2 === 0 ? ROW_BG : WHITE, BORDER_LT);
    rr(doc, CX, ry, 16, RH, 3.5, DARK_BLUE, null);
    tx(doc, 7, 'bold', WHITE, `WHY ${i + 1}`, CX + 8, ry + RH / 2 + 1.2, { align: 'center' });
    const ans = doc.splitTextToSize(data[k] || '—', CW - 24);
    tx(doc, 9, 'normal', DARK_TEXT, ans[0] || '—', CX + 20, ry + RH / 2 + 1.2);
    ry += RH + GAP;
  });
  y += whyH + 4;

  // Root Cause
  const rcH = RH + 10;
  section(doc, y, rcH, 'Root Cause');
  rr(doc, CX, y + 2, CW, rcH - 4, 4, [255, 238, 238], [210, 50, 50]);
  dot(doc, CX + 5.5, y + rcH / 2 + 1);
  tx(doc, 9, 'bold', DARK_TEXT, 'Root Cause: ', CX + 10, y + rcH / 2 + 2.5);
  tx(doc, 9, 'bold', RED, data.rootCause || '—', CX + 10 + doc.getTextWidth('Root Cause:  '), y + rcH / 2 + 2.5);
  y += rcH + 4;

  // Corrective actions
  const caLines = doc.splitTextToSize(data.correctiveActions || '—', CW - 14);
  const caH = Math.max(24, caLines.length * 6.5 + 16);
  section(doc, y, caH + 4, 'Actions');
  rr(doc, CX, y + 2, CW, caH, 4, WHITE, BORDER_LT);
  dot(doc, CX + 5.5, y + 9);
  tx(doc, 9, 'bold', BLUE, 'Corrective Actions', CX + 10, y + 9.5);
  caLines.slice(0, 6).forEach((l, i) => {
    doc.setFillColor(...[110, 125, 145]); doc.circle(CX + 7, y + 17 + i * 6.5, 1.3, 'F');
    tx(doc, 8.5, 'normal', BODY_TEXT, l, CX + 11, y + 17 + i * 6.5);
  });
  y += caH + 8;

  footerCells(doc, y, 'Analyst', data.analystName, 'Date', data.eventDate);
  pageFooter(doc, id);
  doc.save(`${id}_RCFA.pdf`);
  return id;
}

// ─── SAFETY FORM ─────────────────────────────────────────────────────────────
export function generateSafetyPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const id = `SF-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  bg(doc);
  header(doc, 'Safety Form', 'Job Safety Analysis & PPE Checklist', millName);

  let y = 43;
  const hw = (CW - GAP) / 2;

  // General info
  const genH = RH * 3 + GAP * 4 + 6;
  section(doc, y, genH, 'General Information');
  let ry = y + 3;
  row(doc, 'Date', data.date || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Area', data.area || '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Employee', data.employeeName || '—', CX, ry, hw, RH, ROW_BG, BLUE);
  row(doc, 'Supervisor', data.supervisor || '—', CX + hw + GAP, ry, hw, RH, ROW_BG, BLUE);
  ry += RH + GAP;
  row(doc, 'Task', data.taskDescription || '—', CX, ry, CW, RH, ROW_BG, BLUE);
  y += genH + 4;

  // PPE Checklist
  const ppeItems = [
    { key: 'hardHat', label: 'Hard Hat' },
    { key: 'safetyGlasses', label: 'Safety Glasses' },
    { key: 'steelToeBoots', label: 'Steel Toe Boots' },
    { key: 'highVisVest', label: 'High Vis Vest' },
    { key: 'hearingProtection', label: 'Hearing Protection' },
    { key: 'gloves', label: 'Gloves' },
    { key: 'fallProtection', label: 'Fall Protection' },
    { key: 'faceShield', label: 'Face Shield' }
  ];
  const ppeH = 46;
  section(doc, y, ppeH, 'PPE Checklist');
  rr(doc, CX, y + 2, CW, ppeH - 4, 4, [238, 246, 252], BORDER_LT);

  const COLS = 4;
  const cellW = CW / COLS;
  ppeItems.forEach((item, i) => {
    const col = i % COLS;
    const rowN = Math.floor(i / COLS);
    const px = CX + col * cellW + 4;
    const py = y + 8 + rowN * 16;
    const checked = !!data[item.key];

    // Checkbox
    if (checked) {
      rr(doc, px, py, 6, 6, 1.5, [46, 139, 87], null);
      tx(doc, 7, 'bold', WHITE, '✓', px + 1.2, py + 4.8);
    } else {
      rr(doc, px, py, 6, 6, 1.5, null, [175, 195, 210], 0.6);
    }

    // Label colored green if checked
    tx(doc, 8.5, checked ? 'bold' : 'normal', checked ? [46, 139, 87] : MUTED, item.label, px + 8, py + 4.8);
  });
  y += ppeH + 4;

  // Hazards + Controls
  [
    { text: data.hazards, label: 'Hazards Identified', side: 'Hazards' },
    { text: data.controlMeasures, label: 'Control Measures', side: 'Controls' }
  ].forEach(({ text, label, side }) => {
    const lines = doc.splitTextToSize(text || '—', CW - 14);
    const bh = Math.max(22, lines.length * 6.5 + 14);
    section(doc, y, bh + 4, side);
    rr(doc, CX, y + 2, CW, bh, 4, WHITE, BORDER_LT);
    dot(doc, CX + 5.5, y + 9);
    tx(doc, 9, 'bold', BLUE, label, CX + 10, y + 9.5);
    lines.slice(0, 5).forEach((l, i) => {
      doc.setFillColor(...[110, 125, 145]); doc.circle(CX + 7, y + 17 + i * 6.5, 1.3, 'F');
      tx(doc, 8.5, 'normal', BODY_TEXT, l, CX + 11, y + 17 + i * 6.5);
    });
    y += bh + 8;
  });

  // Signature boxes
  const sigH = 24;
  rr(doc, CX, y, hw, sigH, 4, ROW_BG, BORDER_LT);
  dot(doc, CX + 5.5, y + 6.5);
  tx(doc, 7.5, 'bold', MUTED, 'Employee Signature', CX + 10, y + 7);
  // Signature line
  doc.setDrawColor(...BORDER_MID); doc.setLineWidth(0.4);
  doc.line(CX + 5, y + sigH - 5, CX + hw - 5, y + sigH - 5);
  tx(doc, 9, 'bold', BLUE, data.employeeName || '', CX + 6, y + sigH - 6.5);

  rr(doc, CX + hw + GAP, y, hw, sigH, 4, ROW_BG, BORDER_LT);
  dot(doc, CX + hw + GAP + 5.5, y + 6.5);
  tx(doc, 7.5, 'bold', MUTED, 'Supervisor Signature', CX + hw + GAP + 10, y + 7);
  doc.setDrawColor(...BORDER_MID);
  doc.line(CX + hw + GAP + 5, y + sigH - 5, CX + CW - 5, y + sigH - 5);
  tx(doc, 9, 'bold', BLUE, data.supervisor || '', CX + hw + GAP + 6, y + sigH - 6.5);

  pageFooter(doc, id);
  doc.save(`${id}_Safety_Form.pdf`);
  return id;
}