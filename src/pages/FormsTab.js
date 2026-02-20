import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  generateConditionMonitorPDF,
  generatePostMaintenancePDF,
  generateRCFAPDF,
  generateSafetyPDF
} from '../utils/pdfGenerator';

const FORM_TYPES = [
  { id: 'condition-monitor', name: 'Condition Monitor Form', description: 'Record vibration analysis, diagnosis, and recommendations for equipment.', icon: '📊' },
  { id: 'post-maintenance',  name: 'Post Maintenance Form',  description: 'Document completed maintenance activities and post-maintenance readings.', icon: '🔧' },
  { id: 'rcfa',              name: 'RCFA Form',              description: 'Root Cause Failure Analysis with 5-Whys methodology and corrective actions.', icon: '🔍' },
  { id: 'safety',            name: 'Safety Form',            description: 'Job Safety Analysis with PPE checklist, hazard identification, and control measures.', icon: '🛡️' }
];

// Status condition config
const STATUS_OPTIONS = [
  { value: 'acceptable', label: 'Acceptable', bg: '#E8F5E9', border: '#4CAF50', color: '#2E7D32' },
  { value: 'caution',    label: 'Caution',    bg: '#FFF8E1', border: '#FFC107', color: '#B8860B' },
  { value: 'alert',      label: 'Alert',      bg: '#FDECEA', border: '#E53935', color: '#C62828' }
];

const RISK_OPTIONS = [
  { value: 'low',    label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high',   label: 'High Risk' }
];

function Field({ label, children }) {
  return (
    <div>
      <label className="label-cyber">{label}</label>
      {children}
    </div>
  );
}

// Styled dropdown that shows colored background for status
function StatusSelect({ value, onChange }) {
  const opt = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0];
  return (
    <div style={{ position: 'relative' }}>
      <select
        className="input-cyber"
        value={value}
        onChange={onChange}
        style={{
          background: opt.bg,
          border: `1.5px solid ${opt.border}`,
          color: 'var(--blue)',
          fontWeight: 700,
          fontSize: 14,
          appearance: 'none',
          paddingRight: 32
        }}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: opt.color }}>▼</div>
    </div>
  );
}

function RiskSelect({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        className="input-cyber"
        value={value}
        onChange={onChange}
        style={{ color: 'var(--blue)', fontWeight: 700, appearance: 'none', paddingRight: 32 }}
      >
        {RISK_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--blue)' }}>▼</div>
    </div>
  );
}

// Image upload dropzone
function ImageUpload({ label, value, onChange, hint }) {
  const ref = useRef();
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="label-cyber">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `1.5px dashed ${value ? 'var(--blue)' : 'var(--border-mid)'}`,
          borderRadius: 6,
          background: value ? 'var(--blue-tint)' : 'var(--bg-page)',
          cursor: 'pointer',
          overflow: 'hidden',
          minHeight: value ? 'auto' : 70,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        {value ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={value} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              style={{
                position: 'absolute', top: 6, right: 6,
                all: 'unset', cursor: 'pointer',
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                borderRadius: '50%', width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700
              }}
            >✕</button>
          </div>
        ) : (
          <div style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>📎</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5 }}>
              {hint || 'CLICK OR DROP IMAGE HERE'}
            </div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

// Divider with label
function SectionDivider({ label }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 4px' }}>
      <div style={{ width: 4, height: 16, background: 'var(--blue)', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--blue-dark)', letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
    </div>
  );
}

