import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MILLS } from '../data/mills';

const mills = Object.values(MILLS);

function HexRing({ color, size = 120, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      width: size, height: size,
      border: `1px solid ${color}`,
      borderRadius: '50%',
      opacity: 0.15,
      animation: `spin-slow ${8 + delay}s linear infinite`,
      animationDelay: `${delay}s`
    }} />
  );
}

function ParticleField() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: Math.random() * 4 + 3,
    delay: Math.random() * 4
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: '#00c8ff',
          borderRadius: '50%',
          animation: `pulse-glow ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          opacity: 0.3
        }} />
      ))}
    </div>
  );
}

export default function MillSelector() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="grid-bg" style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 24px'
    }}>
      <ParticleField />

      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '8%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-orange), transparent)',
        zIndex: 100
      }} />

      {/* Logo & Title */}
      <div style={{
        textAlign: 'center', marginBottom: 64,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
        transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)'
      }}>
        {/* Rotating rings */}
        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 32px' }}>
          <HexRing color="#00c8ff" size={160} delay={0} />
          <HexRing color="#ff6b35" size={120} delay={2} />
          <HexRing color="#00ff88" size={80} delay={4} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: 60, height: 60,
              background: 'linear-gradient(135deg, var(--accent-orange), #cc4400)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(255,107,53,0.6)'
            }}>
              <span style={{ fontSize: 20, filter: 'brightness(0) invert(1)' }}>⚙</span>
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: 6, color: 'var(--accent-cyan)',
          marginBottom: 8, opacity: 0.7
        }}>
          ANDRITZ GROUP
        </div>
        <h1 className="glow-text" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 900,
          letterSpacing: 4,
          lineHeight: 1,
          marginBottom: 12,
          background: 'linear-gradient(135deg, #fff 0%, var(--accent-cyan) 50%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CONDITION MONITORING
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: 3, color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>
          Paper Mill Operations Portal — Select Facility
        </p>
      </div>

      {/* Mill Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        maxWidth: 1100,
        width: '100%',
      }}>
        {mills.map((mill, idx) => (
          <button
            key={mill.id}
            onClick={() => navigate(`/mill/${mill.id}`)}
            onMouseEnter={() => setHovered(mill.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(40px)',
              transition: `all 0.7s cubic-bezier(0.4,0,0.2,1) ${idx * 0.1 + 0.2}s`
            }}
          >
            <div style={{
              background: hovered === mill.id
                ? `linear-gradient(135deg, rgba(${mill.id === 'clearwater-augusta' ? '0,200,255' : mill.id === 'gpi-macon' ? '255,107,53' : '0,255,136'},0.08) 0%, var(--bg-card) 100%)`
                : 'var(--bg-card)',
              border: `1px solid ${hovered === mill.id ? mill.color : 'var(--border-dim)'}`,
              borderRadius: 2,
              padding: '32px 28px',
              transition: 'all 0.35s ease',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
              boxShadow: hovered === mill.id ? `0 0 40px ${mill.color}22, 0 20px 60px rgba(0,0,0,0.4)` : '0 8px 32px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'left'
            }}>
              {/* Corner accent */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 0, height: 0,
                borderLeft: '20px solid transparent',
                borderTop: `20px solid ${hovered === mill.id ? mill.color : 'var(--border-dim)'}`,
                transition: 'border-color 0.35s ease'
              }} />

              {/* Status dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: mill.color,
                  boxShadow: `0 0 10px ${mill.color}`,
                  animation: 'pulse-glow 2s infinite'
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  letterSpacing: 3, color: mill.color,
                  textTransform: 'uppercase', opacity: 0.8
                }}>
                  ONLINE · ACTIVE
                </span>
              </div>

              {/* Mill name */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 6,
                letterSpacing: 1
              }}>
                {mill.shortName}
              </h2>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                color: 'var(--text-secondary)',
                marginBottom: 4
              }}>
                {mill.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: mill.color,
                marginBottom: 24,
                opacity: 0.7
              }}>
                📍 {mill.location}
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: 16,
                paddingTop: 16,
                borderTop: `1px solid ${hovered === mill.id ? mill.color + '33' : 'var(--border-dim)'}`
              }}>
                {[
                  { label: 'Areas', val: Object.keys(mill.areas).length },
                  { label: 'Sub-Areas', val: Object.values(mill.areas).reduce((a, b) => a + Object.keys(b.subareas || {}).length, 0) },
                  { label: 'Status', val: 'Active' }
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: mill.color }}>
                      {stat.val}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enter CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 20,
                color: mill.color,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: 2,
                opacity: hovered === mill.id ? 1 : 0,
                transform: hovered === mill.id ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'all 0.25s ease'
              }}>
                <span>ENTER FACILITY</span>
                <span>→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: 24, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 9,
        color: 'var(--text-muted)', letterSpacing: 3
      }}>
        ANDRITZ CONDITION MONITORING SYSTEM · v2.0.0 · {new Date().getFullYear()}
      </div>
    </div>
  );
}
