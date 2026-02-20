import React, { useState } from 'react';

// Pulp 3 - 5th Floor SVG map based on the uploaded PDF
function Pulp3FifthFloorMap() {
  const [tooltip, setTooltip] = useState(null);

  const assets = [
    { id: '55177', x: 185, y: 110, inRoute: true, label: 'MIXER' },
    { id: '55172', x: 225, y: 130, inRoute: true },
    { id: '55292', x: 225, y: 215, inRoute: true },
    { id: '2184M', x: 140, y: 255, inRoute: false, isMotor: true },
    { id: '2183M', x: 230, y: 310, inRoute: true, isMotor: true },
    { id: '57164', x: 230, y: 335, inRoute: true },
    { id: '57126', x: 300, y: 305, inRoute: true },
    { id: '57128', x: 330, y: 305, inRoute: true },
    { id: '57212', x: 360, y: 340, inRoute: true },
    { id: '57205', x: 370, y: 270, inRoute: true },
    { id: '57201', x: 310, y: 260, inRoute: true },
    { id: '57173', x: 310, y: 200, inRoute: true },
    { id: '57177', x: 310, y: 140, inRoute: true },
    { id: '57175', x: 380, y: 160, inRoute: true },
    { id: '57171', x: 390, y: 205, inRoute: true },
    { id: '57216', x: 445, y: 155, inRoute: false },
    { id: '?', x: 490, y: 140, inRoute: false, isMissing: true },
    { id: '2182M', x: 530, y: 165, inRoute: false, isMotor: true },
    { id: '57214', x: 465, y: 200, inRoute: true },
    { id: '58198', x: 540, y: 200, inRoute: true, label: 'MIXER' },
    { id: '58286', x: 590, y: 230, inRoute: false, label: 'MIXER' },
    { id: '58497', x: 660, y: 285, inRoute: true },
  ];

  const arrows = [
    { x1: 160, y1: 135, x2: 190, y2: 115 },
    { x1: 200, y1: 120, x2: 215, y2: 130 },
    { x1: 225, y1: 150, x2: 225, y2: 200 },
    { x1: 220, y1: 220, x2: 175, y2: 250 },
    { x1: 240, y1: 310, x2: 295, y2: 305 },
    { x1: 315, y1: 310, x2: 330, y2: 308 },
    { x1: 350, y1: 330, x2: 365, y2: 275 },
    { x1: 368, y1: 265, x2: 315, y2: 262 },
    { x1: 310, y1: 255, x2: 310, y2: 210 },
    { x1: 310, y1: 195, x2: 310, y2: 150 },
    { x1: 315, y1: 140, x2: 370, y2: 163 },
    { x1: 385, y1: 165, x2: 388, y2: 198 },
    { x1: 393, y1: 208, x2: 460, y2: 202 },
    { x1: 470, y1: 197, x2: 535, y2: 202 },
    { x1: 555, y1: 205, x2: 582, y2: 228 },
    { x1: 595, y1: 240, x2: 658, y2: 282 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg width="760" height="480" viewBox="0 0 760 480" style={{
        background: '#fff', borderRadius: 2, display: 'block',
        minWidth: 700
      }}>
        {/* Grid */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,117,190,0.06)" strokeWidth="0.5" />
          </pattern>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,117,190,0.6)" />
          </marker>
        </defs>
        <rect width="760" height="480" fill="url(#grid)" />

        {/* Floor boundary */}
        <rect x="60" y="60" width="680" height="360" fill="none" stroke="rgba(0,117,190,0.2)" strokeWidth="1.5" strokeDasharray="4,4" />

        {/* Stairs indicators */}
        {/* Left staircase */}
        <rect x="60" y="350" width="50" height="60" fill="rgba(255,45,85,0.1)" stroke="rgba(255,45,85,0.4)" strokeWidth="1" />
        <text x="85" y="385" fill="rgba(255,45,85,0.8)" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)">ELEV</text>
        {/* Staircase lines */}
        {[0, 8, 16, 24, 32].map(i => <line key={i} x1="60" y1={355 + i} x2="110" y2={355 + i} stroke="rgba(255,45,85,0.3)" strokeWidth="0.5" />)}

        {/* Center staircase */}
        <rect x="245" y="195" width="55" height="100" fill="rgba(0,117,190,0.05)" stroke="rgba(0,117,190,0.2)" strokeWidth="1" />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(i => <line key={i} x1="245" y1={200 + i} x2="300" y2={200 + i} stroke="rgba(0,117,190,0.15)" strokeWidth="0.5" />)}

        {/* Top right staircase */}
        <rect x="650" y="60" width="90" height="40" fill="rgba(255,45,85,0.1)" stroke="rgba(255,45,85,0.4)" strokeWidth="1" />
        {[0, 7, 14, 21, 28, 35].map(i => <line key={i} x1="653" y1={62 + i} x2="738" y2={62 + i} stroke="rgba(255,45,85,0.3)" strokeWidth="0.5" />)}
        <text x="695" y="88" fill="rgba(255,45,85,0.7)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">↑ BLEACH</text>

        {/* Bottom center staircase */}
        <rect x="285" y="380" width="120" height="40" fill="rgba(255,45,85,0.1)" stroke="rgba(255,45,85,0.4)" strokeWidth="1" />
        {[0, 7, 14, 21, 28, 35].map(i => <line key={i} x1="287" y1={382 + i} x2="403" y2={382 + i} stroke="rgba(255,45,85,0.3)" strokeWidth="0.5" />)}
        <text x="345" y="374" fill="rgba(255,45,85,0.8)" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)">← go up to access bleach floor</text>

        {/* Arrows */}
        {arrows.map((a, i) => (
          <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="rgba(0,117,190,0.5)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        ))}

        {/* Circular assets (gray circles) */}
        <circle cx="465" cy="165" r="14" fill="rgba(100,100,120,0.3)" stroke="rgba(150,150,170,0.4)" strokeWidth="1.5" />
        <circle cx="390" cy="345" r="16" fill="rgba(100,100,120,0.3)" stroke="rgba(150,150,170,0.4)" strokeWidth="1.5" />

        {/* START marker */}
        <circle cx="150" cy="148" r="20" fill="rgba(0,255,136,0.1)" stroke="var(--accent-green)" strokeWidth="1.5" />
        <text x="150" y="145" fill="var(--accent-green)" fontSize="9" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="bold">START</text>

        {/* Assets */}
        {assets.map(asset => {
          const isHovered = tooltip?.id === asset.id;
          const color = asset.isMissing ? 'var(--accent-red)' : asset.inRoute ? 'rgba(0,117,190,0.15)' : 'rgba(255,45,85,0.2)';
          const borderColor = asset.isMissing ? 'var(--accent-red)' : asset.inRoute ? 'var(--blue)' : 'var(--accent-red)';
          const textColor = asset.isMissing ? 'var(--accent-red)' : asset.inRoute ? 'var(--blue)' : 'var(--accent-red)';

          return (
            <g key={asset.id} transform={`translate(${asset.x}, ${asset.y})`}
              onMouseEnter={() => setTooltip({ id: asset.id, x: asset.x, y: asset.y, label: asset.label })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}>
              <rect
                x={-20} y={-12} width={40} height={22}
                rx={2}
                fill={isHovered ? (asset.inRoute ? 'rgba(0,117,190,0.3)' : 'rgba(255,45,85,0.35)') : color}
                stroke={borderColor}
                strokeWidth={isHovered ? 1.5 : 1}
              />
              <text x={0} y={3} fill={textColor} fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="bold">
                {asset.id}
              </text>
              {asset.label && (
                <text x={0} y={20} fill={textColor} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity={0.8}>
                  {asset.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g transform={`translate(${Math.min(tooltip.x + 10, 680)}, ${Math.max(tooltip.y - 40, 10)})`}>
            <rect x={0} y={0} width={120} height={36} rx={2} fill="var(--blue-tint)" stroke="var(--blue)" strokeWidth={0.5} />
            <text x={10} y={15} fill="var(--blue)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold">
              ID: {tooltip.id}
            </text>
            <text x={10} y={28} fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">
              {tooltip.label ? `Type: ${tooltip.label}` : 'Vibration Point'}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(60, 440)">
          <rect x={0} y={0} width={12} height={12} fill="rgba(0,117,190,0.15)" stroke="var(--blue)" strokeWidth={1} />
          <text x={16} y={10} fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">In offline route</text>
          <rect x={130} y={0} width={12} height={12} fill="rgba(255,45,85,0.2)" stroke="var(--accent-red)" strokeWidth={1} />
          <text x={146} y={10} fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">Not in offline route</text>
          <rect x={280} y={0} width={12} height={12} fill="rgba(255,45,85,0.15)" stroke="var(--accent-red)" strokeWidth={1} />
          <text x={296} y={10} fill="var(--accent-red)" fontSize="8" fontFamily="var(--font-mono)">? Missing ID</text>
        </g>

        {/* Title */}
        <text x="380" y="40" fill="var(--text-dark)" fontSize="16" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="bold" letterSpacing="2">
          PULP #3 — 5TH FLOOR
        </text>
        <text x="380" y="54" fill="var(--blue)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)" letterSpacing="3" opacity="0.7">
          VIBRATION ROUTE MAP · TAKE ELEVATOR TO 5TH FLOOR
        </text>
      </svg>
    </div>
  );
}

const AREA_TREE = {
  'clearwater-augusta': {
    Pulp: {
      'Pulp 2': ['Ground Floor', 'Upper Floor'],
      'Pulp 3': ['Ground Floor 1', 'Outside', 'Ground Floor 2', '5th Floor', 'Bleach Floor', '6th Floor / Roof'],
      'Chemical Area': ['Ground Floor', 'Upper Level'],
      'Lime Kiln': ['Ground Level', 'Platform'],
      'Woodyard': ['Ground Level']
    },
    Power: {
      'Boiler House': ['Ground Floor', 'Mid Level', 'Top Level'],
      'Turbine Hall': ['Ground Floor']
    },
    PM1: { 'Wet End': ['Ground Floor', 'Mezzanine'], 'Dry End': ['Ground Floor', 'Mezzanine'] },
    PM3: { 'Wet End': ['Ground Floor', 'Mezzanine'], 'Dry End': ['Ground Floor', 'Mezzanine'] }
  },
  'gpi-macon': {
    PM1: {
      Mezzanine: ['Level 1', 'Level 2'],
      Basement: ['Ground'],
      'Drive Side': ['Floor 1', 'Floor 2']
    },
    Utilities: {
      'Air Compressors': ['Ground Floor'],
      'Water Treatment': ['Ground Floor']
    }
  },
  'newindy-catawba': {
    PM1: {
      'Wet End': ['Ground Floor', 'Mezzanine'],
      'Press Section': ['Ground Floor'],
      'Dry End': ['Ground Floor', 'Mezzanine']
    },
    'Stock Prep': {
      Refiners: ['Ground Floor'],
      Cleaners: ['Ground Floor', 'Upper']
    }
  }
};

const HAS_DRAWING = {
  'clearwater-augusta-Pulp-Pulp 3-5th Floor': true
};

export default function DrawingsTab({ mill }) {
  const tree = AREA_TREE[mill.id] || {};
  const [selected, setSelected] = useState({ area: null, subarea: null, floor: null });

  const drawingKey = `${mill.id}-${selected.area}-${selected.subarea}-${selected.floor}`;
  const hasDrawing = HAS_DRAWING[drawingKey];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 110px)', overflow: 'hidden' }} className="animate-fade-in">
      {/* Sidebar */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid var(--border-light)',
        background: '#fff',
        overflowY: 'auto', padding: '24px 0'
      }}>
        <div style={{
          padding: '0 20px 16px',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: 3, color: mill.color, opacity: 0.8,
          textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)',
          marginBottom: 8
        }}>
          {mill.shortName} · Route Maps
        </div>

        {Object.entries(tree).map(([area, subareas]) => (
          <div key={area}>
            {/* Area */}
            <button onClick={() => setSelected(s => ({ area: s.area === area ? null : area, subarea: null, floor: null }))} style={{
              all: 'unset', cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: 1,
              color: selected.area === area ? mill.color : 'var(--text-body)',
              background: selected.area === area ? `${mill.color}08` : 'transparent',
              borderLeft: selected.area === area ? `2px solid ${mill.color}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}>
              {area}
              <span style={{ fontSize: 10, opacity: 0.5 }}>{selected.area === area ? '▾' : '▸'}</span>
            </button>

            {selected.area === area && Object.entries(subareas).map(([sub, floors]) => (
              <div key={sub}>
                <button onClick={() => setSelected(s => ({ area, subarea: s.subarea === sub ? null : sub, floor: null }))} style={{
                  all: 'unset', cursor: 'pointer', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 28px',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: selected.subarea === sub ? 'var(--blue)' : 'var(--text-muted)',
                  background: selected.subarea === sub ? 'rgba(0,117,190,0.05)' : 'transparent',
                  transition: 'all 0.2s'
                }}>
                  ○ {sub}
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{selected.subarea === sub ? '▾' : '▸'}</span>
                </button>

                {selected.subarea === sub && floors.map(floor => (
                  <button key={floor} onClick={() => setSelected({ area, subarea: sub, floor })} style={{
                    all: 'unset', cursor: 'pointer', width: '100%',
                    padding: '7px 40px',
                    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                    color: selected.floor === floor ? '#fff' : 'var(--text-muted)',
                    background: selected.floor === floor ? 'rgba(0,117,190,0.08)' : 'transparent',
                    borderLeft: selected.floor === floor ? '2px solid var(--blue)' : '2px solid transparent',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    {HAS_DRAWING[`${mill.id}-${area}-${sub}-${floor}`] && (
                      <span style={{ color: 'var(--accent-green)', fontSize: 8 }}>●</span>
                    )}
                    {floor}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Drawing area */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-deep)', padding: '32px' }}>
        {!selected.floor ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', textAlign: 'center'
          }}>
            <div style={{ fontSize: 64, opacity: 0.08, marginBottom: 20 }}>◧</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>
              SELECT A FLOOR TO VIEW ROUTE MAP
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, letterSpacing: 2 }}>
              Navigate the tree on the left to access vibration route drawings
            </div>
            <div style={{ marginTop: 20 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2,
                color: 'var(--accent-green)', background: 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.3)', padding: '4px 10px', borderRadius: 2
              }}>
                ● = Drawing available
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Breadcrumb */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2,
              color: 'var(--text-muted)', marginBottom: 24, flexWrap: 'wrap'
            }}>
              {[mill.shortName, selected.area, selected.subarea, selected.floor].map((s, i, arr) => (
                <React.Fragment key={i}>
                  <span style={{ color: i === arr.length - 1 ? mill.color : 'var(--text-muted)' }}>{s}</span>
                  {i < arr.length - 1 && <span style={{ opacity: 0.3 }}>›</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Drawing */}
            {hasDrawing ? (
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-dark)',
                  letterSpacing: 2, marginBottom: 20
                }}>
                  {selected.subarea} — {selected.floor}
                </div>
                <div style={{
                  background: '#fff',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 2, overflow: 'hidden',
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
                }}>
                  <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--accent-green)' }}>
                      OFFICIAL ROUTE DRAWING · LIVE
                    </span>
                  </div>
                  <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <Pulp3FifthFloorMap />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh', textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, opacity: 0.1, marginBottom: 20 }}>◧</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>
                  DRAWING NOT YET UPLOADED
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, letterSpacing: 1, maxWidth: 380 }}>
                  {selected.area} › {selected.subarea} › {selected.floor}<br /><br />
                  Contact your ANDRITZ representative to add this drawing to the system.
                </div>
                <div style={{
                  marginTop: 24,
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2,
                  color: 'var(--accent-orange)', background: 'rgba(255,107,53,0.08)',
                  border: '1px solid rgba(255,107,53,0.3)', padding: '10px 20px', borderRadius: 2
                }}>
                  ⚠ DRAWING PENDING
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}