function ConditionMonitorForm({ mill, onClose }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    technicianName: '', woNumber: '', area: '', assetId: '', assetName: '',
    vibrationLevel: '', geLevel: '', temperature: '', diagnosis: '',
    risk: 'high', statusCondition: 'alert', observations: '', recommendation: '',
    trendImage: null, spectrumImage: null, machineImage: null
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const fImg = (k) => (val) => setData(p => ({ ...p, [k]: val }));

  // Status condition determines bg of Vibration Level row
  const statusOpt = STATUS_OPTIONS.find(o => o.value === data.statusCondition) || STATUS_OPTIONS[2];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.technicianName || !data.assetName) { toast.error('Fill required fields'); return; }
    try {
      const id = generateConditionMonitorPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) { toast.error('PDF generation failed'); console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '75vh' }}>
        <div className="form-grid-2">
          <SectionDivider label="General Information" />
          <Field label="Date *"><input className="input-cyber" type="date" value={data.date} onChange={f('date')} required /></Field>
          <Field label="Work Order #"><input className="input-cyber" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Technician Name *"><input className="input-cyber" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required /></Field>
          <Field label="Area / Location"><input className="input-cyber" placeholder="e.g. PM1 > Machine Floor > East Deflaker > MIB" value={data.area} onChange={f('area')} /></Field>
          <Field label="Asset Name *"><input className="input-cyber" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required /></Field>
          <Field label="Asset ID"><input className="input-cyber" placeholder="Asset tag / ID" value={data.assetId} onChange={f('assetId')} /></Field>
          <Field label="Vibration Diagnosis"><input className="input-cyber" placeholder="e.g. Mechanical Looseness" value={data.diagnosis} onChange={f('diagnosis')} /></Field>
          <Field label="Temperature (°F)"><input className="input-cyber" placeholder="e.g. 233" value={data.temperature} onChange={f('temperature')} /></Field>

          {/* Status row - with visual feedback */}
          <Field label="Status Condition">
            <StatusSelect value={data.statusCondition} onChange={f('statusCondition')} />
          </Field>

          {/* Vibration Level - bg matches status condition */}
          <Field label="Vibration Level (G)">
            <input
              className="input-cyber"
              placeholder="e.g. 32.22"
              value={data.vibrationLevel}
              onChange={f('vibrationLevel')}
              style={{ background: statusOpt.bg, border: `1.5px solid ${statusOpt.border}`, color: 'var(--blue)', fontWeight: 700 }}
            />
          </Field>

          <Field label="Risk Level">
            <RiskSelect value={data.risk} onChange={f('risk')} />
          </Field>
          <Field label="gE Level"><input className="input-cyber" placeholder="e.g. 14.4 gE" value={data.geLevel} onChange={f('geLevel')} /></Field>

          <SectionDivider label="Attachments — Trend, Spectrum & Machine Image" />
          <ImageUpload label="Trend Chart (screenshot from software)" value={data.trendImage} onChange={fImg('trendImage')} hint="ATTACH TREND CHART IMAGE" />
          <ImageUpload label="Frequency Spectrum (screenshot from software)" value={data.spectrumImage} onChange={fImg('spectrumImage')} hint="ATTACH SPECTRUM IMAGE" />
          <div style={{ gridColumn: '1 / -1' }}>
            <ImageUpload label="Machine / Equipment Photo" value={data.machineImage} onChange={fImg('machineImage')} hint="ATTACH MACHINE PHOTO" />
          </div>

          <SectionDivider label="Analysis" />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Observations / Description">
              <textarea className="input-cyber" rows={3} placeholder="Describe what was observed..." value={data.observations} onChange={f('observations')} />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Recommendation">
              <textarea className="input-cyber" rows={3} placeholder="Recommended actions (one per line)..." value={data.recommendation} onChange={f('recommendation')} />
            </Field>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--bg-page)', borderRadius: '0 0 10px 10px' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-light)', borderRadius: 4 }}>CANCEL</button>
        <button type="submit" className="btn-primary">GENERATE PDF →</button>
      </div>
    </form>
  );
}

