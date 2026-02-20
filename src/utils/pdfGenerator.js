import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ANDRITZ_ORANGE = [255, 107, 53];
const ANDRITZ_DARK = [2, 4, 8];
const ANDRITZ_GRAY = [30, 40, 55];
const TEXT_LIGHT = [232, 244, 253];
const TEXT_DIM = [140, 160, 180];

function addHeader(doc, title, subtitle, millName) {
  // Dark header bar
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setFillColor(...ANDRITZ_ORANGE);
  doc.rect(0, 30, 210, 2, 'F');

  // ANDRITZ title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ANDRITZ', 14, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DIM);
  doc.text('CONDITION MONITORING', 14, 19);
  doc.text(millName.toUpperCase(), 14, 24);

  // Form title right
  doc.setTextColor(...ANDRITZ_ORANGE);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleX = 210 - 14 - doc.getTextWidth(title);
  doc.text(title, titleX, 14);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_DIM);
    const subX = 210 - 14 - doc.getTextWidth(subtitle);
    doc.text(subtitle, subX, 22);
  }
}

function addFooter(doc, pageNum, formId) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, pageHeight - 14, 210, 14, 'F');
  doc.setFillColor(...ANDRITZ_ORANGE);
  doc.rect(0, pageHeight - 14, 210, 1, 'F');
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`ANDRITZ Condition Monitoring | ${formId} | Generated: ${new Date().toLocaleString()}`, 14, pageHeight - 5);
  doc.text(`Page ${pageNum}`, 196, pageHeight - 5, { align: 'right' });
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(...ANDRITZ_GRAY);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFillColor(...ANDRITZ_ORANGE);
  doc.rect(14, y, 3, 8, 'F');
  doc.setTextColor(...ANDRITZ_ORANGE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text.toUpperCase(), 20, y + 5.5);
  return y + 14;
}

function field(doc, label, value, x, y, width = 85) {
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label.toUpperCase(), x, y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(value || '—', x, y + 5);
  doc.setDrawColor(30, 40, 55);
  doc.line(x, y + 7, x + width, y + 7);
  return y + 14;
}

