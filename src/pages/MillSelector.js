import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MILLS } from '../data/mills';

const mills = Object.values(MILLS);

export default function MillSelector() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAVBAR ── white with blue accent */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 2px 12px rgba(0,58,112,0.07)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--blue-dark), var(--blue), var(--blue-light))' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/andritz-logo.svg" alt="ANDRITZ" style={{ height: 26 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── light blue gradient, NOT dark navy */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 55%, var(--blue-light) 100%)',
        padding: '64px 32px 56px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Blueprint grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '-20%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '0%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,58,112,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(-16px)', transition: 'all 0.7s ease', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 5, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 18 }}>
              Paper Mill Operations · Condition Monitoring
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 48px)',
              fontWeight: 900, letterSpacing: 3,
              color: '#fff', lineHeight: 1.1, marginBottom: 16
            }}>
              CONDITION MONITORING PORTAL
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 40px' }}>
              Select a facility to access dashboards, work orders, route drawings and forms
            </p>

            {/* Stats */}
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, overflow: 'hidden' }}>
              {[{ label: 'Active Mills', val: '3' }, { label: 'Areas Monitored', val: '12+' }, { label: 'System Status', val: 'LIVE' }].map((s, i) => (
                <div key={i} style={{ padding: '16px 36px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARDS SECTION ── white/light background */}
      <div className="grid-bg-light" style={{ flex: 1, padding: '52px 32px 72px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
            <div>
              <div className="section-header">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--blue-dark)', letterSpacing: 1.5 }}>SELECT FACILITY</h2>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
                {mills.length} locations available
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            {mills.map((mill, idx) => (
              <button key={mill.id}
                onClick={() => navigate(`/mill/${mill.id}`)}
                onMouseEnter={() => setHovered(mill.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.55s ease ${idx * 0.1 + 0.15}s, transform 0.55s ease ${idx * 0.1 + 0.15}s`
                }}
              >
                <div style={{
                  background: '#fff',
                  border: `1.5px solid ${hovered === mill.id ? 'var(--blue)' : 'rgba(0,117,190,0.14)'}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: hovered === mill.id ? '0 10px 44px rgba(0,117,190,0.18)' : 'var(--shadow-sm)',
                  transform: hovered === mill.id ? 'translateY(-5px)' : 'translateY(0)',
                  transition: 'all 0.26s ease',
                  textAlign: 'left'
                }}>
                  {/* Top gradient bar */}
                  <div style={{
                    height: 5,
                    background: hovered === mill.id
                      ? 'linear-gradient(90deg, var(--blue-dark), var(--blue), var(--blue-light))'
                      : 'linear-gradient(90deg, var(--blue-dark), var(--blue))',
                    transition: 'all 0.26s ease'
                  }} />

                  <div style={{ padding: '26px 28px' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px rgba(29,185,84,0.5)', animation: 'pulse-glow 2.5s infinite' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase' }}>Online</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>
                        {Object.keys(mill.areas).length} areas
                      </span>
                    </div>

                    {/* Mill name */}
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--blue-dark)', letterSpacing: 1, marginBottom: 4 }}>
                      {mill.shortName}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-body)', marginBottom: 4 }}>{mill.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--blue)', letterSpacing: 1, marginBottom: 24 }}>
                      📍 {mill.location}
                    </div>

                    {/* Area chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                      {Object.values(mill.areas).map(a => (
                        <span key={a.name} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--blue-dark)',
                          background: 'var(--blue-tint)', border: '1px solid rgba(0,117,190,0.18)',
                          padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5
                        }}>{a.name}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(0,117,190,0.09)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: hovered === mill.id ? 'var(--blue)' : 'var(--text-dim)', letterSpacing: 2, textTransform: 'uppercase', transition: 'color 0.2s' }}>
                        Enter Facility
                      </span>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: hovered === mill.id ? 'var(--blue)' : 'var(--blue-tint)',
                        border: '1.5px solid rgba(0,117,190,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.22s ease', fontSize: 15,
                        color: hovered === mill.id ? '#fff' : 'var(--blue)'
                      }}>→</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── subtle blue bottom bar */}
      <div style={{ background: 'var(--blue-dark)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <img src="/andritz-logo.svg" alt="ANDRITZ" style={{ height: 16, filter: 'brightness(0) invert(1)', opacity: 0.65 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
          CONDITION MONITORING SYSTEM · v2.0 · {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}