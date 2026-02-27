import jsPDF from 'jspdf';

// ─── Page layout (mm) ────────────────────────────────────────────────────────
const PW = 210, PH = 297;
const ML = 10, MR = 10;
const TAB = 9;        // side tab width
const CX = ML + TAB + 2;
const CCW = PW - CX - MR;

// ─── Palette (matches reference exactly) ─────────────────────────────────────
const C = {
  bg:      [213, 230, 240],   // #D5E6F0 page background
  white:   [255, 255, 255],
  navy:    [0,   58,  112],   // #003A70
  blue:    [0,   117, 191],   // #0075BF
  blueLt:  [232, 242, 250],   // card header tint
  txt:     [26,  43,  60],    // near-black body text
  muted:   [90,  122, 154],
  bdr:     [184, 206, 220],   // card border
  shad:    [192, 212, 223],   // card shadow
  rdot:    [229, 57,  53],    // red bullet dot
  rtxt:    [198, 40,  40],
  rbg:     [253, 236, 234],   // alert red bg
  sideTab: [0,   43,  96],    // side tab navy
};

// ─── Drawing primitives ───────────────────────────────────────────────────────
const setFill   = (d, [r,g,b]) => d.setFillColor(r,g,b);
const setStroke = (d, [r,g,b]) => d.setDrawColor(r,g,b);

const rr = (d, x, y, w, h, {r=3, fill=null, stroke=null, lw=0.5}={}) => {
  if (lw)     d.setLineWidth(lw);
  if (fill)   setFill(d, fill);
  if (stroke) setStroke(d, stroke);
  const style = (fill && stroke) ? 'FD' : fill ? 'F' : 'S';
  d.roundedRect(x, y, w, h, r, r, style);
};

const card = (d, x, y, w, h, r=3) => {
  rr(d, x+0.6, y+0.6, w, h, {r, fill:C.shad});          // shadow
  rr(d, x, y, w, h, {r, fill:C.white, stroke:C.bdr, lw:0.4}); // card
};

const dot = (d, x, y, r=1.8, col=null) => {
  setFill(d, col || C.rdot);
  d.circle(x, y, r, 'F');
};

const tx = (d, s, x, y, {sz=9, bold=false, col=null, align='left'}={}) => {
  d.setFont('helvetica', bold ? 'bold' : 'normal');
  d.setFontSize(sz);
  setFill(d, col || C.txt);
  const fn = align === 'right'  ? (x,y,s) => d.text(s, x, y, {align:'right'})
           : align === 'center' ? (x,y,s) => d.text(s, x, y, {align:'center'})
           : (x,y,s) => d.text(s, x, y);
  fn(x, y, String(s ?? ''));
};

// ─── Card header strip ────────────────────────────────────────────────────────
const cardHdr = (d, x, y, w, h=9, plain='', bold='') => {
  rr(d, x, y, w, h, {r:3, fill:C.blueLt});
  d.setDrawColor(...C.bdr); d.setLineWidth(0.3);
  d.line(x, y+h, x+w, y+h);
  const cy = y + h/2;
  dot(d, x+5, cy, 1.8);
  tx(d, plain, x+10, cy+1, {sz:8.5, col:C.txt});
  const off = d.getStringUnitWidth(plain + (plain?' ':'')) * 8.5 / d.internal.scaleFactor;
  tx(d, bold, x+10+off, cy+1, {sz:8.5, bold:true, col:C.blue});
};

// ─── Info row (white card + red dot + label: value) ──────────────────────────
const infoRow = (d, x, y, w, label, value, {h=10, bg=null, vc=null}={}) => {
  card(d, x, y, w, h);
  if (bg) rr(d, x, y, w, h, {r:3, fill:bg, stroke:C.bdr, lw:0.4});
  const cy = y + h/2;
  dot(d, x+5, cy, 1.8);
  tx(d, label, x+10, cy+1, {sz:9, col:C.txt});
  const off = d.getStringUnitWidth(label+' ') * 9 / d.internal.scaleFactor;
  tx(d, value, x+10+off, cy+1, {sz:9, bold:true, col: vc || C.blue});
  return y + h + 2; // next y (jsPDF: y increases downward)
};

