import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ANDRITZ Brand Colors
const BLUE       = [0, 117, 190];
const DARK_BLUE  = [0, 58, 112];
const RED        = [228, 0, 43];
const WHITE      = [255, 255, 255];
const LIGHT_GRAY = [245, 247, 250];
const MID_GRAY   = [200, 210, 220];
const DARK_GRAY  = [80, 90, 100];
const BLACK      = [30, 35, 40];
const ORANGE     = [230, 120, 0];

// ─── Helpers ────────────────────────────────────────────────────────────────

function dot(doc, x, y, color) {
  doc.setFillColor(...color);
  doc.circle(x, y, 1.5, 'F');
}

function redDot(doc, x, y) { dot(doc, x, y, RED); }

function boldLabel(doc, text, x, y, color = BLUE) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...color);
  doc.text(text, x, y);
}

function normalText(doc, text, x, y, color = BLACK, size = 9) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(text || '—', x, y);
}

function infoRow(doc, label, value, x, y, valueColor = BLACK) {
  redDot(doc, x, y - 1);
  boldLabel(doc, label + ':', x + 5, y);
  const labelWidth = doc.getTextWidth(label + ': ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...valueColor);
  doc.text(value || '—', x + 5 + labelWidth, y);
}

function sectionBar(doc, text, x, y, w, color = DARK_BLUE) {
  // Vertical left accent
  doc.setFillColor(...color);
  doc.rect(x, y, 3, 7, 'F');
  // Section label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...color);
  doc.text(text, x + 6, y + 5.5);
  return y + 11;
}

function roundedBox(doc, x, y, w, h, color = LIGHT_GRAY) {
  doc.setFillColor(...color);
  doc.setDrawColor(...MID_GRAY);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
}

function statusBadge(doc, text, x, y, color) {
  const w = doc.getTextWidth(text) + 6;
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 4, w, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text(text.toUpperCase(), x + 3, y);
  return x + w + 4;
}

function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'good' || s === 'normal') return [46, 139, 87];
  if (s === 'caution' || s === 'warning') return [230, 120, 0];
  if (s === 'alert' || s === 'critical') return [...RED];
  return [...DARK_BLUE];
}

function getRiskColor(risk) {
  const r = (risk || '').toLowerCase();
  if (r === 'low') return [46, 139, 87];
  if (r === 'medium') return [230, 120, 0];
  if (r === 'high' || r === 'critical') return [...RED];
  return [...DARK_GRAY];
}

// ─── HEADER ─────────────────────────────────────────────────────────────────

