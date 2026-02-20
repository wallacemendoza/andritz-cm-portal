import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MILLS } from '../data/mills';
import WorkOrders from './WorkOrders';
import DrawingsTab from './DrawingsTab';
import FormsTab from './FormsTab';

const tabs = [
  { id: 'overview',    label: 'Overview',      icon: '⬡' },
  { id: 'work-orders', label: 'Work Orders',    icon: '◉' },
  { id: 'drawings',    label: 'Route Drawings', icon: '⊞' },
  { id: 'forms',       label: 'Forms',          icon: '⊟' }
];

export default function MillDashboard() {
  const { millId } = useParams();
  const navigate = useNavigate();
  const mill = MILLS[millId];
  const [activeTab, setActiveTab] = useState('overview');
  if (!mill) return <Navigate to="/" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── white background, NOT dark */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: '#fff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 2px 12px rgba(0,58,112,0.07)'
      }}>
        {/* Thin blue gradient top stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--blue-dark), var(--blue), var(--blue-light))' }} />

        {/* Main nav row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, gap: 0 }}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--text-muted)', letterSpacing: 2,
            padding: '6px 16px 6px 0',
            borderRight: '1px solid var(--border-light)',
            marginRight: 20, transition: 'color 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← FACILITIES
          </button>

          {/* Logo */}
          <img src="/andritz-logo.svg" alt="ANDRITZ" style={{ height: 22, marginRight: 20 }} />

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--border-light)', marginRight: 20 }} />

          {/* Mill identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 7px rgba(29,185,84,0.5)', animation: 'pulse-glow 2.5s infinite' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--blue-dark)', letterSpacing: 1.5, lineHeight: 1.2 }}>{mill.shortName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: 1 }}>{mill.location}</div>
            </div>
          </div>

          {/* Date */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Tab row ── light blue bg */}
        <div style={{ display: 'flex', paddingLeft: 24, background: 'var(--blue-tint)', borderTop: '1px solid var(--border-light)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 22px',
              fontFamily: 'var(--font-display)', fontSize: 9,
              letterSpacing: 1.5, textTransform: 'uppercase',
              color: activeTab === tab.id ? 'var(--blue)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--blue)' : 'transparent'}`,
              background: activeTab === tab.id ? '#fff' : 'transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}>
              <span style={{ opacity: 0.7, fontSize: 11 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── push down for fixed navbar */}
      <div style={{ paddingTop: 116, flex: 1 }}>
        {activeTab === 'overview'    && <OverviewTab mill={mill} onNavigate={setActiveTab} />}
        {activeTab === 'work-orders' && <WorkOrders mill={mill} />}
        {activeTab === 'drawings'    && <DrawingsTab mill={mill} />}
        {activeTab === 'forms'       && <FormsTab mill={mill} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, color = 'var(--blue)' }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color, fontWeight: 700, lineHeight: 1 }}>{value}</div>
          {unit && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginTop: 6 }}>{unit}</div>}
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ mill, onNavigate }) {
  const areas = Object.entries(mill.areas);
  const totalSub = areas.reduce((s, [, a]) => s + Object.keys(a.subareas || {}).length, 0);

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">

      {/* Page title */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--blue)', letterSpacing: 3, marginBottom: 6, textTransform: 'uppercase' }}>Facility Overview</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 32px)', color: 'var(--blue-dark)', letterSpacing: 1 }}>{mill.name}</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>{mill.location} · Condition Monitoring Active</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Areas" value={areas.length} icon="⬡" color="var(--blue)" />
        <StatCard label="Sub-Areas" value={totalSub} icon="◉" color="var(--blue-dark)" />
        <StatCard label="Status" value="LIVE" unit="All sensors online" icon="◎" color="var(--green)" />
        <StatCard label="Last Sync" value="NOW" unit={new Date().toLocaleDateString()} icon="⟳" color="var(--orange)" />
      </div>

      {/* Areas grid */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header" style={{ marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--blue-dark)', letterSpacing: 1.5 }}>MILL AREAS</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {areas.map(([key, area]) => (
            <div key={key} style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 8, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--blue)', marginBottom: 12, letterSpacing: 0.5 }}>{area.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.values(area.subareas || {}).map(sub => (
                  <span key={sub.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', background: 'var(--blue-tint)', border: '1px solid var(--border-light)', padding: '3px 9px', borderRadius: 20, letterSpacing: 0.5 }}>{sub.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--blue-dark)', letterSpacing: 1.5 }}>QUICK ACTIONS</h2>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[{ label: 'New Work Order', tab: 'work-orders' }, { label: 'View Drawings', tab: 'drawings' }, { label: 'Fill a Form', tab: 'forms' }].map(a => (
          <button key={a.label} onClick={() => onNavigate(a.tab)} className="btn-primary">{a.label} →</button>
        ))}
      </div>
    </div>
  );
}