function PostMaintenanceForm({ mill, onClose }) {
  const [data, setData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    technicianName: '', woNumber: '', assetName: '', assetId: '', area: '',
    maintenancePerformed: '', vibrationBefore: '', vibrationAfter: '',
    tempBefore: '', tempAfter: '', partsReplaced: '', notes: ''
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.technicianName || !data.assetName) { toast.error('Fill required fields'); return; }
    try { const id = generatePostMaintenancePDF(data, mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch (err) { toast.error('PDF failed'); console.error(err); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '75vh' }}>
        <div className="form-grid-2">
          <SectionDivider label="General Information" />
          <Field label="Maintenance Date *"><input className="input-cyber" type="date" value={data.maintenanceDate} onChange={f('maintenanceDate')} required /></Field>
          <Field label="Work Order #"><input className="input-cyber" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Technician Name *"><input className="input-cyber" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required /></Field>
          <Field label="Asset Name *"><input className="input-cyber" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required /></Field>
          <Field label="Asset ID"><input className="input-cyber" placeholder="Asset tag" value={data.assetId} onChange={f('assetId')} /></Field>
          <Field label="Area"><input className="input-cyber" placeholder="Location" value={data.area} onChange={f('area')} /></Field>
          <SectionDivider label="Pre / Post Readings" />
          <Field label="Vibration Before (in/s)"><input className="input-cyber" placeholder="Pre-maintenance" value={data.vibrationBefore} onChange={f('vibrationBefore')} /></Field>
          <Field label="Vibration After (in/s)"><input className="input-cyber" placeholder="Post-maintenance" value={data.vibrationAfter} onChange={f('vibrationAfter')} /></Field>
          <Field label="Temperature Before (°F)"><input className="input-cyber" placeholder="Pre-maintenance" value={data.tempBefore} onChange={f('tempBefore')} /></Field>
          <Field label="Temperature After (°F)"><input className="input-cyber" placeholder="Post-maintenance" value={data.tempAfter} onChange={f('tempAfter')} /></Field>
          <SectionDivider label="Details" />
          <div style={{ gridColumn: '1/-1' }}><Field label="Maintenance Performed *"><textarea className="input-cyber" rows={3} placeholder="Describe the maintenance..." value={data.maintenancePerformed} onChange={f('maintenancePerformed')} /></Field></div>
          <div style={{ gridColumn: '1/-1' }}><Field label="Parts / Components Replaced"><textarea className="input-cyber" rows={2} placeholder="List parts replaced..." value={data.partsReplaced} onChange={f('partsReplaced')} /></Field></div>
          <div style={{ gridColumn: '1/-1' }}><Field label="Notes"><textarea className="input-cyber" rows={2} value={data.notes} onChange={f('notes')} /></Field></div>
        </div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--bg-page)', borderRadius: '0 0 10px 10px' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-light)', borderRadius: 4 }}>CANCEL</button>
        <button type="submit" className="btn-primary">GENERATE PDF →</button>
      </div>
    </form>
  );
}

function RCFAForm({ mill, onClose }) {
  const [data, setData] = useState({
    eventDate: new Date().toISOString().split('T')[0], analystName: '', woNumber: '',
    failedComponent: '', area: '', problemDescription: '',
    why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '', correctiveActions: ''
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.analystName) { toast.error('Fill required fields'); return; }
    try { const id = generateRCFAPDF(data, mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch (err) { toast.error('PDF failed'); console.error(err); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '75vh' }}>
        <div className="form-grid-2">
          <SectionDivider label="Event Information" />
          <Field label="Event Date"><input className="input-cyber" type="date" value={data.eventDate} onChange={f('eventDate')} /></Field>
          <Field label="Work Order #"><input className="input-cyber" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Analyst Name *"><input className="input-cyber" placeholder="Full name" value={data.analystName} onChange={f('analystName')} required /></Field>
          <Field label="Area"><input className="input-cyber" value={data.area} onChange={f('area')} /></Field>
          <Field label="Failed Component"><input className="input-cyber" placeholder="Component that failed" value={data.failedComponent} onChange={f('failedComponent')} /></Field>
          <div style={{ gridColumn: '1/-1' }}><Field label="Problem Description"><textarea className="input-cyber" rows={2} value={data.problemDescription} onChange={f('problemDescription')} /></Field></div>
          <SectionDivider label="5 Whys Analysis" />
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ gridColumn: '1/-1' }}>
              <Field label={`Why ${n}`}><input className="input-cyber" placeholder={`Because...`} value={data[`why${n}`]} onChange={f(`why${n}`)} /></Field>
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Root Cause"><textarea className="input-cyber" rows={2} style={{ borderColor: 'var(--red)', background: 'rgba(228,0,43,0.03)' }} value={data.rootCause} onChange={f('rootCause')} /></Field>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Corrective Actions"><textarea className="input-cyber" rows={3} value={data.correctiveActions} onChange={f('correctiveActions')} /></Field>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--bg-page)', borderRadius: '0 0 10px 10px' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-light)', borderRadius: 4 }}>CANCEL</button>
        <button type="submit" className="btn-primary">GENERATE PDF →</button>
      </div>
    </form>
  );
}

