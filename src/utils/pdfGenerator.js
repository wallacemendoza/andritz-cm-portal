import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const BLUE      = [0, 117, 190];
const DARK_BLUE = [0, 58, 112];
const RED       = [228, 0, 43];
const WHITE     = [255, 255, 255];
const LIGHT_BG  = [240, 247, 252];  // very light blue-gray for section bg
const MID_GRAY  = [180, 195, 210];
const DARK_TEXT = [25, 35, 50];
const BODY_TEXT = [55, 70, 90];
const MUTED     = [110, 130, 150];
const ORANGE    = [220, 100, 0];

const PAGE_W = 210;
const MARGIN = 12;
const INNER  = PAGE_W - MARGIN * 2;

// ─── Low-level helpers ────────────────────────────────────────────────────────

function setFont(doc, size, style = 'normal', color = DARK_TEXT) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function rect(doc, x, y, w, h, fillColor, strokeColor) {
  if (fillColor) { doc.setFillColor(...fillColor); }
  if (strokeColor) { doc.setDrawColor(...strokeColor); } else { doc.setDrawColor(255,255,255,0); }
  doc.rect(x, y, w, h, fillColor && strokeColor ? 'FD' : fillColor ? 'F' : 'D');
}

function hLine(doc, x1, x2, y, color = MID_GRAY) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

function redBullet(doc, x, y) {
  doc.setFillColor(...RED);
  doc.circle(x, y - 0.8, 1.2, 'F');
}

// Inline field: ● Label:  Value (colored)
function inlineField(doc, label, value, x, y, valueColor = BLUE, fontSize = 9) {
  redBullet(doc, x, y);
  setFont(doc, fontSize, 'bold', DARK_TEXT);
  doc.text(label + ':', x + 4, y);
  const lw = doc.getTextWidth(label + ': ');
  setFont(doc, fontSize, 'bold', valueColor);
  doc.text(value || '—', x + 4 + lw, y);
}

// Colored status badge (filled rectangle with white text)
function badge(doc, text, x, y, bgColor) {
  setFont(doc, 7.5, 'bold', WHITE);
  const tw = doc.getTextWidth(text);
  rect(doc, x, y - 4, tw + 6, 5.5, bgColor);
  doc.text(text, x + 3, y);
  return tw + 8;
}

function getStatusColor(s) {
  const v = (s || '').toLowerCase();
  if (v.includes('good') || v.includes('normal')) return [46, 139, 87];
  if (v.includes('caution') || v.includes('warning')) return [...ORANGE];
  if (v.includes('alert') || v.includes('critical')) return [...RED];
  return [...DARK_BLUE];
}
function getRiskColor(r) {
  const v = (r || '').toLowerCase();
  if (v.includes('low'))  return [46, 139, 87];
  if (v.includes('med'))  return [...ORANGE];
  return [...RED];
}

// ─── Rotated side label ───────────────────────────────────────────────────────
function sideTab(doc, text, x, y, h, bgColor = DARK_BLUE) {
  rect(doc, x, y, 7, h, bgColor);
  setFont(doc, 7, 'bold', WHITE);
  doc.saveGraphicsState();
  doc.text(text, x + 5, y + h - 3, { angle: 90 });
  doc.restoreGraphicsState();
}