// ─── Side tab ─────────────────────────────────────────────────────────────────
const sideTab = (d, y, h, label) => {
  rr(d, ML, y, TAB, h, {r:2.5, fill:C.sideTab});
  d.setFont('helvetica','bold'); d.setFontSize(8.5);
  setFill(d, C.white);
  d.text(label, ML+TAB/2, y+h/2, {angle:90, align:'center'});
};

// ─── Image placeholder box ────────────────────────────────────────────────────
const imgBox = (d, x, y, w, h, plain, boldLbl, imgData=null) => {
  const HDR = 9;
  card(d, x, y, w, h);
  cardHdr(d, x, y, w, HDR, plain, boldLbl);

  const bx=x+2, by=y+HDR+1.5, bw=w-4, bh=h-HDR-3;
  rr(d, bx, by, bw, bh, {r:2, fill:[236,244,250]});

  // Corner brackets
  const s = 4;
  d.setDrawColor(168,196,216); d.setLineWidth(0.6);
  [[bx,by+s,bx,by],[bx,by,bx+s,by],
   [bx+bw-s,by,bx+bw,by],[bx+bw,by,bx+bw,by+s],
   [bx,by+bh-s,bx,by+bh],[bx,by+bh,bx+s,by+bh],
   [bx+bw-s,by+bh,bx+bw,by+bh],[bx+bw,by+bh-s,bx+bw,by+bh]
  ].forEach(([x1,y1,x2,y2]) => d.line(x1,y1,x2,y2));

  // Grid lines
  d.setDrawColor(...C.bg); d.setLineWidth(0.18);
  for (let gx=bx+8; gx<bx+bw-3; gx+=10) d.line(gx,by+2,gx,by+bh-2);
  for (let gy=by+8; gy<by+bh-3; gy+=8)  d.line(bx+2,gy,bx+bw-2,gy);

  if (imgData) {
    try {
      const fmt = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      d.addImage(imgData, fmt, bx+1, by+1, bw-2, bh-2, undefined, 'FAST');
    } catch(e) {
      tx(d,'Invalid image',x+w/2,y+HDR+bh/2+1,{sz:7,col:C.muted,align:'center'});
    }
  } else {
    tx(d,'Image will appear here when uploaded',x+w/2,by+bh/2+1,{sz:7,col:C.muted,align:'center'});
  }
};

// ─── Text card (description / observations) ──────────────────────────────────
const textCard = (d, x, y, w, h, title, body) => {
  const HDR = 9;
  card(d, x, y, w, h);
  cardHdr(d, x, y, w, HDR, '', title);

  let ty = y + HDR + 5;
  const bot = y + h - 2;
  const mw  = w - 7;
  const lines = String(body||'').split('\n');

  lines.forEach(raw => {
    if (ty > bot) return;
    const line = raw.trim();
    if (!line) { ty += 2; return; }
    if (line.startsWith('•') || line.startsWith('\u2022')) {
      dot(d, x+5.5, ty-1, 1.2);
      d.setFont('helvetica','normal'); d.setFontSize(7.5); setFill(d,C.txt);
      d.splitTextToSize(line.replace(/^[•\u2022]\s*/,''), mw-6)
        .forEach(wl => { if(ty<=bot){ d.text(wl,x+9,ty); ty+=4; }});
    } else {
      d.setFont('helvetica','normal'); d.setFontSize(7.5); setFill(d,C.txt);
      d.splitTextToSize(line, mw).forEach(wl => { if(ty<=bot){ d.text(wl,x+3.5,ty); ty+=4; }});
    }
    ty += 1;
  });
};

// ─── Bullet card (recommendations) ───────────────────────────────────────────
const bulletCard = (d, x, y, w, h, title, body) => {
  const HDR = 9;
  card(d, x, y, w, h);
  cardHdr(d, x, y, w, HDR, '', title);

  let ty = y + HDR + 5.5;
  const bot = y + h - 2;
  const mw  = w - 13;

  String(body||'').split('\n').filter(l=>l.trim()).forEach(line => {
    if (ty > bot) return;
    dot(d, x+6, ty-1, 1.5);
    d.setFont('helvetica','normal'); d.setFontSize(8.5); setFill(d,C.txt);
    d.splitTextToSize(line.trim(), mw).forEach(wl => {
      if (ty <= bot) { d.text(wl, x+10, ty); ty += 4.5; }
    });
    ty += 1.5;
  });
};