function SafetyForm({ mill, onClose }) {
  const ppeItems = [
    { key: 'hardHat', label: '🪖 Hard Hat' }, { key: 'safetyGlasses', label: '🥽 Safety Glasses' },
    { key: 'steelToeBoots', label: '🥾 Steel Toe Boots' }, { key: 'highVisVest', label: '🦺 High Vis Vest' },
    { key: 'hearingProtection', label: '🎧 Hearing Protection' }, { key: 'gloves', label: '🧤 Gloves' },
    { key: 'fallProtection', label: '🪝 Fall Protection' }, { key: 'faceShield', label: '🛡️ Face Shield' }
  ];
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0], employeeName: '', supervisor: '', taskDescription: '', area: '',
    hazards: '', controlMeasures: '',
    ...ppeItems.reduce((a,i) => ({ ...a, [i.key]: false }), {})
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => setData(p => ({ ...p, [k]: !p[k] }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.employeeName) { toast.error('Fill required fields'); return; }
    try { const id = generateSafetyPDF(data, mill.name); toast.success(`PDF: ${id}`); onClose(); }
    catch (err) { toast.error('PDF failed'); console.error(err); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '75vh' }}>
        <div className="form-grid-2">
          <SectionDivider label="Job Information" />
          <Field label="Date *"><input className="input-cyber" type="date" value={data.date} onChange={f('date')} required /></Field>
          <Field label="Area / Location"><input className="input-cyber" value={data.area} onChange={f('area')} /></Field>
          <Field label="Employee Name *"><input className="input-cyber" placeholder="Full name" value={data.employeeName} onChange={f('employeeName')} required /></Field>
          <Field label="Supervisor"><input className="input-cyber" value={data.supervisor} onChange={f('supervisor')} /></Field>
          <div style={{ gridColumn: '1/-1' }}><Field label="Task Description"><textarea className="input-cyber" rows={2} value={data.taskDescription} onChange={f('taskDescription')} /></Field></div>
          <SectionDivider label="PPE Checklist" />
          <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {ppeItems.map(item => (
              <button key={item.key} type="button" onClick={() => toggle(item.key)} style={{
                all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: data[item.key] ? 'rgba(46,139,87,0.1)' : 'var(--bg-page)',
                border: `1.5px solid ${data[item.key] ? '#2E7D32' : 'var(--border-light)'}`,
                borderRadius: 6, transition: 'all 0.2s',
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: data[item.key] ? '#2E7D32' : 'var(--text-muted)'
              }}>
                <div style={{
                  width: 18, height: 18, background: data[item.key] ? '#2E7D32' : 'transparent',
                  border: `1.5px solid ${data[item.key] ? '#2E7D32' : 'var(--text-dim)'}`,
                  borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 11, color: '#fff', transition: 'all 0.2s'
                }}>
                  {data[item.key] && '✓'}
                </div>
                {item.label}
              </button>
            ))}
          </div>
          <SectionDivider label="Hazard Analysis" />
          <div style={{ gridColumn: '1/-1' }}><Field label="Hazards Identified"><textarea className="input-cyber" rows={3} value={data.hazards} onChange={f('hazards')} /></Field></div>
          <div style={{ gridColumn: '1/-1' }}><Field label="Control Measures"><textarea className="input-cyber" rows={3} value={data.controlMeasures} onChange={f('controlMeasures')} /></Field></div>
        </div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--bg-page)', borderRadius: '0 0 10px 10px' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-light)', borderRadius: 4 }}>CANCEL</button>
        <button type="submit" className="btn-primary">GENERATE PDF →</button>
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
  const ActiveFormComponent = activeForm ? FORM_COMPONENTS[activeForm] : null;

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--blue)', marginBottom: 6, textTransform: 'uppercase' }}>Documentation System</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--blue-dark)', letterSpacing: 2 }}>Forms</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
          {mill.shortName} · Select a form to fill out · PDFs auto-generate on submission
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {FORM_TYPES.map(form => (
          <button key={form.id} onClick={() => setActiveForm(form.id)} style={{
            all: 'unset', cursor: 'pointer',
            background: '#fff', border: '1.5px solid var(--border-light)',
            borderRadius: 10, padding: '28px',
            transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
            textAlign: 'left'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,117,190,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--blue-dark), var(--blue))' }} />
            <div style={{ fontSize: 34, marginBottom: 14, marginTop: 4 }}>{form.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--blue-dark)', letterSpacing: 1, marginBottom: 8 }}>{form.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{form.description}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase' }}>FILL FORM →</div>
          </button>
        ))}
      </div>

      {activeForm && ActiveFormComponent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveForm(null)}>
          <div className="modal-content" style={{ maxWidth: 820 }}>
            <div className="modal-header">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 3, color: 'var(--blue)', marginBottom: 4 }}>{mill.shortName} · FORM</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--blue-dark)', letterSpacing: 1 }}>
                  {FORM_TYPES.find(f => f.id === activeForm)?.name}
                </h3>
              </div>
              <button onClick={() => setActiveForm(null)} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1 }}>✕</button>
            </div>
            <ActiveFormComponent mill={mill} onClose={() => setActiveForm(null)} />
          </div>
        </div>
      )}
    </div>
  );
}