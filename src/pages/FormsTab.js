import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  generateConditionMonitorPDF,
  generatePostMaintenancePDF,
  generateRCFAPDF,
  generateSafetyPDF
} from '../utils/pdfGenerator';

const FORM_TYPES = [
  {
    id: 'condition-monitor',
    name: 'Condition Monitor Form',
    description: 'Record vibration analysis, diagnosis, and recommendations for equipment.',
    icon: '📊',
    color: 'var(--accent-cyan)'
  },
  {
    id: 'post-maintenance',
    name: 'Post Maintenance Form',
    description: 'Document completed maintenance activities and post-maintenance readings.',
    icon: '🔧',
    color: 'var(--accent-orange)'
  },
  {
    id: 'rcfa',
    name: 'RCFA Form',
    description: 'Root Cause Failure Analysis with 5-Whys methodology and corrective actions.',
    icon: '🔍',
    color: 'var(--accent-green)'
  },
  {
    id: 'safety',
    name: 'Safety Form',
    description: 'Job Safety Analysis with PPE checklist, hazard identification, and control measures.',
    icon: '🛡️',
    color: 'var(--accent-yellow)'
  }
];

function Field({ label, children }) {
  return (
    <div>
      <label className="label-cyber">{label}</label>
      {children}
    </div>
  );
}

function ConditionMonitorForm({ mill, onClose }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    technicianName: '', woNumber: '', area: '', assetId: '', assetName: '',
    vibrationLevel: '', geLevel: '', temperature: '', diagnosis: '',
    risk: 'medium', statusCondition: 'caution', observations: '', recommendation: ''
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

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
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '70vh' }}>
        <div className="form-grid-2">
          <Field label="Date *"><input className="input-cyber" type="date" value={data.date} onChange={f('date')} required /></Field>
          <Field label="Work Order #"><input className="input-cyber" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Technician Name *"><input className="input-cyber" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required /></Field>
          <Field label="Area"><input className="input-cyber" placeholder="e.g. PM1 > Mezzanine" value={data.area} onChange={f('area')} /></Field>
          <Field label="Asset Name *"><input className="input-cyber" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required /></Field>
          <Field label="Asset ID"><input className="input-cyber" placeholder="Asset tag / ID" value={data.assetId} onChange={f('assetId')} /></Field>
          <Field label="Overall Vibration Level (in/s)"><input className="input-cyber" placeholder="e.g. 0.14" value={data.vibrationLevel} onChange={f('vibrationLevel')} /></Field>
          <Field label="gE Level"><input className="input-cyber" placeholder="e.g. 14.4 gE" value={data.geLevel} onChange={f('geLevel')} /></Field>
          <Field label="Temperature (°F)"><input className="input-cyber" placeholder="e.g. 185" value={data.temperature} onChange={f('temperature')} /></Field>
          <Field label="Risk Level">
            <select className="input-cyber" value={data.risk} onChange={f('risk')}>
              {['low', 'medium', 'high', 'critical'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Status Condition">
            <select className="input-cyber" value={data.statusCondition} onChange={f('statusCondition')}>
              {['good', 'caution', 'warning', 'critical', 'offline'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Vibration Diagnosis"><input className="input-cyber" placeholder="e.g. Mechanical looseness" value={data.diagnosis} onChange={f('diagnosis')} /></Field>
        </div>
        <div style={{ marginTop: 20 }}>
          <Field label="Observations / Description">
            <textarea className="input-cyber" rows={3} placeholder="Describe what was observed..." value={data.observations} onChange={f('observations')} />
          </Field>
        </div>
        <div style={{ marginTop: 16 }}>
          <Field label="Recommendation">
            <textarea className="input-cyber" rows={3} placeholder="Recommended actions..." value={data.recommendation} onChange={f('recommendation')} />
          </Field>
        </div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-dim)', borderRadius: 2 }}>
          CANCEL
        </button>
        <button type="submit" className="btn-cyber">GENERATE PDF →</button>
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
    try {
      const id = generatePostMaintenancePDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) { toast.error('PDF generation failed'); console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '70vh' }}>
        <div className="form-grid-2">
          <Field label="Maintenance Date *"><input className="input-cyber" type="date" value={data.maintenanceDate} onChange={f('maintenanceDate')} required /></Field>
          <Field label="Work Order #"><input className="input-cyber" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Technician Name *"><input className="input-cyber" placeholder="Full name" value={data.technicianName} onChange={f('technicianName')} required /></Field>
          <Field label="Asset Name *"><input className="input-cyber" placeholder="Equipment name" value={data.assetName} onChange={f('assetName')} required /></Field>
          <Field label="Asset ID"><input className="input-cyber" placeholder="Asset tag" value={data.assetId} onChange={f('assetId')} /></Field>
          <Field label="Area"><input className="input-cyber" placeholder="Location" value={data.area} onChange={f('area')} /></Field>
          <Field label="Vibration Before (in/s)"><input className="input-cyber" placeholder="Pre-maintenance reading" value={data.vibrationBefore} onChange={f('vibrationBefore')} /></Field>
          <Field label="Vibration After (in/s)"><input className="input-cyber" placeholder="Post-maintenance reading" value={data.vibrationAfter} onChange={f('vibrationAfter')} /></Field>
          <Field label="Temperature Before (°F)"><input className="input-cyber" placeholder="Pre-maintenance temp" value={data.tempBefore} onChange={f('tempBefore')} /></Field>
          <Field label="Temperature After (°F)"><input className="input-cyber" placeholder="Post-maintenance temp" value={data.tempAfter} onChange={f('tempAfter')} /></Field>
        </div>
        <div style={{ marginTop: 16 }}><Field label="Maintenance Performed *"><textarea className="input-cyber" rows={3} placeholder="Describe maintenance actions taken..." value={data.maintenancePerformed} onChange={f('maintenancePerformed')} required /></Field></div>
        <div style={{ marginTop: 12 }}><Field label="Parts Replaced"><textarea className="input-cyber" rows={2} placeholder="List parts / components replaced..." value={data.partsReplaced} onChange={f('partsReplaced')} /></Field></div>
        <div style={{ marginTop: 12 }}><Field label="Result & Notes"><textarea className="input-cyber" rows={2} placeholder="Outcome and additional notes..." value={data.notes} onChange={f('notes')} /></Field></div>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-dim)', borderRadius: 2 }}>CANCEL</button>
        <button type="submit" className="btn-cyber btn-cyber-orange">GENERATE PDF →</button>
      </div>
    </form>
  );
}

