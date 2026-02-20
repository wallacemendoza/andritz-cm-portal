import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MILLS } from '../data/mills';
import WorkOrders from './WorkOrders';
import DrawingsTab from './DrawingsTab';
import FormsTab from './FormsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'work-orders', label: 'Work Orders', icon: '◉' },
  { id: 'drawings', label: 'Route Drawings', icon: '◧' },
  { id: 'forms', label: 'Forms', icon: '◫' }
];

export default function MillDashboard() {
  const { millId } = useParams();
  const navigate = useNavigate();
  const mill = MILLS[millId];
  const [activeTab, setActiveTab] = useState('overview');

  if (!mill) return <Navigate to="/" replace />;

  const goTo = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(5, 9, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-dim)',
      }}>
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, ${mill.color}, ${mill.accentColor}, transparent)`
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '0 24px',
          height: 56
        }}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: 2,
            padding: '8px 16px 8px 0',
            borderRight: '1px solid var(--border-dim)',
            marginRight: 20,
            transition: 'color 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = mill.color}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← FACILITIES
          </button>

          {/* Mill identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: mill.color, boxShadow: `0 0 10px ${mill.color}`,
              animation: 'pulse-glow 2s infinite'
            }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 13,
                color: '#fff', letterSpacing: 2, lineHeight: 1.2
              }}>
                {mill.shortName}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: mill.color, letterSpacing: 2, opacity: 0.8
              }}>
                {mill.location}
              </div>
            </div>
          </div>

          {/* Andritz label */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 11,
            color: 'var(--accent-orange)', letterSpacing: 4, opacity: 0.7
          }}>
            ANDRITZ
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 0, paddingLeft: 24,
          borderTop: '1px solid var(--border-dim)'
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => goTo(tab.id)} style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              fontFamily: 'var(--font-display)', fontSize: 10,
              letterSpacing: 2, textTransform: 'uppercase',
              color: activeTab === tab.id ? mill.color : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? mill.color : 'transparent'}`,
              transition: 'all 0.2s',
              position: 'relative'
            }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ paddingTop: 110, flex: 1 }}>
        {activeTab === 'overview' && <OverviewTab mill={mill} onNavigate={goTo} />}
        {activeTab === 'work-orders' && <WorkOrders mill={mill} />}
        {activeTab === 'drawings' && <DrawingsTab mill={mill} />}
        {activeTab === 'forms' && <FormsTab mill={mill} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <div className="panel" style={{
      padding: '20px 24px',
      clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        fontSize: 60, opacity: 0.04, lineHeight: 1,
        transform: 'translate(10px, 10px)'
      }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9,
        color: color || 'var(--accent-cyan)', letterSpacing: 3,
        textTransform: 'uppercase', marginBottom: 8, opacity: 0.8
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 36,
        color: color || 'var(--accent-cyan)', lineHeight: 1, marginBottom: 4
      }}>{value}</div>
      {unit && <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--text-muted)', letterSpacing: 2
      }}>{unit}</div>}
    </div>
  );
}

function OverviewTab({ mill, onNavigate }) {
  const areas = Object.entries(mill.areas);
  const totalSubareas = areas.reduce((sum, [, a]) => sum + Object.keys(a.subareas || {}).length, 0);

  return (
    <div style={{ padding: '40px 32px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: 4, color: mill.color,
          marginBottom: 8, opacity: 0.8
        }}>
          FACILITY OVERVIEW
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 42px)',
          color: '#fff', letterSpacing: 2, lineHeight: 1.1
        }}>
          {mill.name}
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--text-muted)', marginTop: 8, letterSpacing: 2
        }}>
          {mill.location} · CONDITION MONITORING ACTIVE
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 20, marginBottom: 48
      }}>
        <StatCard label="Monitored Areas" value={areas.length} icon="◈" color={mill.color} />
        <StatCard label="Sub-Areas" value={totalSubareas} icon="◉" color="var(--accent-cyan)" />
        <StatCard label="System Status" value="LIVE" unit="All sensors online" icon="◎" color="var(--accent-green)" />
        <StatCard label="Last Sync" value="NOW" unit={new Date().toLocaleDateString()} icon="⟳" color="var(--accent-orange)" />
      </div>

      {/* Areas grid */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: 3, color: 'var(--text-muted)',
          marginBottom: 16, textTransform: 'uppercase'
        }}>
          Mill Areas
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}>
          {areas.map(([key, area]) => (
            <div key={key} style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-dim)`,
              borderRadius: 2,
              padding: '20px',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              transition: 'border-color 0.25s'
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 14,
                color: mill.color, marginBottom: 12, letterSpacing: 1
              }}>
                {area.name}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.values(area.subareas || {}).map(sub => (
                  <span key={sub.name} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: 'var(--text-muted)', letterSpacing: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-dim)',
                    padding: '3px 8px', borderRadius: 2
                  }}>
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: 3, color: 'var(--text-muted)',
        marginBottom: 16, textTransform: 'uppercase'
      }}>
        Quick Actions
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'New Work Order', tab: 'work-orders', color: mill.color },
          { label: 'View Drawings', tab: 'drawings', color: 'var(--accent-cyan)' },
          { label: 'Fill Form', tab: 'forms', color: 'var(--accent-orange)' }
        ].map(a => (
          <button key={a.label} onClick={() => onNavigate(a.tab)} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 28px',
            border: `1px solid ${a.color}`,
            color: a.color,
            fontFamily: 'var(--font-display)', fontSize: 11,
            letterSpacing: 2, textTransform: 'uppercase',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
            transition: 'all 0.25s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = 'var(--bg-void)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = a.color; }}
          >
            {a.label} →
          </button>
        ))}
      </div>
    </div>
  );
}