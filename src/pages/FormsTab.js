// FormsTab.js
import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import logo from '../assets/andritz-clearwater-logo.png'; // put your PNG here

import {
  generateConditionMonitorPDF,
  generatePostMaintenancePDF,
  generateRCFAPDF,
  generateSafetyPDF
} from '../utils/pdfGenerator';

const FORM_TYPES = [
  { id: 'condition-monitor', name: 'Condition Monitoring Report', tag: 'CMR', description: 'Vibration diagnosis, evidence screenshots, and action plan.', icon: '📊' },
  { id: 'post-maintenance', name: 'Post Maintenance Form', tag: 'PMF', description: 'Record work performed and pre and post readings.', icon: '🔧' },
  { id: 'rcfa', name: 'RCFA Form', tag: 'RCFA', description: '5 Whys analysis and corrective actions.', icon: '🔍' },
  { id: 'safety', name: 'Safety Form', tag: 'JSA', description: 'Job Safety Analysis with PPE and hazard controls.', icon: '🛡️' }
];

const STATUS_OPTIONS = [
  { value: 'acceptable', label: 'Acceptable', bg: '#E8F5E9', border: '#2E7D32' },
  { value: 'caution', label: 'Caution', bg: '#FFF8E1', border: '#B8860B' },
  { value: 'alert', label: 'Alert', bg: '#FDECEA', border: '#C62828' }
];

const RISK_OPTIONS = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
];

function cx(...xs) { return xs.filter(Boolean).join(' '); }