function RCFAForm({ mill, onClose }) {
  const [data, setData] = useState({
    eventDate: new Date().toISOString().split('T')[0],
    analystName: '', woNumber: '', failedComponent: '', assetId: '', area: '',
    problemDescription: '', why1: '', why2: '', why3: '', why4: '', why5: '',
    rootCause: '', correctiveActions: ''
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.analystName || !data.failedComponent) { toast.error('Fill required fields'); return; }
    try {
      const id = generateRCFAPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) { toast.error('PDF generation failed'); console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '70vh' }}>
        <div className="form-grid-2">
          <Field label="Event Date *"><input className="input-cyber" type="date" value={data.eventDate} onChange={f('eventDate')} required /></Field>
          <Field label="Work Order #"><input className="input-cyber" placeholder="WO number" value={data.woNumber} onChange={f('woNumber')} /></Field>
          <Field label="Analyst Name *"><input className="input-cyber" placeholder="Full name" value={data.analystName} onChange={f('analystName')} required /></Field>
          <Field label="Area"><input className="input-cyber" placeholder="Location" value={data.area} onChange={f('area')} /></Field>
          <Field label="Failed Component *"><input className="input-cyber" placeholder="Component that failed" value={data.failedComponent} onChange={f('failedComponent')} required /></Field>
          <Field label="Asset ID"><input className="input-cyber" placeholder="Asset tag" value={data.assetId} onChange={f('assetId')} /></Field>
        </div>
        <div style={{ marginTop: 16 }}><Field label="Problem Description *"><textarea className="input-cyber" rows={3} placeholder="Describe the problem / failure..." value={data.problemDescription} onChange={f('problemDescription')} required /></Field></div>

        <div className="divider-cyber" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--accent-green)', marginBottom: 16 }}>5 WHYS ANALYSIS</div>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} style={{ marginBottom: 12 }}>
            <label className="label-cyber" style={{ color: 'var(--accent-green)' }}>Why {n}</label>
            <input className="input-cyber" placeholder={`Why did this happen? (Level ${n})`} value={data[`why${n}`]} onChange={f(`why${n}`)} />
          </div>
        ))}
        <div className="divider-cyber" />
        <div style={{ marginBottom: 16 }}><Field label="Root Cause *"><input className="input-cyber" placeholder="Identified root cause" value={data.rootCause} onChange={f('rootCause')} required /></Field></div>
        <Field label="Corrective Actions"><textarea className="input-cyber" rows={3} placeholder="Actions to prevent recurrence..." value={data.correctiveActions} onChange={f('correctiveActions')} /></Field>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-dim)', borderRadius: 2 }}>CANCEL</button>
        <button type="submit" className="btn-cyber" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>GENERATE PDF →</button>
      </div>
    </form>
  );
}