// ─── ANDRITZ page header ──────────────────────────────────────────────────────
const drawHeader = (d) => {
  const HDR = 38;
  setFill(d,C.white); d.rect(0,0,PW,HDR,'F');
  d.setDrawColor(...C.bdr); d.setLineWidth(0.6); d.line(0,HDR,PW,HDR);

  // ANDRITZ wordmark
  tx(d,'ANDRiTZ', ML, 14, {sz:22, bold:true, col:C.navy});

  // Green leaf shapes
  setFill(d,[76,175,80]);
  d.triangle(ML,27, ML+10,21, ML+19,21, 'F');
  setFill(d,[46,125,50]);
  d.triangle(ML+2,32, ML+12,26, ML+21,26, 'F');

  tx(d,'CLEARWATER', ML+23, 23, {sz:8, bold:true, col:C.txt});
  tx(d,'PAPER',      ML+23, 29, {sz:8, bold:true, col:C.txt});

  // Separator
  d.setDrawColor(...C.bdr); d.setLineWidth(1);
  d.line(ML+58, 4, ML+58, 34);

  // Titles
  tx(d,'Condition Monitoring Report',        ML+63, 16, {sz:22, bold:true, col:C.navy});
  tx(d,'Vibration Diagnosis and Recommendation', ML+63, 27, {sz:12, bold:true, col:C.blue});
};

// ─── Mini header for page 2 ───────────────────────────────────────────────────
const drawMiniHeader = (d, data, id) => {
  setFill(d,C.white); d.rect(0,0,PW,16,'F');
  d.setDrawColor(...C.bdr); d.setLineWidth(0.6); d.line(0,16,PW,16);
  tx(d,'Condition Monitoring Report', ML, 9, {sz:11, bold:true, col:C.navy});
  tx(d,`Continued  ·  ${id}  ·  ${data.assetName} - ${data.assetId}  ·  ${data.area}`,
     ML, 14, {sz:7, bold:true, col:C.blue});
};

// ─── Footer bar (Emitted by | Note Date) ─────────────────────────────────────
const drawFooterBar = (d, tech, date) => {
  const BY = PH - 30, h = 11;
  const half = (PW - ML - MR - 4) / 2;

  card(d, ML, BY, half, h);
  dot(d, ML+5, BY+h/2, 1.8);
  tx(d,'Emitted by', ML+10, BY+h/2+1, {sz:9, col:C.txt});
  const off = d.getStringUnitWidth('Emitted by ') * 9 / d.internal.scaleFactor;
  tx(d, tech, ML+10+off, BY+h/2+1, {sz:9, bold:true, col:C.blue});

  const rx = ML+half+4;
  card(d, rx, BY, half, h);
  dot(d, rx+5, BY+h/2, 1.8);
  tx(d,'Note Date', rx+10, BY+h/2+1, {sz:9, col:C.txt});
  const off2 = d.getStringUnitWidth('Note Date ') * 9 / d.internal.scaleFactor;
  tx(d, date, rx+10+off2, BY+h/2+1, {sz:9, bold:true, col:C.blue});
};

// ─── Page footer ──────────────────────────────────────────────────────────────
const drawPageFooter = (d, id, pg) => {
  d.setDrawColor(...C.bdr); d.setLineWidth(0.4);
  d.line(ML, PH-10, PW-MR, PH-10);
  tx(d,`ANDRITZ Condition Monitoring System  ·  ${id}  ·  Clearwater Paper  ·  Augusta, GA  ·  CONFIDENTIAL`,
     ML, PH-6, {sz:6.5, col:C.muted});
  tx(d,`Page ${pg}`, PW-MR, PH-6, {sz:7, bold:true, col:C.muted, align:'right'});
};