function Field({ label, required, hint, children }) {
  return (
    <div className="ft-field">
      <div className="ft-labelRow">
        <label className="ft-label">
          {label}{required ? <span className="ft-req">*</span> : null}
        </label>
        {hint ? <div className="ft-hint">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Select({ value, onChange, children, style }) {
  return (
    <div className="ft-selectWrap">
      <select className="ft-input" value={value} onChange={onChange} style={style}>
        {children}
      </select>
      <span className="ft-selectChevron">▼</span>
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  const opt = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[2];
  return (
    <Select
      value={value}
      onChange={onChange}
      style={{
        background: opt.bg,
        borderColor: opt.border,
        fontWeight: 800
      }}
    >
      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

function RiskSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="ft-sectionTitle">
      <div className="ft-sectionBar" />
      <div>
        <div className="ft-sectionText">{title}</div>
        {subtitle ? <div className="ft-sectionSub">{subtitle}</div> : null}
      </div>
      <div className="ft-sectionRule" />
    </div>
  );
}

function ImageUpload({ label, value, onChange, hint }) {
  const ref = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error('Image too large. Max 6 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="ft-field">
      <div className="ft-labelRow">
        <label className="ft-label">{label}</label>
        {hint ? <div className="ft-hint">{hint}</div> : null}
      </div>

      <div
        className={cx('ft-drop', value && 'ft-dropActive')}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <div className="ft-previewWrap">
            <img className="ft-preview" src={value} alt="attachment preview" />
            <button
              type="button"
              className="ft-x"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="ft-dropInner">
            <div className="ft-paperclip">📎</div>
            <div className="ft-dropText">{hint || 'Click to upload or drop an image here'}</div>
            <div className="ft-dropSub">PNG or JPG recommended. Keep it readable.</div>
          </div>
        )}

        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

function ModalShell({ mill, title, tag, onClose, children }) {
  return (
    <div className="ft-modalOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ft-modal">
        <div className="ft-modalHeader">
          <div className="ft-modalHeaderLeft">
            <div className="ft-brand">
              <img className="ft-brandLogo" src={logo} alt="ANDRITZ Clearwater Paper" />
              <div className="ft-brandMeta">
                <div className="ft-brandLine1">ANDRITZ Condition Monitoring System</div>
                <div className="ft-brandLine2">{mill?.shortName || ''}{tag ? ` · ${tag}` : ''}</div>
              </div>
            </div>
            <div className="ft-modalTitle">
              <div className="ft-modalTitleMain">{title}</div>
              <div className="ft-modalTitleSub">Fill the form completely. Attach evidence where applicable.</div>
            </div>
          </div>

          <button type="button" className="ft-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ConditionMonitorForm({ mill, onClose }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    technicianName: '',
    woNumber: '',
    area: '',
    assetId: '',
    assetName: '',
    vibrationLevel: '',
    geLevel: '',
    temperature: '',
    diagnosis: '',
    risk: 'high',
    statusCondition: 'alert',
    observations: '',
    recommendation: '',
    trendImage: null,
    spectrumImage: null,
    machineImage: null
  });

  const statusOpt = useMemo(
    () => STATUS_OPTIONS.find(o => o.value === data.statusCondition) || STATUS_OPTIONS[2],
    [data.statusCondition]
  );

  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const fImg = (k) => (val) => setData(p => ({ ...p, [k]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.technicianName?.trim()) return toast.error('Technician Name is required');
    if (!data.assetName?.trim()) return toast.error('Asset Name is required');
    if (!data.area?.trim()) return toast.error('Location is required');
    if (!data.diagnosis?.trim()) return toast.error('Vibration Diagnosis is required');
    if (!data.recommendation?.trim()) return toast.error('Recommendation is required');

    try {
      const id = generateConditionMonitorPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="General Information" subtitle="Asset identification and condition status." />

        <div className="ft-grid2">
          <Field label="Date" required>
            <input className="ft-input" type="date" value={data.date} onChange={f('date')} required />
          </Field>

          <Field label="Work Order" hint="Optional">
            <input className="ft-input" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} />
          </Field>

          <Field label="Technician Name" required>
            <input className="ft-input" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required />
          </Field>

          <Field label="Location" required hint="Use the same hierarchy as the PDF">
            <input className="ft-input" placeholder="PM1 > Machine Floor > East Deflaker > MIB" value={data.area} onChange={f('area')} required />
          </Field>

          <Field label="Asset Name" required>
            <input className="ft-input" placeholder="Motor, Pump, Fan, Gearbox..." value={data.assetName} onChange={f('assetName')} required />
          </Field>

          <Field label="Asset ID" hint="Optional">
            <input className="ft-input" placeholder="Tag or ID" value={data.assetId} onChange={f('assetId')} />
          </Field>

          <Field label="Vibration Diagnosis" required>
            <input className="ft-input" placeholder="Mechanical looseness, bearing defect..." value={data.diagnosis} onChange={f('diagnosis')} required />
          </Field>

          <Field label="Temperature (F)" hint="Optional">
            <input className="ft-input" placeholder="233" value={data.temperature} onChange={f('temperature')} />
          </Field>

          <Field label="Status Condition" required>
            <StatusSelect value={data.statusCondition} onChange={f('statusCondition')} />
          </Field>

          <Field label="Vibration Level (G)" hint="Matches status background">
            <input
              className="ft-input"
              placeholder="32.22"
              value={data.vibrationLevel}
              onChange={f('vibrationLevel')}
              style={{ background: statusOpt.bg, borderColor: statusOpt.border, fontWeight: 900 }}
            />
          </Field>

          <Field label="Risk Level" required>
            <RiskSelect value={data.risk} onChange={f('risk')} />
          </Field>

          <Field label="gE Level" hint="Optional">
            <input className="ft-input" placeholder="14.4" value={data.geLevel} onChange={f('geLevel')} />
          </Field>
        </div>

        <SectionTitle title="Evidence Attachments" subtitle="Trend, spectrum, and machine photo." />

        <div className="ft-grid2">
          <ImageUpload
            label="Trend Chart"
            value={data.trendImage}
            onChange={fImg('trendImage')}
            hint="Trend screenshot from software"
          />
          <ImageUpload
            label="Frequency Spectrum"
            value={data.spectrumImage}
            onChange={fImg('spectrumImage')}
            hint="Spectrum screenshot from software"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <ImageUpload
              label="Machine Photo"
              value={data.machineImage}
              onChange={fImg('machineImage')}
              hint="Clear picture of the asset"
            />
          </div>
        </div>

        <SectionTitle title="Analysis and Recommendation" subtitle="Write it like a report." />

        <div className="ft-grid1">
          <Field label="Description" hint="What you saw and why it matters">
            <textarea
              className="ft-input ft-textarea"
              rows={5}
              placeholder="Example: Vibration increased 841% compared to prior reading. Looseness symptoms observed..."
              value={data.observations}
              onChange={f('observations')}
            />
          </Field>

          <Field label="Recommendation" required hint="One action per line">
            <textarea
              className="ft-input ft-textarea"
              rows={5}
              placeholder="Motor bearing relubrication must be done immediately.
Schedule motor replacement at the earliest opportunity.
Evaluate coupling condition."
              value={data.recommendation}
              onChange={f('recommendation')}
              required
            />
          </Field>
        </div>
      </div>

      <div className="ft-modalFooter">
        <div className="ft-footLeft">
          <div className="ft-footNote">Confidential. Output aligns to the CMR PDF layout.</div>
        </div>
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary">Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

function PostMaintenanceForm({ mill, onClose }) {
  const [data, setData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    technicianName: '',
    woNumber: '',
    assetName: '',
    assetId: '',
    area: '',
    maintenancePerformed: '',
    vibrationBefore: '',
    vibrationAfter: '',
    tempBefore: '',
    tempAfter: '',
    partsReplaced: '',
    notes: ''
  });

  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.technicianName?.trim()) return toast.error('Technician Name is required');
    if (!data.assetName?.trim()) return toast.error('Asset Name is required');
    if (!data.maintenancePerformed?.trim()) return toast.error('Maintenance Performed is required');

    try {
      const id = generatePostMaintenancePDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="General Information" />

        <div className="ft-grid2">
          <Field label="Maintenance Date" required>
            <input className="ft-input" type="date" value={data.maintenanceDate} onChange={f('maintenanceDate')} required />
          </Field>
          <Field label="Work Order" hint="Optional">
            <input className="ft-input" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} />
          </Field>
          <Field label="Technician Name" required>
            <input className="ft-input" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required />
          </Field>
          <Field label="Asset Name" required>
            <input className="ft-input" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required />
          </Field>
          <Field label="Asset ID" hint="Optional">
            <input className="ft-input" placeholder="Tag or ID" value={data.assetId} onChange={f('assetId')} />
          </Field>
          <Field label="Location" hint="Optional">
            <input className="ft-input" placeholder="Area or line" value={data.area} onChange={f('area')} />
          </Field>
        </div>

        <SectionTitle title="Pre and Post Readings" />

        <div className="ft-grid2">
          <Field label="Vibration Before (in/s)">
            <input className="ft-input" placeholder="Pre" value={data.vibrationBefore} onChange={f('vibrationBefore')} />
          </Field>
          <Field label="Vibration After (in/s)">
            <input className="ft-input" placeholder="Post" value={data.vibrationAfter} onChange={f('vibrationAfter')} />
          </Field>
          <Field label="Temperature Before (F)">
            <input className="ft-input" placeholder="Pre" value={data.tempBefore} onChange={f('tempBefore')} />
          </Field>
          <Field label="Temperature After (F)">
            <input className="ft-input" placeholder="Post" value={data.tempAfter} onChange={f('tempAfter')} />
          </Field>
        </div>

        <SectionTitle title="Maintenance Details" />

        <div className="ft-grid1">
          <Field label="Maintenance Performed" required>
            <textarea className="ft-input ft-textarea" rows={4} value={data.maintenancePerformed} onChange={f('maintenancePerformed')} required />
          </Field>
          <Field label="Parts Replaced" hint="Optional">
            <textarea className="ft-input ft-textarea" rows={3} value={data.partsReplaced} onChange={f('partsReplaced')} />
          </Field>
          <Field label="Notes" hint="Optional">
            <textarea className="ft-input ft-textarea" rows={3} value={data.notes} onChange={f('notes')} />
          </Field>
        </div>
      </div>

      <div className="ft-modalFooter">
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary">Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

function RCFAForm({ mill, onClose }) {
  const [data, setData] = useState({
    eventDate: new Date().toISOString().split('T')[0],
    analystName: '',
    woNumber: '',
    failedComponent: '',
    area: '',
    problemDescription: '',
    why1: '', why2: '', why3: '', why4: '', why5: '',
    rootCause: '',
    correctiveActions: ''
  });

  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.analystName?.trim()) return toast.error('Analyst Name is required');
    if (!data.problemDescription?.trim()) return toast.error('Problem Description is required');
    if (!data.rootCause?.trim()) return toast.error('Root Cause is required');
    if (!data.correctiveActions?.trim()) return toast.error('Corrective Actions is required');

    try {
      const id = generateRCFAPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="Event Information" />
        <div className="ft-grid2">
          <Field label="Event Date" required>
            <input className="ft-input" type="date" value={data.eventDate} onChange={f('eventDate')} required />
          </Field>
          <Field label="Work Order" hint="Optional">
            <input className="ft-input" value={data.woNumber} onChange={f('woNumber')} />
          </Field>
          <Field label="Analyst Name" required>
            <input className="ft-input" placeholder="Full name" value={data.analystName} onChange={f('analystName')} required />
          </Field>
          <Field label="Location" hint="Optional">
            <input className="ft-input" value={data.area} onChange={f('area')} />
          </Field>
          <Field label="Failed Component" hint="Optional">
            <input className="ft-input" value={data.failedComponent} onChange={f('failedComponent')} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Problem Description" required>
              <textarea className="ft-input ft-textarea" rows={3} value={data.problemDescription} onChange={f('problemDescription')} required />
            </Field>
          </div>
        </div>

        <SectionTitle title="5 Whys" subtitle="Short, direct, and testable statements." />
        <div className="ft-grid1">
          {[1,2,3,4,5].map(n => (
            <Field key={n} label={`Why ${n}`} hint={n === 1 ? 'Start with the observed failure mode' : undefined}>
              <input className="ft-input" value={data[`why${n}`]} onChange={f(`why${n}`)} />
            </Field>
          ))}
        </div>

        <SectionTitle title="Outcome" />
        <div className="ft-grid1">
          <Field label="Root Cause" required>
            <textarea className="ft-input ft-textarea ft-danger" rows={3} value={data.rootCause} onChange={f('rootCause')} required />
          </Field>
          <Field label="Corrective Actions" required hint="One action per line">
            <textarea className="ft-input ft-textarea" rows={4} value={data.correctiveActions} onChange={f('correctiveActions')} required />
          </Field>
        </div>
      </div>

      <div className="ft-modalFooter">
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary">Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

function SafetyForm({ mill, onClose }) {
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

  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    supervisor: '',
    taskDescription: '',
    area: '',
    hazards: '',
    controlMeasures: '',
    ...ppeItems.reduce((a, i) => ({ ...a, [i.key]: false }), {})
  });

  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => setData(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.employeeName?.trim()) return toast.error('Employee Name is required');
    if (!data.taskDescription?.trim()) return toast.error('Task Description is required');
    if (!data.hazards?.trim()) return toast.error('Hazards Identified is required');
    if (!data.controlMeasures?.trim()) return toast.error('Control Measures is required');

    try {
      const id = generateSafetyPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="ft-modalBody">
        <SectionTitle title="Job Information" />

        <div className="ft-grid2">
          <Field label="Date" required>
            <input className="ft-input" type="date" value={data.date} onChange={f('date')} required />
          </Field>
          <Field label="Location" hint="Optional">
            <input className="ft-input" value={data.area} onChange={f('area')} />
          </Field>
          <Field label="Employee Name" required>
            <input className="ft-input" placeholder="Full name" value={data.employeeName} onChange={f('employeeName')} required />
          </Field>
          <Field label="Supervisor" hint="Optional">
            <input className="ft-input" value={data.supervisor} onChange={f('supervisor')} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Task Description" required>
              <textarea className="ft-input ft-textarea" rows={3} value={data.taskDescription} onChange={f('taskDescription')} required />
            </Field>
          </div>
        </div>

        <SectionTitle title="PPE Checklist" subtitle="Select all required PPE for this task." />

        <div className="ft-ppeGrid">
          {ppeItems.map(item => {
            const checked = !!data[item.key];
            return (
              <button
                key={item.key}
                type="button"
                className={cx('ft-ppe', checked && 'ft-ppeOn')}
                onClick={() => toggle(item.key)}
              >
                <span className={cx('ft-box', checked && 'ft-boxOn')}>{checked ? '✓' : ''}</span>
                <span className="ft-ppeLabel">{item.label}</span>
              </button>
            );
          })}
        </div>

        <SectionTitle title="Hazard Analysis" />

        <div className="ft-grid1">
          <Field label="Hazards Identified" required>
            <textarea className="ft-input ft-textarea" rows={4} value={data.hazards} onChange={f('hazards')} required />
          </Field>
          <Field label="Control Measures" required>
            <textarea className="ft-input ft-textarea" rows={4} value={data.controlMeasures} onChange={f('controlMeasures')} required />
          </Field>
        </div>
      </div>

      <div className="ft-modalFooter">
        <div className="ft-footRight">
          <button type="button" className="ft-btn ft-btnGhost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ft-btn ft-btnPrimary">Generate PDF</button>
        </div>
      </div>
    </form>
  );
}

const FORM_COMPONENTS = {
  'condition-monitor': ConditionMonitorForm,
  'post-maintenance': PostMaintenanceForm,
  'rcfa': RCFAForm,
  'safety': SafetyForm
};

export default function FormsTab({ mill }) {
  const [activeForm, setActiveForm] = useState(null);
  const formMeta = FORM_TYPES.find(f => f.id === activeForm);
  const Active = activeForm ? FORM_COMPONENTS[activeForm] : null;

  return (
    <div className="ft-page">
      {/* Local styles, so you do not need to touch global CSS */}
      <style>{`
        :root{
          --ft-blue:#0075BF;
          --ft-blueDark:#003A70;
          --ft-bg:#DCE9F3;
          --ft-card:#FFFFFF;
          --ft-soft:#EEF6FC;
          --ft-border:#B9CDDC;
          --ft-border2:#D2E1EB;
          --ft-text:#283241;
          --ft-muted:#465569;
          --ft-shadow: 0 18px 45px rgba(0,58,112,0.14);
          --ft-radius:14px;
        }
        .ft-page{ padding:28px; background:linear-gradient(180deg,var(--ft-bg),#ffffff 65%); min-height: calc(100vh - 60px); }
        .ft-wrap{ max-width:1200px; margin:0 auto; }

        .ft-hero{
          background: linear-gradient(90deg, rgba(0,58,112,0.92), rgba(0,117,191,0.86));
          border-radius: var(--ft-radius);
          box-shadow: var(--ft-shadow);
          color:#fff;
          padding:22px 22px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          border: 1px solid rgba(255,255,255,0.16);
        }
        .ft-heroLeft{ display:flex; align-items:center; gap:16px; }
        .ft-heroLogo{
          width:160px; height:auto; background:#fff; border-radius:12px; padding:10px 12px;
          border: 1px solid rgba(255,255,255,0.35);
        }
        .ft-heroTitle{ font-size:22px; font-weight:900; letter-spacing:0.3px; margin:0; }
        .ft-heroSub{ margin-top:4px; font-size:13px; opacity:0.92; }
        .ft-pillRow{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
        .ft-pill{
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding:8px 12px;
          font-size:12px;
          letter-spacing:0.2px;
        }

        .ft-gridCards{ margin-top:18px; display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:16px; }
        .ft-card{
          background: var(--ft-card);
          border: 1px solid var(--ft-border2);
          border-radius: var(--ft-radius);
          padding:18px;
          text-align:left;
          cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          position:relative;
          overflow:hidden;
        }
        .ft-card:hover{ transform: translateY(-3px); box-shadow: 0 18px 45px rgba(0,117,191,0.14); border-color: rgba(0,117,191,0.55); }
        .ft-topBar{ position:absolute; left:0; top:0; right:0; height:4px; background: linear-gradient(90deg, var(--ft-blueDark), var(--ft-blue)); }
        .ft-cardIcon{ font-size:30px; margin-top:6px; }
        .ft-cardTitle{ margin-top:10px; font-weight:900; color: var(--ft-blueDark); }
        .ft-cardDesc{ margin-top:8px; color: var(--ft-muted); line-height:1.5; }
        .ft-cardFoot{ margin-top:14px; display:flex; align-items:center; justify-content:space-between; }
        .ft-tag{
          font-weight:900; font-size:11px; letter-spacing:1px;
          color: var(--ft-blue);
          background: rgba(0,117,191,0.08);
          border: 1px solid rgba(0,117,191,0.22);
          border-radius: 999px;
          padding:6px 10px;
        }
        .ft-cta{ font-weight:900; font-size:11px; letter-spacing:1px; color: var(--ft-blueDark); }

        /* Modal */
        .ft-modalOverlay{
          position:fixed; inset:0;
          background: rgba(10,20,35,0.55);
          display:flex; align-items:center; justify-content:center;
          padding: 18px;
          z-index: 9999;
        }
        .ft-modal{
          width:min(980px, 100%);
          background:#fff;
          border-radius: 18px;
          box-shadow: 0 28px 90px rgba(0,0,0,0.35);
          overflow:hidden;
          border: 1px solid rgba(255,255,255,0.35);
        }
        .ft-modalHeader{
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:16px 18px;
          background: linear-gradient(180deg, #ffffff, var(--ft-soft));
          border-bottom: 1px solid var(--ft-border2);
          gap:16px;
        }
        .ft-modalHeaderLeft{ display:flex; flex-direction:column; gap:10px; }
        .ft-brand{ display:flex; align-items:center; gap:12px; }
        .ft-brandLogo{ width:150px; height:auto; background:#fff; border-radius:12px; padding:8px 10px; border: 1px solid var(--ft-border2); }
        .ft-brandMeta{ display:flex; flex-direction:column; gap:2px; }
        .ft-brandLine1{ font-size:11px; letter-spacing:1px; font-weight:900; color: var(--ft-blueDark); text-transform:uppercase; }
        .ft-brandLine2{ font-size:12px; color: var(--ft-blue); font-weight:900; }
        .ft-modalTitleMain{ font-size:16px; font-weight:1000; color: var(--ft-blueDark); }
        .ft-modalTitleSub{ margin-top:2px; font-size:12px; color: var(--ft-muted); }
        .ft-close{
          cursor:pointer;
          border:none;
          background: transparent;
          font-size:22px;
          color: var(--ft-muted);
          padding: 4px 8px;
          border-radius: 10px;
        }
        .ft-close:hover{ background: rgba(0,117,191,0.08); color: var(--ft-blueDark); }

        .ft-modalBody{ padding: 16px 18px 6px; max-height: 72vh; overflow:auto; background:#fff; }
        .ft-modalFooter{
          padding: 12px 18px;
          background: linear-gradient(180deg, #ffffff, var(--ft-soft));
          border-top: 1px solid var(--ft-border2);
          display:flex; justify-content:space-between; align-items:center; gap:14px;
        }
        .ft-footNote{ font-size:12px; color: var(--ft-muted); }
        .ft-footRight{ display:flex; gap:10px; }

        .ft-btn{
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 1000;
          letter-spacing: 0.4px;
          cursor:pointer;
          border: 1px solid transparent;
          font-size: 13px;
        }
        .ft-btnPrimary{
          background: linear-gradient(90deg, var(--ft-blueDark), var(--ft-blue));
          color:#fff;
          box-shadow: 0 10px 26px rgba(0,117,191,0.22);
        }
        .ft-btnPrimary:hover{ filter: brightness(1.02); }
        .ft-btnGhost{
          background:#fff;
          color: var(--ft-blueDark);
          border-color: var(--ft-border);
        }
        .ft-btnGhost:hover{ background: rgba(0,117,191,0.06); border-color: rgba(0,117,191,0.35); }

        /* Form */
        .ft-grid2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ft-grid1{ display:grid; grid-template-columns: 1fr; gap: 12px; }
        @media (max-width: 760px){ .ft-grid2{ grid-template-columns: 1fr; } }

        .ft-sectionTitle{
          display:flex; align-items:center; gap:10px;
          margin: 12px 0 10px;
        }
        .ft-sectionBar{ width:4px; height:18px; border-radius:3px; background: var(--ft-blue); }
        .ft-sectionText{ font-weight:1000; color: var(--ft-blueDark); letter-spacing:0.3px; }
        .ft-sectionSub{ font-size:12px; color: var(--ft-muted); margin-top:2px; }
        .ft-sectionRule{ flex:1; height:1px; background: var(--ft-border2); }

        .ft-field{ display:flex; flex-direction:column; gap:6px; }
        .ft-labelRow{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
        .ft-label{ font-size:12px; font-weight:1000; color: var(--ft-blueDark); letter-spacing:0.2px; }
        .ft-req{ color:#E4002B; margin-left:6px; }
        .ft-hint{ font-size:11px; color: var(--ft-muted); }

        .ft-input{
          width:100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--ft-border2);
          background: #fff;
          color: var(--ft-text);
          outline: none;
          transition: border-color .14s ease, box-shadow .14s ease;
          font-size: 13px;
        }
        .ft-input:focus{
          border-color: rgba(0,117,191,0.65);
          box-shadow: 0 0 0 4px rgba(0,117,191,0.12);
        }
        .ft-textarea{ resize: vertical; min-height: 110px; }
        .ft-danger{ border-color: rgba(228,0,43,0.35); background: rgba(228,0,43,0.04); }

        .ft-selectWrap{ position:relative; }
        .ft-selectChevron{
          position:absolute;
          right:12px;
          top:50%;
          transform: translateY(-50%);
          pointer-events:none;
          color: var(--ft-muted);
          font-size:11px;
        }

        .ft-drop{
          border: 1.5px dashed var(--ft-border);
          border-radius: 14px;
          background: #fff;
          padding: 12px;
          cursor:pointer;
          transition: border-color .14s ease, box-shadow .14s ease, background .14s ease;
        }
        .ft-drop:hover{ border-color: rgba(0,117,191,0.55); box-shadow: 0 0 0 4px rgba(0,117,191,0.10); }
        .ft-dropActive{ border-color: rgba(0,117,191,0.75); background: rgba(0,117,191,0.05); }
        .ft-dropInner{ text-align:center; padding: 10px 6px; }
        .ft-paperclip{ font-size:22px; }
        .ft-dropText{ margin-top:6px; font-weight:1000; color: var(--ft-blueDark); font-size:12px; }
        .ft-dropSub{ margin-top:4px; color: var(--ft-muted); font-size:11px; }

        .ft-previewWrap{ position:relative; overflow:hidden; border-radius: 12px; border: 1px solid var(--ft-border2); }
        .ft-preview{ width:100%; max-height: 220px; object-fit: cover; display:block; }
        .ft-x{
          position:absolute; right:10px; top:10px;
          width:30px; height:30px;
          border-radius: 999px;
          border:none;
          background: rgba(0,0,0,0.55);
          color:#fff;
          cursor:pointer;
          font-weight:1000;
        }

        .ft-ppeGrid{
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 10px;
          margin-top: 6px;
        }
        .ft-ppe{
          display:flex; align-items:center; gap:10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid var(--ft-border2);
          background: #fff;
          cursor:pointer;
          transition: background .14s ease, border-color .14s ease, transform .14s ease;
          text-align:left;
        }
        .ft-ppe:hover{ transform: translateY(-1px); border-color: rgba(0,117,191,0.35); }
        .ft-ppeOn{ background: rgba(46,125,50,0.08); border-color: rgba(46,125,50,0.35); }
        .ft-box{
          width:18px; height:18px;
          border-radius: 6px;
          border: 1.5px solid rgba(70,85,105,0.45);
          display:flex; align-items:center; justify-content:center;
          font-weight:1000;
          color:#fff;
          background: transparent;
        }
        .ft-boxOn{ border-color: rgba(46,125,50,0.6); background: #2E7D32; }
        .ft-ppeLabel{ font-size:13px; font-weight:900; color: var(--ft-muted); }
        .ft-ppeOn .ft-ppeLabel{ color: #2E7D32; }
      `}</style>

      <div className="ft-wrap">
        <div className="ft-hero">
          <div className="ft-heroLeft">
            <img src={logo} alt="ANDRITZ Clearwater Paper" className="ft-heroLogo" />
            <div>
              <div className="ft-heroTitle">Forms and Reports</div>
              <div className="ft-heroSub">
                {mill?.shortName} · PDF output matches the Condition Monitoring Report format.
              </div>
            </div>
          </div>
          <div className="ft-pillRow">
            <div className="ft-pill">Professional formatting</div>
            <div className="ft-pill">Evidence attachments</div>
            <div className="ft-pill">Standardized outputs</div>
          </div>
        </div>

        <div className="ft-gridCards">
          {FORM_TYPES.map(form => (
            <button key={form.id} className="ft-card" onClick={() => setActiveForm(form.id)}>
              <div className="ft-topBar" />
              <div className="ft-cardIcon">{form.icon}</div>
              <div className="ft-cardTitle">{form.name}</div>
              <div className="ft-cardDesc">{form.description}</div>
              <div className="ft-cardFoot">
                <div className="ft-tag">{form.tag}</div>
                <div className="ft-cta">Open</div>
              </div>
            </button>
          ))}
        </div>

        {activeForm && Active && (
          <ModalShell
            mill={mill}
            title={formMeta?.name || 'Form'}
            tag={formMeta?.tag}
            onClose={() => setActiveForm(null)}
          >
            <Active mill={mill} onClose={() => setActiveForm(null)} />
          </ModalShell>
        )}
      </div>
    </div>
  );
}