function addHeader(doc, title, subtitle, millName, cmrId) {
  const W = 210;

  // White background header box with border bottom
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 36, 'F');
  doc.setDrawColor(...MID_GRAY);
  doc.line(0, 36, W, 36);

  // ANDRITZ logo area — blue box left
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 42, 36, 'F');

  // ANDRITZ text as logo (white)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text('ANDRITZ', 4, 14);

  // Red underline accent
  doc.setFillColor(...RED);
  doc.rect(4, 16, 34, 1.5, 'F');

  // Mill name under logo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  const millLines = doc.splitTextToSize(millName.toUpperCase(), 34);
  doc.text(millLines, 4, 22);

  // Divider between logo and title
  doc.setDrawColor(...MID_GRAY);
  doc.line(44, 4, 44, 32);

  // Report title (right of divider)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...DARK_BLUE);
  doc.text(title, 48, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text(subtitle, 48, 22);

  // CMR id top-right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_GRAY);
  doc.text(cmrId, W - 14, 8, { align: 'right' });
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────

function addFooter(doc, formId) {
  const H = doc.internal.pageSize.height;
  doc.setDrawColor(...MID_GRAY);
  doc.line(14, H - 14, 196, H - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_GRAY);
  doc.text(`ANDRITZ Condition Monitoring  |  ${formId}  |  Generated: ${new Date().toLocaleString()}`, 14, H - 8);
  doc.text('CONFIDENTIAL', 196, H - 8, { align: 'right' });
}

// ─── CONDITION MONITOR REPORT ────────────────────────────────────────────────

export function generateConditionMonitorPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const formId = `CMR-${String(Math.floor(Math.random() * 999)).padStart(3,'0')}-${new Date().getFullYear()}`;

  // White page background
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 297, 'F');

  addHeader(doc, 'Condition Monitoring Report', 'Vibration Diagnosis and Recommendation', millName, formId);

  let y = 42;

  // ── GENERAL INFORMATION SECTION ──────────────────────────────────────────
  // Left vertical label tab
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, y, 8, 68, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_BLUE);
  // Rotated "General Information" text on left tab
  doc.saveGraphicsState();
  doc.text('General Information', 5.5, y + 64, { angle: 90 });
  doc.restoreGraphicsState();

  // Section box
  roundedBox(doc, 10, y, W - 20, 68, LIGHT_GRAY);

  const gx = 16;
  let gy = y + 8;

  // Location row
  infoRow(doc, 'Location', data.area || '—', gx, gy, BLUE);
  gy += 9;

  // Asset & ID
  infoRow(doc, 'Asset & ID', (data.assetName || '—') + (data.assetId ? '  —  ' + data.assetId : ''), gx, gy, BLUE);
  gy += 9;

  // Status Condition - right column
  infoRow(doc, 'Status Condition', '', 110, y + 8, BLACK);
  const sc = data.statusCondition || 'Caution';
  statusBadge(doc, sc, 110 + doc.getTextWidth('Status Condition: ') + 5, y + 9, getStatusColor(sc));

  // Vibration Diagnosis
  infoRow(doc, 'Vibration Diagnosis', data.diagnosis || '—', gx, gy, BLUE);
  // Temperature right
  infoRow(doc, 'Temperature', (data.temperature ? data.temperature + ' °F' : '—'), 110, y + 17, ORANGE);
  gy += 9;

  // Risk
  infoRow(doc, 'Risk', '', gx, gy, BLACK);
  const riskColor = getRiskColor(data.risk);
  statusBadge(doc, (data.risk || 'Medium') + ' Risk', gx + doc.getTextWidth('Risk: ') + 5, gy + 1, riskColor);

  // CMR number right
  infoRow(doc, 'CMR', formId, 110, y + 26, DARK_BLUE);

  // Vibration Level right
  infoRow(doc, 'Vibration Level', (data.geLevel || data.vibrationLevel || '—') , 110, y + 35, ORANGE);

  y += 74;

  // ── VIBRATION DIAGNOSIS SECTION ──────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, y, 8, 130, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_BLUE);
  doc.saveGraphicsState();
  doc.text('Vibration Diagnosis and Recommendation', 5.5, y + 128, { angle: 90 });
  doc.restoreGraphicsState();

  roundedBox(doc, 10, y, W - 20, 130, LIGHT_GRAY);

  // Two chart placeholders side by side
  const chartW = 83;
  const chartH = 42;

  // Trend box
  roundedBox(doc, 14, y + 4, chartW, chartH, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text('Trend: ', 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLUE);
  doc.text(data.trendLabel || 'Vibration Trend', 18 + doc.getTextWidth('Trend: '), y + 12);
  // placeholder lines simulating a trend chart
  doc.setDrawColor(...MID_GRAY);
  for (let i = 0; i < 6; i++) {
    doc.line(18, y + 18 + i * 5, 93, y + 18 + i * 5);
  }
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  doc.lines([[15,3],[15,-4],[15,6],[14,-2],[15,1],[9,-3]], 18, y + 35, [1,1]);
  doc.setLineWidth(0.2);

  // Spectrum box
  roundedBox(doc, 103, y + 4, chartW, chartH, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text('Spectrum: ', 107, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLUE);
  doc.text('Frequency Spectrum', 107 + doc.getTextWidth('Spectrum: '), y + 12);
  doc.setDrawColor(...MID_GRAY);
  for (let i = 0; i < 6; i++) {
    doc.line(107, y + 18 + i * 5, 182, y + 18 + i * 5);
  }
  // Spectrum spikes
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  const spikes = [[112,38],[122,32],[132,40],[142,35],[152,39],[162,33],[172,37]];
  spikes.forEach(([sx, sy]) => {
    doc.line(sx, y + 44, sx, y + sy - y - 4);
  });
  doc.setLineWidth(0.2);

  let dy = y + 52;

  // Machine Image placeholder + Description side by side
  roundedBox(doc, 14, dy, chartW, 44, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text('Machine Image', 18, dy + 8);
  doc.setFillColor(...MID_GRAY);
  doc.rect(18, dy + 12, chartW - 8, 26, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_GRAY);
  doc.text('[ Photo Attachment ]', 18 + (chartW - 8)/2, dy + 27, { align: 'center' });

  // Description box
  roundedBox(doc, 103, dy, chartW, 44, WHITE);
  redDot(doc, 107, dy + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text('Description', 111, dy + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  const descLines = doc.splitTextToSize(data.observations || 'No observations recorded.', chartW - 8);
  doc.text(descLines.slice(0, 5), 107, dy + 16);

  dy += 50;

  // Recommendation
  redDot(doc, 16, dy + 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_BLUE);
  doc.text('Recommendation', 21, dy + 1.5);
  dy += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  const recText = data.recommendation || 'No recommendation provided.';
  const recLines = doc.splitTextToSize(recText, W - 36);
  recLines.forEach((line, i) => {
    redDot(doc, 17, dy + i * 6);
    doc.text(line, 22, dy + i * 6);
  });

  y += 136;

  // ── SIGNATURE / FOOTER INFO ────────────────────────────────────────────────
  doc.setDrawColor(...MID_GRAY);
  doc.line(14, y, W - 14, y);
  y += 6;

  redDot(doc, 16, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_GRAY);
  doc.text('Emitted by ', 21, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.text(data.technicianName || '________________', 21 + doc.getTextWidth('Emitted by '), y);

  redDot(doc, 116, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_GRAY);
  doc.text('Note Date ', 121, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.text(data.date || new Date().toLocaleDateString(), 121 + doc.getTextWidth('Note Date '), y);

  addFooter(doc, formId);
  doc.save(`${formId}_Condition_Monitor.pdf`);
  return formId;
}

// ─── POST MAINTENANCE FORM ───────────────────────────────────────────────────

export function generatePostMaintenancePDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const formId = `PMF-${String(Math.floor(Math.random() * 999)).padStart(3,'0')}-${new Date().getFullYear()}`;

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 297, 'F');
  addHeader(doc, 'Post Maintenance Form', 'Maintenance Record & Post-Check Readings', millName, formId);

  let y = 44;

  // General info section
  roundedBox(doc, 10, y, W - 20, 60, LIGHT_GRAY);
  let gy = y + 8;
  infoRow(doc, 'Maintenance Date', data.maintenanceDate || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Work Order #', data.woNumber || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Technician', data.technicianName || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Asset ID', data.assetId || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Asset Name', data.assetName || '—', 16, gy, BLUE);
  gy += 9;
  infoRow(doc, 'Area / Location', data.area || '—', 16, gy, BLUE);
  y += 66;

  // Readings comparison
  sectionBar(doc, 'Pre / Post Readings', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 28, LIGHT_GRAY);

  const cols = ['', 'Vibration (in/s)', 'Temperature (°F)'];
  const rows = [
    ['Before Maintenance', data.vibrationBefore || '—', data.tempBefore || '—'],
    ['After Maintenance',  data.vibrationAfter  || '—', data.tempAfter  || '—'],
  ];
  doc.autoTable({
    startY: y + 2,
    head: [cols],
    body: rows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3, textColor: [...BLACK], fillColor: [...WHITE] },
    headStyles: { fillColor: [...DARK_BLUE], textColor: [...WHITE], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [235, 240, 248] },
    tableWidth: W - 28
  });
  y = doc.lastAutoTable.finalY + 8;

  // Maintenance performed
  sectionBar(doc, 'Maintenance Performed', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 40, WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  const mLines = doc.splitTextToSize(data.maintenancePerformed || '—', W - 32);
  mLines.slice(0, 6).forEach((l, i) => { redDot(doc, 16, y + 8 + i*6); doc.text(l, 21, y + 8 + i*6); });
  y += 46;

  // Parts replaced
  sectionBar(doc, 'Parts / Components Replaced', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 28, WHITE);
  const pLines = doc.splitTextToSize(data.partsReplaced || 'None', W - 32);
  pLines.slice(0,4).forEach((l, i) => { redDot(doc, 16, y + 8 + i*6); doc.text(l, 21, y + 8 + i*6); });
  y += 34;

  // Notes
  sectionBar(doc, 'Result & Notes', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 28, WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  const nLines = doc.splitTextToSize(data.notes || '—', W - 32);
  doc.text(nLines.slice(0, 4), 16, y + 8);
  y += 34;

  // Signature
  doc.setDrawColor(...MID_GRAY);
  doc.line(14, y, W - 14, y);
  y += 6;
  redDot(doc, 16, y); boldLabel(doc, 'Completed by: ', 21, y, DARK_GRAY);
  doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
  doc.text(data.technicianName || '________________', 21 + doc.getTextWidth('Completed by: '), y);
  redDot(doc, 116, y); boldLabel(doc, 'Date: ', 121, y, DARK_GRAY);
  doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
  doc.text(data.maintenanceDate || '—', 121 + doc.getTextWidth('Date: '), y);

  addFooter(doc, formId);
  doc.save(`${formId}_Post_Maintenance.pdf`);
  return formId;
}

// ─── RCFA FORM ───────────────────────────────────────────────────────────────

export function generateRCFAPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const formId = `RCFA-${String(Math.floor(Math.random() * 999)).padStart(3,'0')}-${new Date().getFullYear()}`;

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 297, 'F');
  addHeader(doc, 'Root Cause Failure Analysis', '5-Whys Methodology & Corrective Actions', millName, formId);

  let y = 44;

  roundedBox(doc, 10, y, W - 20, 52, LIGHT_GRAY);
  let gy = y + 8;
  infoRow(doc, 'Event Date', data.eventDate || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Work Order #', data.woNumber || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Analyst', data.analystName || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Area', data.area || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Failed Component', data.failedComponent || '—', 16, gy, BLUE);
  infoRow(doc, 'Asset ID', data.assetId || '—', 110, gy, BLUE);
  gy += 9;
  infoRow(doc, 'Problem Description', data.problemDescription || '—', 16, gy, BLACK);
  y += 58;

  sectionBar(doc, '5 Whys Analysis', 14, y, W - 28);
  y += 2;

  const whys = [data.why1, data.why2, data.why3, data.why4, data.why5];
  whys.forEach((why, i) => {
    roundedBox(doc, 10, y, W - 20, 16, i % 2 === 0 ? LIGHT_GRAY : WHITE);
    doc.setFillColor(...BLUE);
    doc.roundedRect(10, y, 22, 16, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(`WHY ${i + 1}`, 21, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BLACK);
    const wLines = doc.splitTextToSize(why || '—', W - 46);
    doc.text(wLines[0] || '—', 36, y + 10);
    y += 18;
  });

  y += 4;
  sectionBar(doc, 'Root Cause & Corrective Actions', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 16, LIGHT_GRAY);
  infoRow(doc, 'Root Cause', data.rootCause || '—', 16, y + 10, RED);
  y += 22;

  roundedBox(doc, 10, y, W - 20, 36, WHITE);
  const acLines = doc.splitTextToSize(data.correctiveActions || '—', W - 32);
  acLines.slice(0, 5).forEach((l, i) => { redDot(doc, 16, y + 8 + i*6); doc.text(l, 21, y + 8 + i*6); });
  y += 42;

  doc.setDrawColor(...MID_GRAY);
  doc.line(14, y, W - 14, y);
  y += 6;
  redDot(doc, 16, y); boldLabel(doc, 'Analyst: ', 21, y, DARK_GRAY);
  doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
  doc.text(data.analystName || '________________', 21 + doc.getTextWidth('Analyst: '), y);
  redDot(doc, 116, y); boldLabel(doc, 'Date: ', 121, y, DARK_GRAY);
  doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
  doc.text(data.eventDate || '—', 121 + doc.getTextWidth('Date: '), y);

  addFooter(doc, formId);
  doc.save(`${formId}_RCFA.pdf`);
  return formId;
}

// ─── SAFETY FORM ─────────────────────────────────────────────────────────────

export function generateSafetyPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const formId = `SF-${String(Math.floor(Math.random() * 999)).padStart(3,'0')}-${new Date().getFullYear()}`;

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 297, 'F');
  addHeader(doc, 'Safety Form', 'Job Safety Analysis & PPE Checklist', millName, formId);

  let y = 44;

  roundedBox(doc, 10, y, W - 20, 44, LIGHT_GRAY);
  let gy = y + 8;
  infoRow(doc, 'Date', data.date || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Area / Location', data.area || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Employee', data.employeeName || '—', 16, gy, DARK_BLUE);
  infoRow(doc, 'Supervisor', data.supervisor || '—', 110, gy, DARK_BLUE);
  gy += 9;
  infoRow(doc, 'Task Description', data.taskDescription || '—', 16, gy, BLUE);
  y += 50;

  sectionBar(doc, 'PPE Checklist', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 44, LIGHT_GRAY);

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

  const cols = 4;
  ppeItems.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = 16 + col * 47;
    const py = y + 10 + row * 14;
    const checked = data[item.key];
    doc.setFillColor(...(checked ? [46,139,87] : MID_GRAY));
    doc.roundedRect(px, py - 4, 5, 5, 1, 1, 'F');
    if (checked) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...WHITE);
      doc.text('✓', px + 0.8, py);
    }
    doc.setFont('helvetica', checked ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...(checked ? [46,139,87] : DARK_GRAY));
    doc.text(item.label, px + 7, py);
  });
  y += 50;

  sectionBar(doc, 'Hazards Identified', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 32, WHITE);
  const hLines = doc.splitTextToSize(data.hazards || 'None identified.', W - 32);
  hLines.slice(0,4).forEach((l, i) => { redDot(doc, 16, y + 8 + i*6); doc.text(l, 21, y + 8 + i*6); });
  y += 38;

  sectionBar(doc, 'Control Measures', 14, y, W - 28);
  y += 2;
  roundedBox(doc, 10, y, W - 20, 32, WHITE);
  const cLines = doc.splitTextToSize(data.controlMeasures || '—', W - 32);
  cLines.slice(0,4).forEach((l, i) => { redDot(doc, 16, y + 8 + i*6); doc.text(l, 21, y + 8 + i*6); });
  y += 38;

  // Signatures
  sectionBar(doc, 'Sign-off', 14, y, W - 28);
  y += 4;
  doc.setDrawColor(...MID_GRAY);
  doc.line(16, y + 14, 90, y + 14);
  doc.line(110, y + 14, 184, y + 14);
  redDot(doc, 16, y + 2); boldLabel(doc, 'Employee Signature', 21, y + 2, DARK_GRAY);
  redDot(doc, 110, y + 2); boldLabel(doc, 'Supervisor Signature', 115, y + 2, DARK_GRAY);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...BLUE);
  doc.text(data.employeeName || '', 16, y + 11);
  doc.text(data.supervisor || '', 110, y + 11);
  y += 20;

  doc.setDrawColor(...MID_GRAY);
  doc.line(14, y, W - 14, y);
  y += 6;
  redDot(doc, 16, y);
  boldLabel(doc, 'Date: ', 21, y, DARK_GRAY);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE);
  doc.text(data.date || '—', 21 + doc.getTextWidth('Date: '), y);

  addFooter(doc, formId);
  doc.save(`${formId}_Safety_Form.pdf`);
  return formId;
}