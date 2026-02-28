// FormsTab.js
import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import logo from '../assets/andritz-clearwater-logo.png';

import {
  generateConditionMonitorPDF,
  generatePostMaintenancePDF,
  generateRCFAPDF,
  generateSafetyPDF
} from '../utils/pdfGenerator';

const FORM_TYPES = [
  { id:'condition-monitor', name:'Condition Monitoring Report', tag:'CMR',  description:'Vibration diagnosis, evidence screenshots, and action plan.', icon:'📊', accent:'#0075BF', glow:'rgba(0,117,191,0.35)' },
  { id:'post-maintenance',  name:'Post Maintenance Form',       tag:'PMF',  description:'Record work performed and pre / post condition readings.',    icon:'🔧', accent:'#2EB85C', glow:'rgba(46,184,92,0.35)' },
  { id:'rcfa',              name:'RCFA Form',                   tag:'RCFA', description:'5 Whys causal chain analysis and corrective actions.',        icon:'🔍', accent:'#D73232', glow:'rgba(215,50,50,0.35)' },
  { id:'safety',            name:'Safety Form',                 tag:'JSA',  description:'Job Safety Analysis with PPE checklist and hazard controls.',  icon:'🛡️', accent:'#DC9B1E', glow:'rgba(220,155,30,0.35)' }
];

const STATUS_OPTIONS = [
  { value:'acceptable', label:'Acceptable', bg:'#E8F5E9', border:'#2E7D32' },
  { value:'caution',    label:'Caution',    bg:'#FFF8E1', border:'#B8860B' },
  { value:'alert',      label:'Alert',      bg:'#FDECEA', border:'#C62828' }
];
const RISK_OPTIONS = [
  { value:'low',    label:'Low Risk'    },
  { value:'medium', label:'Medium Risk' },
  { value:'high',   label:'High Risk'   }
];

function cx(...xs){ return xs.filter(Boolean).join(' '); }

function Field({ label, required, hint, children }) {
  return (
    <div className="ft-field">
      <div className="ft-labelRow">
        <label className="ft-label">{label}{required?<span className="ft-req">*</span>:null}</label>
        {hint?<div className="ft-hint">{hint}</div>:null}
      </div>
      {children}
    </div>
  );
}