// ═════════════════════════════════════════════════════════════════════════════
// CMR – PAGE 1
// ═════════════════════════════════════════════════════════════════════════════
const cmrPage1 = (d, data, id) => {
  setFill(d,C.bg); d.rect(0,0,PW,PH,'F');
  drawHeader(d);

  const HDR_H = 38, ROW_H = 10, GAP = 2;
  let y = HDR_H + 4;

  // ── General Information ──────────────────────────────────────────────────
  const genH = 4 + 5*(ROW_H+GAP) + 1;
  sideTab(d, y, genH, 'General Information');
  y += 2;

  y = infoRow(d, CX, y, CCW, 'Location:', data.area||'—');
  y = infoRow(d, CX, y, CCW, 'Asset & ID:', `${data.assetName||'—'} - ${data.assetId||'—'}`);

  const half = (CCW - 3) / 2;
  let _y = y;
  const statusBg = data.statusCondition==='alert' ? C.rbg
                 : data.statusCondition==='caution' ? [255,248,225] : [232,245,233];
  const statusTxt= data.statusCondition==='alert' ? C.rtxt
                 : data.statusCondition==='caution' ? [184,134,11] : [46,125,50];
  infoRow(d, CX,          _y, half, 'Vibration Diagnosis:', data.diagnosis||'—');
  infoRow(d, CX+half+3,   _y, half, 'Status Condition:',
    (data.statusCondition||'Alert').charAt(0).toUpperCase()+(data.statusCondition||'').slice(1),
    {bg:statusBg, vc:statusTxt});
  y = _y + ROW_H + GAP;

  _y = y;
  infoRow(d, CX+half+3, _y, half, 'Temperature:', `${data.temperature||'—'} °F`, {bg:C.rbg, vc:C.rtxt});
  y = _y + ROW_H + GAP;

  const third = (CCW - 6) / 3;
  _y = y;
  const risk = data.risk||'High';
  const riskBg = risk.toLowerCase().includes('high') ? C.rbg
               : risk.toLowerCase().includes('med') ? [255,248,225] : [232,245,233];
  const riskTxt= risk.toLowerCase().includes('high') ? C.rtxt
               : risk.toLowerCase().includes('med') ? [184,134,11] : [46,125,50];
  infoRow(d, CX,             _y, third, 'Risk:',            `${risk.charAt(0).toUpperCase()+risk.slice(1)} Risk`, {bg:riskBg,  vc:riskTxt});
  infoRow(d, CX+third+3,     _y, third, 'CMR:',             id, {bg:C.rbg, vc:C.rtxt});
  infoRow(d, CX+(third+3)*2, _y, third, 'Vibration Level:', `${data.vibrationLevel||'—'} G`, {bg:C.rbg, vc:C.rtxt});
  y = _y + ROW_H + GAP + 3;

  // ── Vibration Diagnosis Section ──────────────────────────────────────────
  const diagH = PH - y - 32;
  sideTab(d, y, diagH, 'Vibration Diagnosis and Recommendation');
  y += 2;

  const imgHalf = (CCW - 4) / 2;
  const imgH    = 55;

  imgBox(d, CX,           y, imgHalf, imgH, 'Trend:',    data.trendLabel||'Motor Inboard Envelope',  data.trendImage||null);
  imgBox(d, CX+imgHalf+4, y, imgHalf, imgH, 'Spectrum:', data.spectrumLabel||'Frequency Spectrum', data.spectrumImage||null);
  y += imgH + 4;

  const machH = 60;
  imgBox(d,  CX,           y, imgHalf, machH, 'Machine', 'Image', data.machineImage||null);
  textCard(d, CX+imgHalf+4, y, imgHalf, machH, 'Description', data.observations||'');
  y += machH + 4;

  const recH = Math.max(PH - y - 32, 28);
  bulletCard(d, CX, y, CCW, recH, 'Recommendation', data.recommendation||'');

  drawFooterBar(d, data.technicianName||'', data.date||'');
  drawPageFooter(d, id, '1');
};

// ═════════════════════════════════════════════════════════════════════════════
// CMR – PAGE 2: large images + full analysis
// ═════════════════════════════════════════════════════════════════════════════
const cmrPage2 = (d, data, id) => {
  setFill(d,C.bg); d.rect(0,0,PW,PH,'F');
  drawMiniHeader(d, data, id);

  let y = 20;

  const LG1 = 72, LG2 = 68;
  const evidH = LG1 + LG2 + 16 + 8;
  sideTab(d, y, evidH, 'Evidence Attachments');

  imgBox(d, CX, y, CCW, LG1, 'Trend:', `${data.trendLabel||'Motor Inboard Envelope'} — Full View`, data.trendImage||null);
  y += LG1 + 4;

  imgBox(d, CX, y, CCW, LG2, 'Spectrum:', `${data.spectrumLabel||'Frequency Spectrum'} — Full View`, data.spectrumImage||null);
  y += LG2 + 4;

  const machH = 76;
  sideTab(d, y, machH+2, 'Machine Photo');
  imgBox(d, CX, y, CCW, machH, 'Machine', 'Photo — Asset Condition', data.machineImage||null);
  y += machH + 5;

  const rem = PH - y - 18;
  if (rem >= 24) {
    sideTab(d, y, rem, 'Analysis Notes');
    const halfH = (rem - 4) / 2;
    textCard(d,  CX, y, CCW, halfH,     'Description',    data.observations||'');
    y += halfH + 4;
    bulletCard(d, CX, y, CCW, halfH-2,  'Recommendation', data.recommendation||'');
  }

  drawPageFooter(d, id, '2');
};

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC: Generate CMR (2 pages)
// ═════════════════════════════════════════════════════════════════════════════
export function generateConditionMonitorPDF(data, millName) {
  const d = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
  const id = `CMR-${String(Math.floor(Math.random()*900)+100)}-${new Date().getFullYear()}`;

  cmrPage1(d, data, id);
  d.addPage();
  cmrPage2(d, data, id);

  d.save(`${id}_Condition_Monitor.pdf`);
  return id;
}