// ─── Section title row ────────────────────────────────────────────────────────
function sectionTitle(doc, text, y, bgColor = DARK_BLUE) {
  rect(doc, MARGIN, y, INNER, 7, bgColor);
  setFont(doc, 9, 'bold', WHITE);
  doc.text(text, MARGIN + 4, y + 5);
  return y + 9;
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function drawHeader(doc, mainTitle, subTitle, millName, formId) {
  // White bg for whole header
  rect(doc, 0, 0, PAGE_W, 38, WHITE);
  hLine(doc, 0, PAGE_W, 38, MID_GRAY);

  // LEFT: ANDRITZ blue block
  rect(doc, 0, 0, 46, 38, DARK_BLUE);

  // ANDRITZ in white bold
  setFont(doc, 15, 'bold', WHITE);
  doc.text('ANDRITZ', 4, 13);

  // Red underline
  doc.setFillColor(...RED);
  doc.rect(4, 15, 36, 1.5, 'F');

  // Mill name below
  setFont(doc, 6.5, 'bold', WHITE);
  const mLines = doc.splitTextToSize(millName.toUpperCase(), 38);
  doc.text(mLines, 4, 21);

  // Vertical divider
  doc.setDrawColor(...MID_GRAY);
  doc.setLineWidth(0.4);
  doc.line(48, 5, 48, 33);

  // RIGHT of divider: Title block
  setFont(doc, 15, 'bold', DARK_BLUE);
  doc.text(mainTitle, 52, 14);

  setFont(doc, 10, 'bold', BLUE);
  doc.text(subTitle, 52, 23);

  // Form ID top-right
  setFont(doc, 7.5, 'normal', MUTED);
  doc.text(formId, PAGE_W - MARGIN, 8, { align: 'right' });
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function drawFooter(doc, formId) {
  const H = doc.internal.pageSize.height;
  hLine(doc, MARGIN, PAGE_W - MARGIN, H - 12, MID_GRAY);
  setFont(doc, 7, 'normal', MUTED);
  doc.text(`ANDRITZ Condition Monitoring  ·  ${formId}  ·  ${new Date().toLocaleString()}`, MARGIN, H - 7);
  setFont(doc, 7, 'bold', MUTED);
  doc.text('CONFIDENTIAL', PAGE_W - MARGIN, H - 7, { align: 'right' });
}

// ─── Simulated chart box ──────────────────────────────────────────────────────
function chartBox(doc, label, value, x, y, w, h, type = 'trend') {
  // Box bg
  rect(doc, x, y, w, h, WHITE, MID_GRAY);

  // Header row in box
  rect(doc, x, y, w, 9, LIGHT_BG);
  redBullet(doc, x + 4, y + 6);
  setFont(doc, 7.5, 'bold', DARK_BLUE);
  doc.text(label + ': ', x + 8, y + 6);
  const lw = doc.getTextWidth(label + ': ');
  setFont(doc, 7.5, 'bold', BLUE);
  doc.text(value || '', x + 8 + lw, y + 6);

  // Chart area
  const cx = x + 4, cy = y + 12, cw = w - 8, ch = h - 16;
  rect(doc, cx, cy, cw, ch, [250, 252, 255], [220, 230, 240]);

  if (type === 'trend') {
    // Horizontal grid lines
    doc.setDrawColor(220, 230, 240); doc.setLineWidth(0.25);
    for (let i = 1; i < 5; i++) doc.line(cx, cy + ch * i/5, cx + cw, cy + ch * i/5);
    // Blue trend line
    doc.setDrawColor(...BLUE); doc.setLineWidth(1);
    const pts = [0,0.5,0.3,0.6,0.4,0.7,0.5,0.3,0.6,0.5,0.7,0.4,0.6,0.3,0.5];
    for (let i = 1; i < pts.length; i++) {
      doc.line(cx + cw*(i-1)/(pts.length-1), cy + ch*(1-pts[i-1]*0.7+0.15),
               cx + cw*i/(pts.length-1),     cy + ch*(1-pts[i]*0.7+0.15));
    }
  } else {
    // Spectrum bars
    doc.setDrawColor(...BLUE); doc.setLineWidth(0.8);
    const heights = [0.2,0.5,0.15,0.9,0.3,0.7,0.2,0.4,0.6,0.25,0.8,0.3];
    heights.forEach((h2, i) => {
      const bx = cx + 3 + i * (cw - 6) / heights.length;
      doc.line(bx, cy + ch, bx, cy + ch*(1-h2*0.85));
    });
  }
  doc.setLineWidth(0.3);
}

// ─── CONDITION MONITOR REPORT ─────────────────────────────────────────────────
export function generateConditionMonitorPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `CMR-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;

  // White page
  rect(doc, 0, 0, PAGE_W, 297, WHITE);
  drawHeader(doc, 'Condition Monitoring Report', 'Vibration Diagnosis and Recommendation', millName, formId);

  let y = 41;

  // ── GENERAL INFORMATION ───────────────────────────────────────────
  const genH = 62;
  sideTab(doc, 'General Information', MARGIN, y, genH);
  rect(doc, MARGIN + 7, y, INNER - 7, genH, LIGHT_BG);

  // Draw thin horizontal dividers inside box
  const bx = MARGIN + 10;  // bullet x
  let gy = y + 10;
  const rowH = 12;

  // Row 1: Location  |  Status Condition (badge)
  inlineField(doc, 'Location', (data.area || '—') + (data.assetId ? ' › ' + data.assetId : ''), bx, gy, BLUE);
  // Status badge right column
  const sc = data.statusCondition || 'Alert';
  setFont(doc, 9, 'bold', DARK_TEXT);
  redBullet(doc, 110, gy);
  doc.text('Status Condition:', 114, gy);
  badge(doc, sc.toUpperCase(), 114 + doc.getTextWidth('Status Condition:  '), gy, getStatusColor(sc));

  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy + 3, [220,230,240]);
  gy += rowH;

  // Row 2: Asset & ID  |  Temperature
  inlineField(doc, 'Asset & ID', (data.assetName || '—') + (data.assetId ? '  —  ' + data.assetId : ''), bx, gy, BLUE);
  inlineField(doc, 'Temperature', data.temperature ? data.temperature + ' °F' : '—', 110, gy, ORANGE);

  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy + 3, [220,230,240]);
  gy += rowH;

  // Row 3: Vibration Diagnosis  |  Vibration Level
  inlineField(doc, 'Vibration Diagnosis', data.diagnosis || '—', bx, gy, BLUE);
  inlineField(doc, 'Vibration Level', data.geLevel || data.vibrationLevel || '—', 110, gy, ORANGE);

  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy + 3, [220,230,240]);
  gy += rowH;

  // Row 4: Risk badge  |  CMR number
  redBullet(doc, bx, gy);
  setFont(doc, 9, 'bold', DARK_TEXT);
  doc.text('Risk:', bx + 4, gy);
  const riskW = doc.getTextWidth('Risk:  ');
  badge(doc, (data.risk || 'HIGH RISK').toUpperCase(), bx + 4 + riskW, gy, getRiskColor(data.risk));

  inlineField(doc, 'CMR', formId, 110, gy, DARK_BLUE);

  y += genH + 4;

  // ── VIBRATION DIAGNOSIS SECTION ──────────────────────────────────
  const diagH = 126;
  sideTab(doc, 'Vibration Diagnosis and Recommendation', MARGIN, y, diagH, BLUE);
  rect(doc, MARGIN + 7, y, INNER - 7, diagH, WHITE);

  // Two chart boxes side by side
  const chartW = (INNER - 7 - 8) / 2;
  chartBox(doc, 'Trend', 'Motor Inboard Envelope', MARGIN + 9, y + 2, chartW, 46, 'trend');
  chartBox(doc, 'Spectrum', 'Frequency Spectrum',  MARGIN + 9 + chartW + 4, y + 2, chartW, 46, 'spectrum');

  let dy = y + 52;

  // Machine image box + Description box side by side
  const boxW = chartW;
  const boxH = 44;

  // Image box
  rect(doc, MARGIN + 9, dy, boxW, boxH, WHITE, MID_GRAY);
  rect(doc, MARGIN + 9, dy, boxW, 9, LIGHT_BG);
  redBullet(doc, MARGIN + 13, dy + 6);
  setFont(doc, 7.5, 'bold', DARK_BLUE);
  doc.text('Machine Image', MARGIN + 17, dy + 6);
  // Grey placeholder
  rect(doc, MARGIN + 13, dy + 12, boxW - 8, boxH - 16, [220, 228, 236]);
  setFont(doc, 7, 'normal', MUTED);
  doc.text('[ Photo Attachment ]', MARGIN + 13 + (boxW-8)/2, dy + 12 + (boxH-16)/2, { align: 'center' });

  // Description box
  const dx2 = MARGIN + 9 + chartW + 4;
  rect(doc, dx2, dy, boxW, boxH, WHITE, MID_GRAY);
  rect(doc, dx2, dy, boxW, 9, LIGHT_BG);
  redBullet(doc, dx2 + 4, dy + 6);
  setFont(doc, 7.5, 'bold', DARK_BLUE);
  doc.text('Description', dx2 + 8, dy + 6);
  setFont(doc, 7.5, 'normal', BODY_TEXT);
  const descLines = doc.splitTextToSize(data.observations || 'No observations recorded.', boxW - 8);
  doc.text(descLines.slice(0, 5), dx2 + 5, dy + 15);

  dy += boxH + 6;

  // Recommendation section
  redBullet(doc, MARGIN + 11, dy);
  setFont(doc, 9, 'bold', DARK_BLUE);
  doc.text('Recommendation', MARGIN + 15, dy);
  dy += 7;

  setFont(doc, 8.5, 'normal', BODY_TEXT);
  const recText = data.recommendation || 'No recommendation provided.';
  const recLines = doc.splitTextToSize(recText, INNER - 16);
  recLines.slice(0, 4).forEach((line, i) => {
    redBullet(doc, MARGIN + 11, dy + i * 6.5);
    doc.text(line, MARGIN + 15, dy + i * 6.5);
  });

  y += diagH + 6;

  // ── SIGNATURE BAR ────────────────────────────────────────────────
  hLine(doc, MARGIN, PAGE_W - MARGIN, y, MID_GRAY);
  y += 7;

  redBullet(doc, MARGIN + 2, y);
  setFont(doc, 9, 'bold', BODY_TEXT);
  doc.text('Emitted by ', MARGIN + 6, y);
  setFont(doc, 9, 'bold', BLUE);
  doc.text(data.technicianName || '________________', MARGIN + 6 + doc.getTextWidth('Emitted by '), y);

  redBullet(doc, 115, y);
  setFont(doc, 9, 'bold', BODY_TEXT);
  doc.text('Note Date ', 119, y);
  setFont(doc, 9, 'bold', BLUE);
  doc.text(data.date || new Date().toLocaleDateString(), 119 + doc.getTextWidth('Note Date '), y);

  drawFooter(doc, formId);
  doc.save(`${formId}_Condition_Monitor.pdf`);
  return formId;
}

// ─── POST MAINTENANCE FORM ────────────────────────────────────────────────────
export function generatePostMaintenancePDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `PMF-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  rect(doc, 0, 0, PAGE_W, 297, WHITE);
  drawHeader(doc, 'Post Maintenance Form', 'Maintenance Record & Post-Check Readings', millName, formId);

  let y = 41;
  const bx = MARGIN + 10;

  // General info
  const genH = 58;
  sideTab(doc, 'General Information', MARGIN, y, genH);
  rect(doc, MARGIN + 7, y, INNER - 7, genH, LIGHT_BG);
  let gy = y + 10;
  inlineField(doc, 'Maintenance Date', data.maintenanceDate || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Work Order #', data.woNumber || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3, [220,230,240]); gy += 12;

  inlineField(doc, 'Technician', data.technicianName || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Asset ID', data.assetId || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3, [220,230,240]); gy += 12;

  inlineField(doc, 'Asset Name', data.assetName || '—', bx, gy, BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3, [220,230,240]); gy += 12;

  inlineField(doc, 'Area / Location', data.area || '—', bx, gy, BLUE);
  y += genH + 6;

  // Readings table
  y = sectionTitle(doc, 'Pre / Post Readings', y);
  doc.autoTable({
    startY: y, head: [['', 'Vibration (in/s)', 'Temperature (°F)']],
    body: [
      ['Before Maintenance', data.vibrationBefore || '—', data.tempBefore || '—'],
      ['After Maintenance',  data.vibrationAfter  || '—', data.tempAfter  || '—']
    ],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9, cellPadding: 4, textColor: [...DARK_TEXT], fillColor: [...WHITE] },
    headStyles: { fillColor: [...DARK_BLUE], textColor: [...WHITE], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [...LIGHT_BG] },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Maintenance performed
  y = sectionTitle(doc, 'Maintenance Performed', y);
  rect(doc, MARGIN, y, INNER, 36, WHITE, MID_GRAY);
  setFont(doc, 8.5, 'normal', BODY_TEXT);
  const mLines = doc.splitTextToSize(data.maintenancePerformed || '—', INNER - 14);
  mLines.slice(0,5).forEach((l,i) => { redBullet(doc, MARGIN+4, y+8+i*6.5); doc.text(l, MARGIN+8, y+8+i*6.5); });
  y += 42;

  y = sectionTitle(doc, 'Parts / Components Replaced', y);
  rect(doc, MARGIN, y, INNER, 28, WHITE, MID_GRAY);
  const pLines = doc.splitTextToSize(data.partsReplaced || 'None', INNER - 14);
  pLines.slice(0,4).forEach((l,i) => { redBullet(doc, MARGIN+4, y+8+i*6.5); doc.text(l, MARGIN+8, y+8+i*6.5); });
  y += 34;

  y = sectionTitle(doc, 'Notes', y);
  rect(doc, MARGIN, y, INNER, 28, WHITE, MID_GRAY);
  const nLines = doc.splitTextToSize(data.notes || '—', INNER - 14);
  doc.text(nLines.slice(0,4), MARGIN + 6, y + 8);
  y += 34;

  hLine(doc, MARGIN, PAGE_W-MARGIN, y, MID_GRAY); y += 7;
  redBullet(doc, MARGIN+2, y);
  setFont(doc, 9, 'bold', BODY_TEXT); doc.text('Completed by ', MARGIN+6, y);
  setFont(doc, 9, 'bold', BLUE); doc.text(data.technicianName || '___________', MARGIN+6+doc.getTextWidth('Completed by '), y);
  redBullet(doc, 115, y);
  setFont(doc, 9, 'bold', BODY_TEXT); doc.text('Date ', 119, y);
  setFont(doc, 9, 'bold', BLUE); doc.text(data.maintenanceDate || '—', 119+doc.getTextWidth('Date '), y);

  drawFooter(doc, formId);
  doc.save(`${formId}_Post_Maintenance.pdf`);
  return formId;
}

// ─── RCFA FORM ────────────────────────────────────────────────────────────────
export function generateRCFAPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `RCFA-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  rect(doc, 0, 0, PAGE_W, 297, WHITE);
  drawHeader(doc, 'Root Cause Failure Analysis', '5-Whys Methodology & Corrective Actions', millName, formId);

  let y = 41;
  const bx = MARGIN + 10;

  // Info section
  const genH = 56;
  sideTab(doc, 'General Information', MARGIN, y, genH);
  rect(doc, MARGIN+7, y, INNER-7, genH, LIGHT_BG);
  let gy = y + 10;
  inlineField(doc, 'Event Date', data.eventDate || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Work Order #', data.woNumber || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3,[220,230,240]); gy += 12;
  inlineField(doc, 'Analyst', data.analystName || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Area', data.area || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3,[220,230,240]); gy += 12;
  inlineField(doc, 'Failed Component', data.failedComponent || '—', bx, gy, BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3,[220,230,240]); gy += 12;
  inlineField(doc, 'Problem', data.problemDescription || '—', bx, gy, BODY_TEXT);
  y += genH + 6;

  y = sectionTitle(doc, '5 Whys Analysis', y);
  const whys = [data.why1, data.why2, data.why3, data.why4, data.why5];
  whys.forEach((why, i) => {
    const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
    rect(doc, MARGIN, y, INNER, 14, bg, [220,230,240]);
    rect(doc, MARGIN, y, 20, 14, DARK_BLUE);
    setFont(doc, 8, 'bold', WHITE);
    doc.text(`WHY ${i+1}`, MARGIN+10, y+9, { align: 'center' });
    setFont(doc, 8.5, 'normal', DARK_TEXT);
    doc.text(doc.splitTextToSize(why || '—', INNER-28)[0] || '—', MARGIN+24, y+9);
    y += 16;
  });

  y += 4;
  y = sectionTitle(doc, 'Root Cause', y);
  rect(doc, MARGIN, y, INNER, 14, [255,240,240], RED);
  inlineField(doc, 'Root Cause', data.rootCause || '—', MARGIN+6, y+9, RED);
  y += 20;

  y = sectionTitle(doc, 'Corrective Actions', y);
  rect(doc, MARGIN, y, INNER, 34, WHITE, MID_GRAY);
  const acLines = doc.splitTextToSize(data.correctiveActions || '—', INNER-14);
  acLines.slice(0,4).forEach((l,i) => { redBullet(doc, MARGIN+4, y+8+i*6.5); doc.text(l, MARGIN+8, y+8+i*6.5); });
  y += 40;

  hLine(doc, MARGIN, PAGE_W-MARGIN, y, MID_GRAY); y += 7;
  redBullet(doc, MARGIN+2, y);
  setFont(doc, 9,'bold',BODY_TEXT); doc.text('Analyst: ', MARGIN+6, y);
  setFont(doc, 9,'bold',BLUE); doc.text(data.analystName||'___________', MARGIN+6+doc.getTextWidth('Analyst: '), y);
  redBullet(doc, 115, y);
  setFont(doc, 9,'bold',BODY_TEXT); doc.text('Date: ', 119, y);
  setFont(doc, 9,'bold',BLUE); doc.text(data.eventDate||'—', 119+doc.getTextWidth('Date: '), y);

  drawFooter(doc, formId);
  doc.save(`${formId}_RCFA.pdf`);
  return formId;
}

// ─── SAFETY FORM ─────────────────────────────────────────────────────────────
export function generateSafetyPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const formId = `SF-${String(Math.floor(Math.random()*999)).padStart(3,'0')}-${new Date().getFullYear()}`;
  rect(doc, 0, 0, PAGE_W, 297, WHITE);
  drawHeader(doc, 'Safety Form', 'Job Safety Analysis & PPE Checklist', millName, formId);

  let y = 41;
  const bx = MARGIN + 10;

  const genH = 46;
  sideTab(doc, 'General Information', MARGIN, y, genH);
  rect(doc, MARGIN+7, y, INNER-7, genH, LIGHT_BG);
  let gy = y + 10;
  inlineField(doc, 'Date', data.date || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Area / Location', data.area || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3,[220,230,240]); gy+=12;
  inlineField(doc, 'Employee', data.employeeName || '—', bx, gy, DARK_BLUE);
  inlineField(doc, 'Supervisor', data.supervisor || '—', 110, gy, DARK_BLUE);
  hLine(doc, MARGIN+8, PAGE_W-MARGIN-1, gy+3,[220,230,240]); gy+=12;
  inlineField(doc, 'Task', data.taskDescription || '—', bx, gy, BLUE);
  y += genH + 6;

  // PPE Checklist
  y = sectionTitle(doc, 'PPE Checklist', y);
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
  rect(doc, MARGIN, y, INNER, 40, LIGHT_BG, MID_GRAY);
  const cols = 4;
  ppeItems.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = MARGIN + 6 + col * (INNER / cols);
    const py = y + 10 + row * 13;
    const checked = data[item.key];
    doc.setFillColor(...(checked ? [46,139,87] : MID_GRAY));
    doc.roundedRect(px, py-4, 5, 5, 1, 1, 'F');
    if (checked) {
      setFont(doc, 6, 'bold', WHITE);
      doc.text('✓', px+0.8, py);
    }
    setFont(doc, 8.5, checked ? 'bold' : 'normal', checked ? [46,139,87] : MUTED);
    doc.text(item.label, px+7, py);
  });
  y += 46;

  y = sectionTitle(doc, 'Hazards Identified', y);
  rect(doc, MARGIN, y, INNER, 30, WHITE, MID_GRAY);
  const hLines2 = doc.splitTextToSize(data.hazards || 'None identified.', INNER-14);
  hLines2.slice(0,4).forEach((l,i) => { redBullet(doc, MARGIN+4, y+8+i*6); setFont(doc,8.5,'normal',BODY_TEXT); doc.text(l, MARGIN+8, y+8+i*6); });
  y += 36;

  y = sectionTitle(doc, 'Control Measures', y);
  rect(doc, MARGIN, y, INNER, 30, WHITE, MID_GRAY);
  const cLines = doc.splitTextToSize(data.controlMeasures || '—', INNER-14);
  cLines.slice(0,4).forEach((l,i) => { redBullet(doc, MARGIN+4, y+8+i*6); setFont(doc,8.5,'normal',BODY_TEXT); doc.text(l, MARGIN+8, y+8+i*6); });
  y += 36;

  y = sectionTitle(doc, 'Sign-off', y); y += 2;
  doc.setDrawColor(...MID_GRAY); doc.setLineWidth(0.3);
  doc.line(MARGIN+4, y+14, MARGIN+90, y+14);
  doc.line(PAGE_W/2+8, y+14, PAGE_W-MARGIN-4, y+14);
  redBullet(doc, MARGIN+4, y+4); setFont(doc,8,'bold',MUTED); doc.text('Employee Signature', MARGIN+8, y+4);
  redBullet(doc, PAGE_W/2+8, y+4); setFont(doc,8,'bold',MUTED); doc.text('Supervisor Signature', PAGE_W/2+12, y+4);
  setFont(doc, 9,'bold',BLUE);
  doc.text(data.employeeName||'', MARGIN+4, y+11);
  doc.text(data.supervisor||'', PAGE_W/2+8, y+11);
  y += 22;

  hLine(doc, MARGIN, PAGE_W-MARGIN, y, MID_GRAY); y+=7;
  redBullet(doc, MARGIN+2, y);
  setFont(doc,9,'bold',BODY_TEXT); doc.text('Date: ', MARGIN+6, y);
  setFont(doc,9,'bold',BLUE); doc.text(data.date||'—', MARGIN+6+doc.getTextWidth('Date: '), y);

  drawFooter(doc, formId);
  doc.save(`${formId}_Safety_Form.pdf`);
  return formId;
}