export function generateConditionMonitorPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, 0, 210, 297, 'F');

  const formId = `CMR-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  addHeader(doc, 'CONDITION MONITOR FORM', formId, millName);
  let y = 40;

  y = sectionTitle(doc, 'General Information', y);
  field(doc, 'Mill / Location', millName, 14, y, 85);
  field(doc, 'Date', data.date, 110, y, 85);
  y += 16;
  field(doc, 'Technician Name', data.technicianName, 14, y, 85);
  field(doc, 'Work Order #', data.woNumber, 110, y, 85);
  y += 16;
  field(doc, 'Area', data.area, 14, y, 85);
  field(doc, 'Asset ID', data.assetId, 110, y, 85);
  y += 16;
  field(doc, 'Asset Name', data.assetName, 14, y, 180);
  y += 16;

  y = sectionTitle(doc, 'Vibration Analysis', y);
  field(doc, 'Overall Vibration Level', data.vibrationLevel, 14, y, 55);
  field(doc, 'gE Level', data.geLevel, 75, y, 55);
  field(doc, 'Temperature (°F)', data.temperature, 136, y, 58);
  y += 16;
  field(doc, 'Vibration Diagnosis', data.diagnosis, 14, y, 180);
  y += 16;
  field(doc, 'Risk Level', data.risk?.toUpperCase(), 14, y, 85);
  field(doc, 'Status Condition', data.statusCondition, 110, y, 85);
  y += 16;

  y = sectionTitle(doc, 'Observations', y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(data.observations || 'No observations recorded.', 178);
  doc.text(lines, 14, y);
  y += lines.length * 5 + 10;

  y = sectionTitle(doc, 'Recommendation', y);
  const recLines = doc.splitTextToSize(data.recommendation || 'No recommendation provided.', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(recLines, 14, y);
  y += recLines.length * 5 + 10;

  y = sectionTitle(doc, 'Signature', y);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(8);
  doc.text('EMITTED BY:', 14, y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(11);
  doc.text(data.technicianName || '________________', 14, y + 6);
  doc.line(14, y + 9, 100, y + 9);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(7);
  doc.text('Signature / Name', 14, y + 13);

  addFooter(doc, 1, formId);
  doc.save(`${formId}_Condition_Monitor.pdf`);
  return formId;
}

export function generatePostMaintenancePDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, 0, 210, 297, 'F');

  const formId = `PMF-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  addHeader(doc, 'POST MAINTENANCE FORM', formId, millName);
  let y = 40;

  y = sectionTitle(doc, 'Maintenance Information', y);
  field(doc, 'Mill / Location', millName, 14, y);
  field(doc, 'Date of Maintenance', data.maintenanceDate, 110, y);
  y += 16;
  field(doc, 'Technician Name', data.technicianName, 14, y);
  field(doc, 'Work Order #', data.woNumber, 110, y);
  y += 16;
  field(doc, 'Asset Name', data.assetName, 14, y, 180);
  y += 16;
  field(doc, 'Asset ID', data.assetId, 14, y);
  field(doc, 'Area / Location', data.area, 110, y);
  y += 16;

  y = sectionTitle(doc, 'Maintenance Performed', y);
  const maintLines = doc.splitTextToSize(data.maintenancePerformed || '—', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(maintLines, 14, y);
  y += maintLines.length * 5 + 10;

  y = sectionTitle(doc, 'Post-Maintenance Readings', y);
  field(doc, 'Vibration Level (Before)', data.vibrationBefore, 14, y);
  field(doc, 'Vibration Level (After)', data.vibrationAfter, 110, y);
  y += 16;
  field(doc, 'Temperature (Before °F)', data.tempBefore, 14, y);
  field(doc, 'Temperature (After °F)', data.tempAfter, 110, y);
  y += 16;

  y = sectionTitle(doc, 'Parts Replaced', y);
  const partsLines = doc.splitTextToSize(data.partsReplaced || 'None', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(partsLines, 14, y);
  y += partsLines.length * 5 + 10;

  y = sectionTitle(doc, 'Result & Notes', y);
  const notesLines = doc.splitTextToSize(data.notes || '—', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(notesLines, 14, y);
  y += notesLines.length * 5 + 10;

  y = sectionTitle(doc, 'Signature', y);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(8);
  doc.text('COMPLETED BY:', 14, y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(11);
  doc.text(data.technicianName || '________________', 14, y + 6);
  doc.line(14, y + 9, 100, y + 9);

  addFooter(doc, 1, formId);
  doc.save(`${formId}_Post_Maintenance.pdf`);
  return formId;
}

export function generateRCFAPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, 0, 210, 297, 'F');

  const formId = `RCFA-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  addHeader(doc, 'ROOT CAUSE FAILURE ANALYSIS', formId, millName);
  let y = 40;

  y = sectionTitle(doc, 'Event Information', y);
  field(doc, 'Mill / Location', millName, 14, y);
  field(doc, 'Event Date', data.eventDate, 110, y);
  y += 16;
  field(doc, 'Analyst Name', data.analystName, 14, y);
  field(doc, 'Work Order #', data.woNumber, 110, y);
  y += 16;
  field(doc, 'Failed Component', data.failedComponent, 14, y, 180);
  y += 16;
  field(doc, 'Asset ID', data.assetId, 14, y);
  field(doc, 'Area', data.area, 110, y);
  y += 16;

  y = sectionTitle(doc, 'Problem Description', y);
  const probLines = doc.splitTextToSize(data.problemDescription || '—', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(probLines, 14, y);
  y += probLines.length * 5 + 10;

  // 5 Whys
  y = sectionTitle(doc, '5 Whys Analysis', y);
  const whys = [data.why1, data.why2, data.why3, data.why4, data.why5];
  whys.forEach((why, i) => {
    if (y > 260) { doc.addPage(); doc.setFillColor(...ANDRITZ_DARK); doc.rect(0,0,210,297,'F'); y = 20; }
    doc.setFillColor(15, 20, 30);
    doc.rect(14, y - 3, 178, 12, 'F');
    doc.setTextColor(...ANDRITZ_ORANGE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`WHY ${i + 1}:`, 18, y + 4);
    doc.setTextColor(...TEXT_LIGHT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(why || '—', 38, y + 4);
    y += 14;
  });

  y += 4;
  y = sectionTitle(doc, 'Root Cause & Corrective Actions', y);
  field(doc, 'Root Cause', data.rootCause, 14, y, 180);
  y += 16;
  const actLines = doc.splitTextToSize(data.correctiveActions || '—', 178);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(7);
  doc.text('CORRECTIVE ACTIONS:', 14, y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(actLines, 14, y + 5);
  y += actLines.length * 5 + 14;

  y = sectionTitle(doc, 'Signature', y);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(8);
  doc.text('ANALYST:', 14, y);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(11);
  doc.text(data.analystName || '________________', 14, y + 6);
  doc.line(14, y + 9, 100, y + 9);

  addFooter(doc, 1, formId);
  doc.save(`${formId}_RCFA.pdf`);
  return formId;
}

export function generateSafetyPDF(data, millName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFillColor(...ANDRITZ_DARK);
  doc.rect(0, 0, 210, 297, 'F');

  const formId = `SF-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${new Date().getFullYear()}`;
  addHeader(doc, 'SAFETY FORM', formId, millName);
  let y = 40;

  y = sectionTitle(doc, 'Job / Task Information', y);
  field(doc, 'Mill / Location', millName, 14, y);
  field(doc, 'Date', data.date, 110, y);
  y += 16;
  field(doc, 'Employee Name', data.employeeName, 14, y);
  field(doc, 'Supervisor', data.supervisor, 110, y);
  y += 16;
  field(doc, 'Task / Job Description', data.taskDescription, 14, y, 180);
  y += 16;
  field(doc, 'Area / Location', data.area, 14, y, 180);
  y += 16;

  y = sectionTitle(doc, 'PPE Checklist', y);
  const ppeItems = [
    { label: 'Hard Hat', checked: data.hardHat },
    { label: 'Safety Glasses', checked: data.safetyGlasses },
    { label: 'Steel Toe Boots', checked: data.steelToeBoots },
    { label: 'High Vis Vest', checked: data.highVisVest },
    { label: 'Hearing Protection', checked: data.hearingProtection },
    { label: 'Gloves', checked: data.gloves },
    { label: 'Fall Protection', checked: data.fallProtection },
    { label: 'Face Shield', checked: data.faceShield }
  ];
  const colW = 90;
  ppeItems.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const px = 14 + col * colW;
    const py = y + row * 10;
    doc.setFillColor(item.checked ? 0 : 20, item.checked ? 255 : 30, item.checked ? 136 : 50);
    doc.circle(px + 3, py + 3, 3, 'F');
    doc.setTextColor(item.checked ? ...ANDRITZ_ORANGE : ...TEXT_DIM);
    doc.setFontSize(9);
    doc.text(item.label, px + 9, py + 4.5);
  });
  y += Math.ceil(ppeItems.length / 2) * 10 + 10;

  y = sectionTitle(doc, 'Hazard Identification', y);
  const hazLines = doc.splitTextToSize(data.hazards || 'None identified.', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(hazLines, 14, y);
  y += hazLines.length * 5 + 10;

  y = sectionTitle(doc, 'Control Measures', y);
  const ctrlLines = doc.splitTextToSize(data.controlMeasures || '—', 178);
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text(ctrlLines, 14, y);
  y += ctrlLines.length * 5 + 10;

  y = sectionTitle(doc, 'Sign-off', y);
  doc.setTextColor(...TEXT_DIM);
  doc.setFontSize(8);
  doc.text('EMPLOYEE SIGNATURE:', 14, y);
  doc.line(14, y + 9, 90, y + 9);
  doc.text('SUPERVISOR SIGNATURE:', 110, y);
  doc.line(110, y + 9, 196, y + 9);

  addFooter(doc, 1, formId);
  doc.save(`${formId}_Safety_Form.pdf`);
  return formId;
}