// ═════════════════════════════════════════════════════════════════════════════
// Post Maintenance Form
// ═════════════════════════════════════════════════════════════════════════════
export function generatePostMaintenancePDF(data, millName) {
  const d = new jsPDF({ unit:'mm', format:'a4' });
  const id = `PMF-${String(Math.floor(Math.random()*900)+100)}-${new Date().getFullYear()}`;

  setFill(d,C.bg); d.rect(0,0,PW,PH,'F');
  drawHeader(d);

  const ROW_H=10, GAP=2;
  let y = 42;

  const pmfH = 56;
  sideTab(d, y, pmfH, 'General Information');
  y += 2;

  const col3 = (CCW - 6) / 3;
  let _y = y;
  infoRow(d, CX,             _y, col3, 'Date:',       data.maintenanceDate||'—');
  infoRow(d, CX+col3+3,      _y, col3, 'Work Order:',  data.woNumber||'—');
  infoRow(d, CX+(col3+3)*2,  _y, col3, 'Technician:',  data.technicianName||'—');
  y = _y + ROW_H + GAP;

  y = infoRow(d, CX, y, CCW, 'Asset Name:', data.assetName||'—');
  const half = (CCW-3)/2;
  _y = y;
  infoRow(d, CX,        _y, half, 'Asset ID:',  data.assetId||'—');
  infoRow(d, CX+half+3, _y, half, 'Location:',  data.area||'—');
  y = _y + ROW_H + GAP + 4;

  // Before / After cards
  const baTabH = 52;
  sideTab(d, y, baTabH, 'Pre / Post Readings');
  const hw = (CCW-4)/2;

  // Before card
  card(d, CX, y, hw, 46);
  rr(d, CX, y, hw, 9, {r:3, fill:[255,248,225]});
  d.setDrawColor(...C.bdr); d.setLineWidth(0.3); d.line(CX, y+9, CX+hw, y+9);
  dot(d, CX+5, y+4.5, 1.8, [184,134,11]);
  tx(d,'◀  BEFORE MAINTENANCE', CX+10, y+6.5, {sz:8, bold:true, col:[184,134,11]});
  infoRow(d, CX+2, y+12, hw-4, 'Vibration (in/s):', data.vibrationBefore||'—');
  infoRow(d, CX+2, y+25, hw-4, 'Temperature (°F):',  data.tempBefore||'—');

  // After card
  const ax = CX+hw+4;
  card(d, ax, y, hw, 46);
  rr(d, ax, y, hw, 9, {r:3, fill:[232,245,233]});
  d.setDrawColor(...C.bdr); d.setLineWidth(0.3); d.line(ax, y+9, ax+hw, y+9);
  dot(d, ax+5, y+4.5, 1.8, [46,125,50]);
  tx(d,'▶  AFTER MAINTENANCE', ax+10, y+6.5, {sz:8, bold:true, col:[46,125,50]});
  infoRow(d, ax+2, y+12, hw-4, 'Vibration (in/s):', data.vibrationAfter||'—');
  infoRow(d, ax+2, y+25, hw-4, 'Temperature (°F):',  data.tempAfter||'—');
  y += 52;

  sideTab(d, y, PH-y-20, 'Maintenance Details');
  textCard(d,  CX, y, CCW, 46, 'Maintenance Performed', data.maintenancePerformed||'');
  y += 50;
  textCard(d,  CX, y, CCW, 34, 'Parts Replaced', data.partsReplaced||'');
  y += 38;
  textCard(d,  CX, y, CCW, Math.max(PH-y-22,20), 'Notes', data.notes||'');

  drawFooterBar(d, data.technicianName||'', data.maintenanceDate||'');
  drawPageFooter(d, id, '1');
  d.save(`${id}_Post_Maintenance.pdf`);
  return id;
}