function SafetyForm({ mill, onClose }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '', supervisor: '', taskDescription: '', area: '',
    hardHat: false, safetyGlasses: false, steelToeBoots: false, highVisVest: false,
    hearingProtection: false, gloves: false, fallProtection: false, faceShield: false,
    hazards: '', controlMeasures: ''
  });
  const f = (k) => (e) => setData(p => ({ ...p, [k]: e.target.value }));
  const togglePPE = (k) => setData(p => ({ ...p, [k]: !p[k] }));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.employeeName || !data.taskDescription) { toast.error('Fill required fields'); return; }
    try {
      const id = generateSafetyPDF(data, mill.name);
      toast.success(`PDF generated: ${id}`);
      onClose();
    } catch (err) { toast.error('PDF generation failed'); console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '70vh' }}>
        <div className="form-grid-2">
          <Field label="Date *"><input className="input-cyber" type="date" value={data.date} onChange={f('date')} required /></Field>
          <Field label="Area / Location"><input className="input-cyber" placeholder="Work location" value={data.area} onChange={f('area')} /></Field>
          <Field label="Employee Name *"><input className="input-cyber" placeholder="Full name" value={data.employeeName} onChange={f('employeeName')} required /></Field>
          <Field label="Supervisor"><input className="input-cyber" placeholder="Supervisor name" value={data.supervisor} onChange={f('supervisor')} /></Field>
        </div>
        <div style={{ marginTop: 16 }}><Field label="Task / Job Description *"><textarea className="input-cyber" rows={2} placeholder="Describe the task being performed..." value={data.taskDescription} onChange={f('taskDescription')} required /></Field></div>

        <div className="divider-cyber" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--accent-yellow)', marginBottom: 16 }}>PPE CHECKLIST</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
          {ppeItems.map(item => (
            <button key={item.key} type="button" onClick={() => togglePPE(item.key)} style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: data[item.key] ? 'rgba(0,255,136,0.1)' : 'var(--bg-elevated)',
              border: `1px solid ${data[item.key] ? 'var(--accent-green)' : 'var(--border-dim)'}`,
              borderRadius: 2, transition: 'all 0.2s',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: data[item.key] ? 'var(--accent-green)' : 'var(--text-muted)'
            }}>
              <div style={{
                width: 18, height: 18,
                background: data[item.key] ? 'var(--accent-green)' : 'transparent',
                border: `1.5px solid ${data[item.key] ? 'var(--accent-green)' : 'var(--border-glow)'}`,
                borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 11, color: 'var(--bg-void)', transition: 'all 0.2s'
              }}>
                {data[item.key] && '✓'}
              </div>
              {item.label}
            </button>
          ))}
        </div>

        <div className="divider-cyber" />
        <div style={{ marginBottom: 16 }}><Field label="Hazards Identified"><textarea className="input-cyber" rows={3} placeholder="List all identified hazards..." value={data.hazards} onChange={f('hazards')} /></Field></div>
        <Field label="Control Measures"><textarea className="input-cyber" rows={3} placeholder="How will hazards be controlled/mitigated..." value={data.controlMeasures} onChange={f('controlMeasures')} /></Field>
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-dim)', borderRadius: 2 }}>CANCEL</button>
        <button type="submit" className="btn-cyber" style={{ borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}>GENERATE PDF →</button>
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
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 4, color: mill.color, marginBottom: 6, opacity: 0.8 }}>
          DOCUMENTATION SYSTEM
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: 2 }}>Forms</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
          {mill.shortName} · Select a form to fill out. All forms auto-generate PDF on completion.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {FORM_TYPES.map(form => (
          <button key={form.id} onClick={() => setActiveForm(form.id)} style={{
            all: 'unset', cursor: 'pointer',
            background: 'var(--bg-card)',
            border: `1px solid var(--border-dim)`,
            borderRadius: 2,
            padding: '28px',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
            transition: 'all 0.3s',
            position: 'relative', overflow: 'hidden'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = form.color;
              e.currentTarget.style.background = `linear-gradient(135deg, ${form.color}0a 0%, var(--bg-card) 100%)`;
              e.currentTarget.style.boxShadow = `0 0 30px ${form.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-dim)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>{form.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#fff', letterSpacing: 1, marginBottom: 10 }}>
              {form.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              {form.description}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2,
              color: form.color, textTransform: 'uppercase'
            }}>
              FILL FORM <span>→</span>
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 80, height: 80,
              background: `radial-gradient(circle, ${form.color}08 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />
          </button>
        ))}
      </div>

      {/* PDF Generation note */}
      <div style={{
        marginTop: 48,
        padding: '20px 24px',
        background: 'rgba(0,200,255,0.04)',
        border: '1px solid var(--border-dim)',
        borderRadius: 2,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>📄</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 4 }}>
            Auto PDF Generation
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
            All forms automatically generate a branded ANDRITZ PDF upon completion. PDFs include form ID, mill name, date, and all entered data.
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeForm && ActiveFormComponent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveForm(null)}>
          <div className="modal-content" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 3, color: FORM_TYPES.find(f => f.id === activeForm)?.color || mill.color, marginBottom: 4 }}>
                  {mill.shortName} · FORM
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', letterSpacing: 1 }}>
                  {FORM_TYPES.find(f => f.id === activeForm)?.name}
                </h3>
              </div>
              <button onClick={() => setActiveForm(null)} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <ActiveFormComponent mill={mill} onClose={() => setActiveForm(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