function Select({ value, onChange, children, style }) {
  return (
    <div className="ft-selectWrap">
      <select className="ft-input" value={value} onChange={onChange} style={style}>{children}</select>
      <span className="ft-selectChevron">▼</span>
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  const opt = STATUS_OPTIONS.find(o=>o.value===value)||STATUS_OPTIONS[2];
  return (
    <Select value={value} onChange={onChange} style={{background:opt.bg,borderColor:opt.border,fontWeight:800,color:'#003A70'}}>
      {STATUS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}
function RiskSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      {RISK_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

function SectionTitle({ title, subtitle, accent='#0075BF' }) {
  return (
    <div className="ft-sectionTitle">
      <div className="ft-sectionBar" style={{background:accent}}/>
      <div>
        <div className="ft-sectionText" style={{color:accent}}>{title}</div>
        {subtitle?<div className="ft-sectionSub">{subtitle}</div>:null}
      </div>
      <div className="ft-sectionRule"/>
    </div>
  );
}

function ImageUpload({ label, value, onChange, hint }) {
  const ref = useRef(null);
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 6*1024*1024) { toast.error('Image too large. Max 6 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="ft-field">
      <div className="ft-labelRow">
        <label className="ft-label">{label}</label>
        {hint?<div className="ft-hint">{hint}</div>:null}
      </div>
      <div className={cx('ft-drop',value&&'ft-dropActive')}
        onClick={()=>ref.current?.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files?.[0]);}}
        role="button" tabIndex={0}>
        {value?(
          <div className="ft-previewWrap">
            <img className="ft-preview" src={value} alt="preview"/>
            <button type="button" className="ft-x" onClick={e=>{e.stopPropagation();onChange(null);}}>✕</button>
          </div>
        ):(
          <div className="ft-dropInner">
            <div className="ft-paperclip">📎</div>
            <div className="ft-dropText">{hint||'Click to upload or drop an image here'}</div>
            <div className="ft-dropSub">PNG or JPG · Max 6 MB</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files?.[0])}/>
      </div>
    </div>
  );
}

function ModalShell({ mill, title, tag, accent, onClose, children }) {
  return (
    <div className="ft-modalOverlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ft-modal">
        <div className="ft-modalHeader">
          <div className="ft-modalAccentBar" style={{background:accent}}/>
          <div className="ft-modalHeaderInner">
            <div className="ft-modalHeaderLeft">
              <div className="ft-brand">
                <div className="ft-brandLogoWrap">
                  <img className="ft-brandLogo" src={logo} alt="ANDRITZ Clearwater Paper"/>
                </div>
                <div className="ft-brandMeta">
                  <div className="ft-brandLine1">ANDRITZ Condition Monitoring System</div>
                  <div className="ft-brandLine2" style={{color:accent}}>{mill?.shortName||''}{tag?` · ${tag}`:''}</div>
                </div>
              </div>
              <div className="ft-modalTitle">
                <div className="ft-modalTitleMain">{title}</div>
                <div className="ft-modalTitleSub">Fill completely · Attach evidence where applicable</div>
              </div>
            </div>
            <button type="button" className="ft-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Condition Monitor Form ───────────────────────────────────────────────────
function ConditionMonitorForm({ mill, onClose }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    technicianName:'', woNumber:'', cmrNumber:'', area:'', assetId:'', assetName:'',
    vibrationLevel:'', geLevel:'', temperature:'', diagnosis:'',
    risk:'high', statusCondition:'alert', observations:'', recommendation:'',
    trendImage:null, spectrumImage:null, machineImage:null
  });
  const statusOpt = useMemo(()=>STATUS_OPTIONS.find(o=>o.value===data.statusCondition)||STATUS_OPTIONS[2],[data.statusCondition]);
  const f = (k)=>(e)=>setData(p=>({...p,[k]:e.target.value}));
  const fImg = (k)=>(val)=>setData(p=>({...p,[k]:val}));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.technicianName?.trim()) return toast.error('Technician Name is required');
    if (!data.assetName?.trim())      return toast.error('Asset Name is required');
    if (!data.area?.trim())           return toast.error('Location is required');
    if (!data.diagnosis?.trim())      return toast.error('Vibration Diagnosis is required');
    if (!data.recommendation?.trim()) return toast.error('Recommendation is required');
    try {
      const id = generateConditionMonitorPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch(err) { console.error(err); toast.error(`PDF failed: ${err.message||'Unknown error'}`); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="General Information" subtitle="Asset identification and condition status." accent="#0075BF"/>
        <div className="ft-grid2">
          <Field label="Date" required><input className="ft-input" type="date" value={data.date} onChange={f('date')} required/></Field>
          <Field label="Work Order" hint="Optional"><input className="ft-input" placeholder="WO-XXXXX" value={data.woNumber} onChange={f('woNumber')}/></Field>
          <Field label="CMR Number" hint="e.g. 136-2025"><input className="ft-input" placeholder="136-2025" value={data.cmrNumber} onChange={f('cmrNumber')}/></Field>
          <Field label="Technician Name" required><input className="ft-input" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required/></Field>
          <Field label="Location" required hint="Area > Machine > Component"><input className="ft-input" placeholder="PM1 > Machine Floor > East Deflaker > MIB" value={data.area} onChange={f('area')} required/></Field>
          <Field label="Asset Name" required><input className="ft-input" placeholder="Motor, Pump, Fan, Gearbox..." value={data.assetName} onChange={f('assetName')} required/></Field>
          <Field label="Asset ID" hint="Optional"><input className="ft-input" placeholder="Tag or ID" value={data.assetId} onChange={f('assetId')}/></Field>
          <Field label="Vibration Diagnosis" required><input className="ft-input" placeholder="Mechanical looseness, bearing defect..." value={data.diagnosis} onChange={f('diagnosis')} required/></Field>
          <Field label="Temperature (°F)" hint="Optional"><input className="ft-input" placeholder="233" value={data.temperature} onChange={f('temperature')}/></Field>
          <Field label="Status Condition" required><StatusSelect value={data.statusCondition} onChange={f('statusCondition')}/></Field>
          <Field label="Vibration Level (in/s)" hint="Matches status color">
            <input className="ft-input" placeholder="0.450" value={data.vibrationLevel} onChange={f('vibrationLevel')}
              style={{background:statusOpt.bg, borderColor:statusOpt.border, fontWeight:900, color:'#003A70'}}/>
          </Field>
          <Field label="Risk Level" required><RiskSelect value={data.risk} onChange={f('risk')}/></Field>
          <Field label="gE Level" hint="Envelope acceleration"><input className="ft-input" placeholder="14.4" value={data.geLevel} onChange={f('geLevel')}/></Field>
        </div>

        <SectionTitle title="Evidence Attachments" subtitle="Trend, spectrum, and machine photo." accent="#0075BF"/>
        <div className="ft-grid2">
          <ImageUpload label="Trend Chart" value={data.trendImage} onChange={fImg('trendImage')} hint="Trend screenshot from software"/>
          <ImageUpload label="Frequency Spectrum" value={data.spectrumImage} onChange={fImg('spectrumImage')} hint="Spectrum screenshot from software"/>
          <div style={{gridColumn:'1 / -1'}}>
            <ImageUpload label="Machine Photo" value={data.machineImage} onChange={fImg('machineImage')} hint="Clear picture of the asset"/>
          </div>
        </div>

        <SectionTitle title="Analysis and Recommendation" subtitle="Write it like a report." accent="#0075BF"/>
        <div className="ft-grid1">
          <Field label="Description" hint="What you observed and why it matters">
            <textarea className="ft-input ft-textarea" rows={5}
              placeholder="Vibration increased 841% compared to prior reading. Looseness symptoms observed..."
              value={data.observations} onChange={f('observations')}/>
          </Field>
          <Field label="Recommendation" required hint="One action per line">
            <textarea className="ft-input ft-textarea" rows={5}
              placeholder={"Motor bearing relubrication must be done immediately.\nSchedule motor replacement at the earliest opportunity.\nEvaluate coupling condition."}
              value={data.recommendation} onChange={f('recommendation')} required/>
          </Field>
        </div>
      </div>
      <div className="ft-modalFooter">
        <div className="ft-footNote">Confidential · Output aligns to the CMR PDF layout</div>
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary" style={{'--btn-accent':'#0075BF'}}>Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

// ─── Post Maintenance Form ────────────────────────────────────────────────────
function PostMaintenanceForm({ mill, onClose }) {
  const [data, setData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    technicianName:'', woNumber:'', assetName:'', assetId:'', area:'',
    maintenancePerformed:'', vibrationBefore:'', vibrationAfter:'',
    tempBefore:'', tempAfter:'', partsReplaced:'', notes:''
  });
  const f=(k)=>(e)=>setData(p=>({...p,[k]:e.target.value}));
  const handleSubmit=(e)=>{
    e.preventDefault();
    if (!data.technicianName?.trim()) return toast.error('Technician Name required');
    if (!data.assetName?.trim())      return toast.error('Asset Name required');
    if (!data.maintenancePerformed?.trim()) return toast.error('Maintenance Performed required');
    try { const id=generatePostMaintenancePDF(data,mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch(err){ console.error(err); toast.error('PDF failed'); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="General Information" accent="#2EB85C"/>
        <div className="ft-grid2">
          <Field label="Maintenance Date" required><input className="ft-input" type="date" value={data.maintenanceDate} onChange={f('maintenanceDate')} required/></Field>
          <Field label="Work Order" hint="Optional"><input className="ft-input" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')}/></Field>
          <Field label="Technician Name" required><input className="ft-input" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required/></Field>
          <Field label="Asset Name" required><input className="ft-input" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required/></Field>
          <Field label="Asset ID" hint="Optional"><input className="ft-input" placeholder="Tag or ID" value={data.assetId} onChange={f('assetId')}/></Field>
          <Field label="Location" hint="Optional"><input className="ft-input" placeholder="Area or line" value={data.area} onChange={f('area')}/></Field>
        </div>
        <SectionTitle title="Pre and Post Readings" accent="#2EB85C"/>
        <div className="ft-readingsGrid">
          <div className="ft-readingCard ft-readingBefore">
            <div className="ft-readingLabel">◀ BEFORE</div>
            <Field label="Vibration (in/s)"><input className="ft-input" placeholder="Pre reading" value={data.vibrationBefore} onChange={f('vibrationBefore')}/></Field>
            <Field label="Temperature (°F)"><input className="ft-input" placeholder="Pre reading" value={data.tempBefore} onChange={f('tempBefore')}/></Field>
          </div>
          <div className="ft-readingArrow">→</div>
          <div className="ft-readingCard ft-readingAfter">
            <div className="ft-readingLabel" style={{color:'#2EB85C'}}>▶ AFTER</div>
            <Field label="Vibration (in/s)"><input className="ft-input" placeholder="Post reading" value={data.vibrationAfter} onChange={f('vibrationAfter')}/></Field>
            <Field label="Temperature (°F)"><input className="ft-input" placeholder="Post reading" value={data.tempAfter} onChange={f('tempAfter')}/></Field>
          </div>
        </div>
        <SectionTitle title="Maintenance Details" accent="#2EB85C"/>
        <div className="ft-grid1">
          <Field label="Maintenance Performed" required><textarea className="ft-input ft-textarea" rows={4} value={data.maintenancePerformed} onChange={f('maintenancePerformed')} required/></Field>
          <Field label="Parts Replaced" hint="Optional"><textarea className="ft-input ft-textarea" rows={3} value={data.partsReplaced} onChange={f('partsReplaced')}/></Field>
          <Field label="Notes" hint="Optional"><textarea className="ft-input ft-textarea" rows={3} value={data.notes} onChange={f('notes')}/></Field>
        </div>
      </div>
      <div className="ft-modalFooter">
        <div className="ft-footNote">Confidential · PMF output</div>
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary" style={{'--btn-accent':'#2EB85C'}}>Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

// ─── RCFA Form ────────────────────────────────────────────────────────────────
function RCFAForm({ mill, onClose }) {
  const [data, setData] = useState({
    eventDate: new Date().toISOString().split('T')[0], analystName:'', woNumber:'',
    failedComponent:'', area:'', problemDescription:'',
    why1:'', why2:'', why3:'', why4:'', why5:'', rootCause:'', correctiveActions:''
  });
  const f=(k)=>(e)=>setData(p=>({...p,[k]:e.target.value}));
  const handleSubmit=(e)=>{
    e.preventDefault();
    if (!data.analystName?.trim())        return toast.error('Analyst Name required');
    if (!data.problemDescription?.trim()) return toast.error('Problem Description required');
    if (!data.rootCause?.trim())          return toast.error('Root Cause required');
    if (!data.correctiveActions?.trim())  return toast.error('Corrective Actions required');
    try { const id=generateRCFAPDF(data,mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch(err){ console.error(err); toast.error('PDF failed'); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="Event Information" accent="#D73232"/>
        <div className="ft-grid2">
          <Field label="Event Date" required><input className="ft-input" type="date" value={data.eventDate} onChange={f('eventDate')} required/></Field>
          <Field label="Work Order" hint="Optional"><input className="ft-input" value={data.woNumber} onChange={f('woNumber')}/></Field>
          <Field label="Analyst Name" required><input className="ft-input" placeholder="Full name" value={data.analystName} onChange={f('analystName')} required/></Field>
          <Field label="Location" hint="Optional"><input className="ft-input" value={data.area} onChange={f('area')}/></Field>
          <Field label="Failed Component" hint="Optional"><input className="ft-input" value={data.failedComponent} onChange={f('failedComponent')}/></Field>
          <div style={{gridColumn:'1/-1'}}>
            <Field label="Problem Description" required><textarea className="ft-input ft-textarea" rows={3} value={data.problemDescription} onChange={f('problemDescription')} required/></Field>
          </div>
        </div>
        <SectionTitle title="5 Whys" subtitle="Short, direct, testable statements." accent="#D73232"/>
        <div className="ft-whyChain">
          {[1,2,3,4,5].map(n=>(
            <div key={n} className="ft-whyRow">
              <div className="ft-whyNum">{n}</div>
              <div className="ft-whyInput">
                <Field label={`Why ${n}`} hint={n===1?'Start with the observed failure mode':undefined}>
                  <input className="ft-input" value={data[`why${n}`]} onChange={f(`why${n}`)} placeholder={n===1?'What failure was observed?':'Why did that happen?'}/>
                </Field>
              </div>
            </div>
          ))}
        </div>
        <SectionTitle title="Outcome" accent="#D73232"/>
        <div className="ft-grid1">
          <Field label="Root Cause" required><textarea className="ft-input ft-textarea ft-danger" rows={3} value={data.rootCause} onChange={f('rootCause')} required placeholder="The fundamental reason for the failure..."/></Field>
          <Field label="Corrective Actions" required hint="One action per line"><textarea className="ft-input ft-textarea" rows={4} value={data.correctiveActions} onChange={f('correctiveActions')} required/></Field>
        </div>
      </div>
      <div className="ft-modalFooter">
        <div className="ft-footNote">Confidential · RCFA output</div>
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary" style={{'--btn-accent':'#D73232'}}>Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

// ─── Safety Form ──────────────────────────────────────────────────────────────
function SafetyForm({ mill, onClose }) {
  const ppeItems = [
    {key:'hardHat',label:'Hard Hat',icon:'⛑️'},{key:'safetyGlasses',label:'Safety Glasses',icon:'🥽'},
    {key:'steelToeBoots',label:'Steel Toe Boots',icon:'🥾'},{key:'highVisVest',label:'High Vis Vest',icon:'🦺'},
    {key:'hearingProtection',label:'Hearing Protection',icon:'👂'},{key:'gloves',label:'Gloves',icon:'🧤'},
    {key:'fallProtection',label:'Fall Protection',icon:'🪝'},{key:'faceShield',label:'Face Shield',icon:'🛡️'},
  ];
  const [data,setData] = useState({
    date: new Date().toISOString().split('T')[0], employeeName:'', supervisor:'',
    taskDescription:'', area:'', hazards:'', controlMeasures:'',
    ...ppeItems.reduce((a,i)=>({...a,[i.key]:false}),{})
  });
  const f=(k)=>(e)=>setData(p=>({...p,[k]:e.target.value}));
  const toggle=(k)=>setData(p=>({...p,[k]:!p[k]}));
  const handleSubmit=(e)=>{
    e.preventDefault();
    if (!data.employeeName?.trim())    return toast.error('Employee Name required');
    if (!data.taskDescription?.trim()) return toast.error('Task Description required');
    if (!data.hazards?.trim())         return toast.error('Hazards Identified required');
    if (!data.controlMeasures?.trim()) return toast.error('Control Measures required');
    try { const id=generateSafetyPDF(data,mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch(err){ console.error(err); toast.error('PDF failed'); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="Job Information" accent="#DC9B1E"/>
        <div className="ft-grid2">
          <Field label="Date" required><input className="ft-input" type="date" value={data.date} onChange={f('date')} required/></Field>
          <Field label="Location" hint="Optional"><input className="ft-input" value={data.area} onChange={f('area')}/></Field>
          <Field label="Employee Name" required><input className="ft-input" placeholder="Full name" value={data.employeeName} onChange={f('employeeName')} required/></Field>
          <Field label="Supervisor" hint="Optional"><input className="ft-input" value={data.supervisor} onChange={f('supervisor')}/></Field>
          <div style={{gridColumn:'1/-1'}}>
            <Field label="Task Description" required><textarea className="ft-input ft-textarea" rows={3} value={data.taskDescription} onChange={f('taskDescription')} required/></Field>
          </div>
        </div>
        <SectionTitle title="PPE Checklist" subtitle="Select all required PPE for this task." accent="#DC9B1E"/>
        <div className="ft-ppeGrid">
          {ppeItems.map(item=>{
            const checked=!!data[item.key];
            return (
              <button key={item.key} type="button" className={cx('ft-ppe',checked&&'ft-ppeOn')} onClick={()=>toggle(item.key)}>
                <span className="ft-ppeIcon">{item.icon}</span>
                <span className={cx('ft-box',checked&&'ft-boxOn')}>{checked?'✓':''}</span>
                <span className="ft-ppeLabel">{item.label}</span>
              </button>
            );
          })}
        </div>
        <SectionTitle title="Hazard Analysis" accent="#DC9B1E"/>
        <div className="ft-grid1">
          <Field label="Hazards Identified" required><textarea className="ft-input ft-textarea ft-warnBg" rows={4} value={data.hazards} onChange={f('hazards')} required/></Field>
          <Field label="Control Measures" required><textarea className="ft-input ft-textarea" rows={4} value={data.controlMeasures} onChange={f('controlMeasures')} required/></Field>
        </div>
      </div>
      <div className="ft-modalFooter">
        <div className="ft-footNote">Confidential · JSA output</div>
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary" style={{'--btn-accent':'#DC9B1E'}}>Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

const FORM_COMPONENTS = {
  'condition-monitor': ConditionMonitorForm,
  'post-maintenance':  PostMaintenanceForm,
  'rcfa':              RCFAForm,
  'safety':            SafetyForm,
};

export default function FormsTab({ mill }) {
  const [activeForm, setActiveForm] = useState(null);
  const formMeta = FORM_TYPES.find(f=>f.id===activeForm);
  const Active = activeForm ? FORM_COMPONENTS[activeForm] : null;

  return (
    <div className="ft-page">
      <style>{`
        :root {
          --ft-bg:#0A1220;--ft-bgSub:#0E1A2E;--ft-panel:#111D33;--ft-card:#0F1929;--ft-cardHov:#132038;
          --ft-border:#1E3558;--ft-border2:#243F68;--ft-text:#E2EDF8;--ft-muted:#7A99BB;--ft-soft:#D6E8F5;
          --ft-white:#FFFFFF;--ft-blue:#0075BF;--ft-blueLt:#00AAEE;--ft-blueDk:#003A70;
          --ft-shadow:0 22px 60px rgba(0,0,0,0.55);--ft-radius:14px;
        }
        .ft-page{padding:24px;background:radial-gradient(ellipse 80% 40% at 50% 0%,rgba(0,80,160,0.18) 0%,transparent 70%),var(--ft-bg);min-height:calc(100vh - 60px);}
        .ft-wrap{max-width:1200px;margin:0 auto;}
        .ft-hero{background:linear-gradient(110deg,#08152B 0%,#0D2044 50%,#0A1830 100%);border:1px solid var(--ft-border2);border-radius:var(--ft-radius);box-shadow:var(--ft-shadow),inset 0 1px 0 rgba(255,255,255,0.06);padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px;position:relative;overflow:hidden;}
        .ft-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--ft-blue),#00AAEE,var(--ft-blue));}
        .ft-hero::after{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:24px 24px;pointer-events:none;}
        .ft-heroLeft{display:flex;align-items:center;gap:18px;position:relative;z-index:1;}
        .ft-heroLogoWrap{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;}
        .ft-heroLogo{width:150px;height:auto;display:block;}
        .ft-heroDivider{width:1px;height:48px;background:var(--ft-border2);}
        .ft-heroTitle{font-size:22px;font-weight:900;color:var(--ft-white);letter-spacing:0.3px;}
        .ft-heroSub{margin-top:4px;font-size:12.5px;color:var(--ft-muted);}
        .ft-pillRow{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;position:relative;z-index:1;}
        .ft-pill{background:rgba(0,117,191,0.15);border:1px solid rgba(0,170,238,0.25);border-radius:999px;padding:7px 13px;font-size:11.5px;color:#88C8EC;font-weight:700;}
        .ft-gridCards{margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;}
        .ft-card{background:var(--ft-card);border:1px solid var(--ft-border);border-radius:var(--ft-radius);padding:20px;text-align:left;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s,background .2s;position:relative;overflow:hidden;}
        .ft-card::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:16px 16px;pointer-events:none;}
        .ft-card:hover{transform:translateY(-4px);background:var(--ft-cardHov);border-color:var(--card-accent,var(--ft-blue));box-shadow:0 20px 50px rgba(0,0,0,0.5),0 0 0 1px var(--card-accent,var(--ft-blue)),0 0 25px var(--card-glow,rgba(0,117,191,0.25));}
        .ft-topBar{position:absolute;left:0;top:0;right:0;height:3px;background:var(--card-accent,var(--ft-blue));}
        .ft-cardIcon{font-size:28px;margin-top:4px;}
        .ft-cardTitle{margin-top:10px;font-weight:900;font-size:14px;color:var(--ft-white);}
        .ft-cardDesc{margin-top:7px;color:var(--ft-muted);line-height:1.5;font-size:12.5px;}
        .ft-cardFoot{margin-top:16px;display:flex;align-items:center;justify-content:space-between;}
        .ft-tag{font-weight:900;font-size:10px;letter-spacing:1.5px;border-radius:999px;padding:5px 10px;}
        .ft-cta{font-weight:900;font-size:11px;letter-spacing:1px;color:var(--ft-muted);display:flex;align-items:center;gap:4px;}
        .ft-cta::after{content:'→';color:var(--card-accent,var(--ft-blue));}
        .ft-modalOverlay{position:fixed;inset:0;background:rgba(4,10,22,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999;}
        .ft-modal{width:min(1020px,100%);background:var(--ft-panel);border-radius:20px;box-shadow:0 32px 100px rgba(0,0,0,0.6),0 0 0 1px var(--ft-border);overflow:hidden;display:flex;flex-direction:column;max-height:94vh;}
        .ft-modalHeader{background:linear-gradient(180deg,#0B1830 0%,#0E1F3A 100%);border-bottom:1px solid var(--ft-border2);position:relative;flex-shrink:0;}
        .ft-modalAccentBar{height:2.5px;width:100%;}
        .ft-modalHeaderInner{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 18px;gap:16px;}
        .ft-modalHeaderLeft{display:flex;flex-direction:column;gap:10px;}
        .ft-brand{display:flex;align-items:center;gap:12px;}
        .ft-brandLogoWrap{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:7px 10px;}
        .ft-brandLogo{width:140px;height:auto;display:block;}
        .ft-brandMeta{display:flex;flex-direction:column;gap:2px;}
        .ft-brandLine1{font-size:10px;letter-spacing:1.2px;font-weight:900;color:var(--ft-muted);text-transform:uppercase;}
        .ft-brandLine2{font-size:12px;font-weight:900;}
        .ft-modalTitleMain{font-size:16px;font-weight:1000;color:var(--ft-white);}
        .ft-modalTitleSub{margin-top:2px;font-size:11.5px;color:var(--ft-muted);}
        .ft-close{cursor:pointer;border:1px solid var(--ft-border);background:rgba(255,255,255,0.04);font-size:16px;color:var(--ft-muted);padding:5px 9px;border-radius:10px;transition:all .15s;}
        .ft-close:hover{background:rgba(215,50,50,0.15);border-color:#D73232;color:#FF6B6B;}
        .ft-modalBody{padding:16px 18px 8px;max-height:calc(94vh - 160px);overflow-y:auto;overflow-x:hidden;background:var(--ft-panel);}
        .ft-modalBody::-webkit-scrollbar{width:5px;}
        .ft-modalBody::-webkit-scrollbar-track{background:transparent;}
        .ft-modalBody::-webkit-scrollbar-thumb{background:var(--ft-border2);border-radius:4px;}
        .ft-modalFooter{padding:12px 18px;background:linear-gradient(180deg,#0B1830 0%,#0E1F3A 100%);border-top:1px solid var(--ft-border2);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-shrink:0;}
        .ft-footNote{font-size:11px;color:var(--ft-muted);}
        .ft-footRight{display:flex;gap:10px;}
        .ft-btn{border-radius:11px;padding:10px 16px;font-weight:900;letter-spacing:0.4px;cursor:pointer;border:1px solid transparent;font-size:12.5px;transition:all .15s;}
        .ft-btnPrimary{background:var(--btn-accent,var(--ft-blue));color:#fff;box-shadow:0 8px 24px rgba(0,117,191,0.28);}
        .ft-btnPrimary:hover{filter:brightness(1.1);transform:translateY(-1px);}
        .ft-btnGhost{background:rgba(255,255,255,0.04);color:var(--ft-muted);border-color:var(--ft-border);}
        .ft-btnGhost:hover{background:rgba(255,255,255,0.08);color:var(--ft-text);border-color:var(--ft-border2);}
        .ft-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .ft-grid1{display:grid;grid-template-columns:1fr;gap:12px;}
        @media(max-width:760px){.ft-grid2{grid-template-columns:1fr;}}
        .ft-sectionTitle{display:flex;align-items:center;gap:10px;margin:14px 0 10px;}
        .ft-sectionBar{width:3px;height:18px;border-radius:2px;flex-shrink:0;}
        .ft-sectionText{font-weight:900;font-size:12.5px;letter-spacing:0.3px;}
        .ft-sectionSub{font-size:11px;color:var(--ft-muted);margin-top:2px;}
        .ft-sectionRule{flex:1;height:1px;background:var(--ft-border);}
        .ft-field{display:flex;flex-direction:column;gap:5px;}
        .ft-labelRow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
        .ft-label{font-size:11px;font-weight:900;color:var(--ft-soft);letter-spacing:0.3px;text-transform:uppercase;}
        .ft-req{color:#FF6B6B;margin-left:4px;}
        .ft-hint{font-size:10.5px;color:var(--ft-muted);}
        .ft-input{width:100%;padding:9px 12px;border-radius:10px;border:1px solid var(--ft-border);background:rgba(255,255,255,0.04);color:var(--ft-text);outline:none;transition:border-color .14s,box-shadow .14s,background .14s;font-size:13px;box-sizing:border-box;}
        .ft-input::placeholder{color:var(--ft-muted);opacity:0.6;}
        .ft-input:focus{border-color:rgba(0,170,238,0.7);background:rgba(0,100,180,0.08);box-shadow:0 0 0 3px rgba(0,170,238,0.12);}
        .ft-textarea{resize:vertical;min-height:100px;}
        .ft-danger{border-color:rgba(215,50,50,0.5);background:rgba(215,50,50,0.06);}
        .ft-warnBg{border-color:rgba(220,155,30,0.45);background:rgba(220,155,30,0.05);}
        .ft-selectWrap{position:relative;}
        .ft-selectChevron{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--ft-muted);font-size:10px;}
        select.ft-input{appearance:none;}
        .ft-drop{border:1.5px dashed var(--ft-border2);border-radius:12px;background:rgba(255,255,255,0.02);padding:12px;cursor:pointer;transition:all .15s;}
        .ft-drop:hover{border-color:rgba(0,170,238,0.5);background:rgba(0,100,180,0.07);}
        .ft-dropActive{border-color:rgba(0,170,238,0.7);background:rgba(0,100,180,0.1);}
        .ft-dropInner{text-align:center;padding:10px 6px;}
        .ft-paperclip{font-size:22px;}
        .ft-dropText{margin-top:6px;font-weight:900;color:var(--ft-soft);font-size:11.5px;}
        .ft-dropSub{margin-top:4px;color:var(--ft-muted);font-size:10.5px;}
        .ft-previewWrap{position:relative;overflow:hidden;border-radius:10px;border:1px solid var(--ft-border);}
        .ft-preview{width:100%;max-height:210px;object-fit:cover;display:block;}
        .ft-x{position:absolute;right:8px;top:8px;width:28px;height:28px;border-radius:999px;border:none;background:rgba(0,0,0,0.65);color:#fff;cursor:pointer;font-weight:900;font-size:12px;}
        .ft-ppeGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:9px;margin-top:6px;}
        .ft-ppe{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:12px;border:1px solid var(--ft-border);background:rgba(255,255,255,0.03);cursor:pointer;transition:all .15s;text-align:left;}
        .ft-ppe:hover{border-color:rgba(220,155,30,0.45);background:rgba(220,155,30,0.06);}
        .ft-ppeOn{background:rgba(46,185,92,0.1);border-color:rgba(46,185,92,0.45);}
        .ft-ppeIcon{font-size:16px;flex-shrink:0;}
        .ft-box{width:17px;height:17px;flex-shrink:0;border-radius:5px;border:1.5px solid var(--ft-border2);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:10px;color:#fff;}
        .ft-boxOn{border-color:#2EB85C;background:#2EB85C;}
        .ft-ppeLabel{font-size:12px;font-weight:700;color:var(--ft-muted);}
        .ft-ppeOn .ft-ppeLabel{color:#5DD68A;}
        .ft-readingsGrid{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-bottom:4px;}
        .ft-readingCard{background:rgba(255,255,255,0.03);border:1px solid var(--ft-border);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;}
        .ft-readingBefore{border-top:2px solid #DC9B1E;}
        .ft-readingAfter{border-top:2px solid #2EB85C;}
        .ft-readingLabel{font-size:11px;font-weight:900;color:#DC9B1E;letter-spacing:1px;margin-bottom:2px;}
        .ft-readingArrow{font-size:22px;color:var(--ft-muted);text-align:center;}
        .ft-whyChain{display:flex;flex-direction:column;gap:0;}
        .ft-whyRow{display:flex;align-items:flex-start;gap:0;position:relative;}
        .ft-whyRow+.ft-whyRow::before{content:'';position:absolute;left:18px;top:-10px;width:1px;height:10px;background:rgba(215,50,50,0.4);}
        .ft-whyNum{width:36px;height:36px;flex-shrink:0;background:rgba(215,50,50,0.15);border:1px solid rgba(215,50,50,0.35);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#E05555;margin-right:10px;margin-top:21px;}
        .ft-whyInput{flex:1;}
        .ft-whyRow+.ft-whyRow{margin-top:10px;}
      `}</style>

      <div className="ft-wrap">
        <div className="ft-hero">
          <div className="ft-heroLeft">
            <div className="ft-heroLogoWrap">
              <img src={logo} alt="ANDRITZ Clearwater Paper" className="ft-heroLogo"/>
            </div>
            <div className="ft-heroDivider"/>
            <div>
              <div className="ft-heroTitle">Forms & Reports</div>
              <div className="ft-heroSub">{mill?.shortName} · Professional PDF output with ANDRITZ branding</div>
            </div>
          </div>
          <div className="ft-pillRow">
            <div className="ft-pill">Industrial Design</div>
            <div className="ft-pill">Evidence Attachments</div>
            <div className="ft-pill">Standardized PDFs</div>
          </div>
        </div>

        <div className="ft-gridCards">
          {FORM_TYPES.map(form=>(
            <button key={form.id} className="ft-card"
              style={{'--card-accent':form.accent,'--card-glow':form.glow}}
              onClick={()=>setActiveForm(form.id)}>
              <div className="ft-topBar"/>
              <div className="ft-cardIcon">{form.icon}</div>
              <div className="ft-cardTitle">{form.name}</div>
              <div className="ft-cardDesc">{form.description}</div>
              <div className="ft-cardFoot">
                <div className="ft-tag" style={{color:form.accent,borderColor:form.accent+'55',background:form.accent+'18',border:'1px solid'}}>{form.tag}</div>
                <div className="ft-cta" style={{'--card-accent':form.accent}}>Open</div>
              </div>
            </button>
          ))}
        </div>

        {activeForm && Active && (
          <ModalShell mill={mill} title={formMeta?.name||'Form'} tag={formMeta?.tag}
            accent={formMeta?.accent||'#0075BF'} onClose={()=>setActiveForm(null)}>
            <Active mill={mill} onClose={()=>setActiveForm(null)}/>
          </ModalShell>
        )}
      </div>
    </div>
  );
}