// ═════════════════════════════════════════════════════════════════════════════
// RCFA Form
// ═════════════════════════════════════════════════════════════════════════════
export function generateRCFAPDF(data, millName) {
  const d = new jsPDF({ unit:'mm', format:'a4' });
  const id = `RCFA-${String(Math.floor(Math.random()*900)+100)}-${new Date().getFullYear()}`;

  setFill(d,C.bg); d.rect(0,0,PW,PH,'F');
  drawHeader(d);

  const ROW_H=10, GAP=2;
  let y = 42;
  const col3 = (CCW-6)/3;
  const half  = (CCW-3)/2;

  sideTab(d, y, 52, 'Event Information');
  y += 2;

  let _y = y;
  infoRow(d, CX,            _y, col3, 'Event Date:', data.eventDate||'—');
  infoRow(d, CX+col3+3,     _y, col3, 'Work Order:', data.woNumber||'—');
  infoRow(d, CX+(col3+3)*2, _y, col3, 'Analyst:',    data.analystName||'—');
  y = _y + ROW_H + GAP;

  _y = y;
  infoRow(d, CX,        _y, half, 'Location:',        data.area||'—');
  infoRow(d, CX+half+3, _y, half, 'Failed Component:', data.failedComponent||'—');
  y = _y + ROW_H + GAP + 2;

  textCard(d, CX, y, CCW, 28, 'Problem Description', data.problemDescription||'');
  y += 32;

  // 5 Whys
  sideTab(d, y, 72, '5 Whys Analysis');
  const whyCols = [[198,40,40],[210,80,40],[215,120,30],[210,160,20],[184,134,11]];
  for (let i = 1; i <= 5; i++) {
    const val = data[`why${i}`]||'';
    const wc = whyCols[i-1];
    const wH = 10;
    card(d, CX, y, CCW, wH, 2);
    rr(d, CX, y, 20, wH, {r:2, fill:[34,54,90]});
    rr(d, CX, y, 2, wH, {r:0, fill:wc});
    tx(d, `WHY ${i}`, CX+4, y+wH/2+1, {sz:7.5, bold:true, col:C.white});
    d.setDrawColor(...C.bdr); d.setLineWidth(0.3); d.line(CX+20, y+1.5, CX+20, y+wH-1.5);
    tx(d, val||'—', CX+23, y+wH/2+1, {sz:8.5, col:C.txt});
    y += wH + 2;
    if (i < 5) {
      d.setDrawColor(...C.bdr); d.setLineWidth(0.4);
      d.line(CX+10, y, CX+10, y+2);
      setFill(d,C.bdr);
      d.triangle(CX+8.5,y+2, CX+11.5,y+2, CX+10,y+3.5,'F');
      y += 3.5;
    }
  }
  y += 4;

  sideTab(d, y, PH-y-20, 'Root Cause & Actions');

  const rcH = 28;
  card(d, CX, y, CCW, rcH);
  rr(d, CX, y, CCW, rcH, {r:3, fill:C.rbg, stroke:C.rtxt, lw:0.6});
  rr(d, CX, y, CCW, 9, {r:3, fill:C.rtxt});
  rr(d, CX, y, 2.5, 9, {r:0, fill:C.white});
  tx(d,'⚠  ROOT CAUSE IDENTIFIED', CX+6, y+6.3, {sz:7.5, bold:true, col:C.white});
  d.setFont('helvetica','normal'); d.setFontSize(9); setFill(d,C.txt);
  d.splitTextToSize(data.rootCause||'', CCW-8).forEach((l,i) => d.text(l, CX+4, y+14+i*5));
  y += rcH + 4;

  bulletCard(d, CX, y, CCW, Math.max(PH-y-22,28), 'Corrective Actions', data.correctiveActions||'');

  drawFooterBar(d, data.analystName||'', data.eventDate||'');
  drawPageFooter(d, id, '1');
  d.save(`${id}_RCFA.pdf`);
  return id;
}

// ═════════════════════════════════════════════════════════════════════════════
// Safety Form (JSA)
// ═════════════════════════════════════════════════════════════════════════════
export function generateSafetyPDF(data, millName) {
  const d = new jsPDF({ unit:'mm', format:'a4' });
  const id = `JSA-${String(Math.floor(Math.random()*900)+100)}-${new Date().getFullYear()}`;

  setFill(d,C.bg); d.rect(0,0,PW,PH,'F');
  drawHeader(d);

  const ROW_H=10, GAP=2;
  let y = 42;
  const col3 = (CCW-6)/3;
  const half  = (CCW-3)/2;

  sideTab(d, y, 52, 'Job Information');
  y += 2;

  let _y = y;
  infoRow(d, CX,            _y, col3, 'Date:',      data.date||'—');
  infoRow(d, CX+col3+3,     _y, col3, 'Location:',  data.area||'—');
  infoRow(d, CX+(col3+3)*2, _y, col3, 'Employee:',  data.employeeName||'—');
  y = _y + ROW_H + GAP;

  _y = y;
  infoRow(d, CX, _y, half, 'Supervisor:', data.supervisor||'—');
  y = _y + ROW_H + GAP + 2;

  textCard(d, CX, y, CCW, 26, 'Task Description', data.taskDescription||'');
  y += 30;

  // PPE Checklist
  const ppeItems = [
    {key:'hardHat',          label:'Hard Hat'},
    {key:'safetyGlasses',    label:'Safety Glasses'},
    {key:'steelToeBoots',    label:'Steel Toe Boots'},
    {key:'highVisVest',      label:'High Vis Vest'},
    {key:'hearingProtection',label:'Hearing Protection'},
    {key:'gloves',           label:'Gloves'},
    {key:'fallProtection',   label:'Fall Protection'},
    {key:'faceShield',       label:'Face Shield'},
  ];
  const ppeTab = 40;
  sideTab(d, y, ppeTab, 'PPE Checklist');
  const bw2 = (CCW-6)/4, bh2 = 15;
  ppeItems.forEach(({key,label},i) => {
    const col = i%4, row = Math.floor(i/4);
    const px = CX + col*(bw2+2);
    const py = y + row*(bh2+2);
    const chkd = !!data[key];
    card(d, px, py, bw2, bh2, 2);
    if (chkd) rr(d, px, py, bw2, bh2, {r:2, fill:[232,245,233], stroke:[46,125,50], lw:0.5});
    rr(d, px, py, 2, bh2, {r:0, fill: chkd ? [46,125,50] : C.bdr});
    rr(d, px+3.5, py+3.5, 8, 8, {r:1.5, fill: chkd ? [46,125,50] : C.white, stroke: chkd ? [46,125,50] : C.bdr, lw:0.4});
    if (chkd) tx(d,'✓', px+7.5, py+9.5, {sz:9, bold:true, col:C.white, align:'center'});
    tx(d, label, px+14, py+9, {sz:7.5, bold:chkd, col: chkd ? [46,125,50] : C.muted});
  });
  y += 2*(bh2+2)+6;

  sideTab(d, y, PH-y-20, 'Hazard Analysis');
  textCard(d, CX, y, CCW, 40, 'Hazards Identified', data.hazards||'');
  y += 44;
  textCard(d, CX, y, CCW, 40, 'Control Measures', data.controlMeasures||'');
  y += 44;

  const sigH = 22, sw = (CCW-4)/2;
  card(d, CX, y, sw, sigH);
  cardHdr(d, CX, y, sw, 9, '', 'EMPLOYEE SIGNATURE');
  d.setDrawColor(...C.bdr); d.setLineWidth(0.4); d.line(CX+5, y+sigH-4, CX+sw-5, y+sigH-4);
  tx(d, data.employeeName||'', CX+6, y+sigH-4.5, {sz:9, bold:true, col:C.blue});

  const sx2 = CX+sw+4;
  card(d, sx2, y, sw, sigH);
  cardHdr(d, sx2, y, sw, 9, '', 'SUPERVISOR SIGNATURE');
  d.setDrawColor(...C.bdr); d.setLineWidth(0.4); d.line(sx2+5, y+sigH-4, sx2+sw-5, y+sigH-4);
  tx(d, data.supervisor||'', sx2+6, y+sigH-4.5, {sz:9, bold:true, col:C.blue});

  drawPageFooter(d, id, '1');
  d.save(`${id}_Safety_Form.pdf`);
  return id;
}
