import React, { useState, useRef } from 'react';

// ─── Asset definitions ────────────────────────────────────────────────────────
// status: 'offline'  = in offline route (gray)
//         'not-in'   = not in offline route (red)
//         'abandoned'= abandoned, not in route (red X)
//         'online'   = in offline route WITH online sensor (green)
//         'base'     = base station (orange)

const ASSETS = [
  // Top row (far left cluster)
  { id: '19783', x: 42,  y: 148, status: 'online' },
  { id: '19584', x: 118, y: 148, status: 'online' },
  { id: '19568', x: 194, y: 148, status: 'online' },
  { id: '19543', x: 270, y: 148, status: 'offline' },

  // Upper left cluster
  { id: '19861', x: 56,  y: 198, status: 'offline' },
  { id: '19373', x: 56,  y: 228, status: 'offline' },
  { id: '19514', x: 195, y: 196, status: 'offline' },

  // Left cluster mid
  { id: '19541', x: 120, y: 246, status: 'offline' },
  { id: '19556', x: 195, y: 246, status: 'offline' },

  // Mid-left cluster
  { id: '19822', x: 120, y: 290, status: 'offline' },
  { id: '19818', x: 195, y: 290, status: 'offline' },
  { id: '19791', x: 270, y: 290, status: 'offline' },
  { id: '19820', x: 345, y: 290, status: 'offline' },

  // Mid cluster row
  { id: '19782', x: 42,  y: 340, status: 'offline' },
  { id: '19746', x: 118, y: 340, status: 'offline' },
  { id: '19714', x: 194, y: 340, status: 'offline' },
  { id: '19587', x: 270, y: 340, status: 'offline' },
  { id: '19545', x: 345, y: 340, status: 'offline' },
  { id: '19539', x: 421, y: 340, status: 'offline' },

  // PIPE label area
  { id: '19585', x: 118, y: 390, status: 'offline' },
  { id: '19863', x: 194, y: 390, status: 'offline' },
  { id: '19577', x: 270, y: 390, status: 'offline' },
  { id: '19867', x: 345, y: 390, status: 'offline' },
  { id: '19549', x: 421, y: 390, status: 'offline' },

  // 18xxx cluster
  { id: '18481', x: 270, y: 438, status: 'offline' },
  { id: '18478', x: 345, y: 438, status: 'offline' },
  { id: '18776', x: 421, y: 438, status: 'offline' },
  { id: '19527', x: 270, y: 488, status: 'offline' },
  { id: '19523', x: 345, y: 488, status: 'offline' },
  { id: '19529', x: 421, y: 488, status: 'offline' },

  // 18xxx bottom cluster
  { id: '18780', x: 118, y: 488, status: 'offline' },
  { id: '18774', x: 194, y: 488, status: 'offline' },
  { id: '18529', x: 42,  y: 488, status: 'offline' },

  // 17xxx cluster
  { id: '17460', x: 118, y: 538, status: 'offline' },
  { id: '17453', x: 194, y: 538, status: 'offline' },
  { id: '17458', x: 270, y: 538, status: 'offline' },
  { id: '17456', x: 345, y: 538, status: 'offline' },

  // Upper right segment
  { id: '16347', x: 560, y: 298, status: 'offline' },
  { id: '18762', x: 636, y: 298, status: 'offline' },
  { id: '16631', x: 712, y: 298, status: 'not-in' },

  // Right area 17xxx
  { id: '17433', x: 636, y: 350, status: 'offline' },
  { id: '17617', x: 712, y: 350, status: 'offline' },
  { id: '17619', x: 788, y: 350, status: 'offline' },
  { id: '17400', x: 560, y: 400, status: 'offline' },
  { id: '17383', x: 636, y: 400, status: 'offline' },
  { id: '17659', x: 712, y: 400, status: 'offline' },

  // 166xx cluster
  { id: '16789', x: 560, y: 450, status: 'offline' },
  { id: '16553', x: 636, y: 450, status: 'offline' },
  { id: '16600', x: 712, y: 450, status: 'offline' },
  { id: '16589', x: 788, y: 450, status: 'offline' },
  { id: '16598', x: 560, y: 500, status: 'offline' },
  { id: '16554', x: 636, y: 500, status: 'offline' },
  { id: '16587', x: 712, y: 500, status: 'offline' },
  { id: '16648', x: 788, y: 500, status: 'offline' },
  { id: '16651', x: 560, y: 550, status: 'offline' },
  { id: '16623', x: 636, y: 550, status: 'offline' },

  // 175xx / 176xx
  { id: '17584', x: 712, y: 550, status: 'offline' },
  { id: '17580', x: 788, y: 550, status: 'offline' },

  // 166xx right block
  { id: '16695', x: 864, y: 450, status: 'offline' },
  { id: '16604', x: 864, y: 500, status: 'offline' },
  { id: '16602', x: 940, y: 450, status: 'offline' },
  { id: '16606', x: 940, y: 500, status: 'offline' },
  { id: '16698', x: 864, y: 550, status: 'offline' },
  { id: '16692', x: 940, y: 550, status: 'offline' },
  { id: '16627', x: 1016, y: 450, status: 'offline' },
  { id: '16629', x: 1016, y: 500, status: 'offline' },
  { id: '16631_b', id_display: '16631', x: 1016, y: 550, status: 'offline' },
  { id: '16638', x: 1092, y: 450, status: 'offline' },
  { id: '16781', x: 864, y: 600, status: 'offline' },
  { id: '16761', x: 940, y: 600, status: 'offline' },
  { id: '16783', x: 1016, y: 600, status: 'offline' },

  // 166xx far right
  { id: '16616', x: 1092, y: 500, status: 'offline' },
  { id: '16608', x: 1092, y: 550, status: 'offline' },
  { id: '16571', x: 1092, y: 600, status: 'offline' },
  { id: '16594', x: 1168, y: 450, status: 'offline' },
  { id: '16580', x: 1168, y: 500, status: 'offline' },
  { id: '16715', x: 1168, y: 550, status: 'offline' },
  { id: '16718', x: 1168, y: 600, status: 'offline' },

  // Unknown / question marks
  { id: '?_top', id_display: '?', x: 788, y: 298, status: 'not-in' },
  { id: '?_mid', id_display: '?', x: 712, y: 490, status: 'not-in' },
  { id: '?_right', id_display: '?', x: 345, y: 538, status: 'not-in' },
  { id: '?_bot', id_display: '?', x: 560, y: 590, status: 'not-in' },

  // Abandoned X assets
  { id: 'X_1', id_display: 'X', x: 194, y: 220, status: 'abandoned' },
  { id: 'X_2', id_display: 'X', x: 194, y: 246, status: 'abandoned' },
  { id: 'X_3', id_display: 'X', x: 864, y: 298, status: 'abandoned' },
  { id: 'X_4', id_display: 'X', x: 560, y: 160, status: 'abandoned' },

  // Extras from far right column
  { id: '19505', x: 1320, y: 200, status: 'offline' },
  { id: '17665', x: 1320, y: 258, status: 'offline' },
  { id: '16567', x: 1320, y: 316, status: 'not-in' },
  { id: '18462', x: 1320, y: 374, status: 'offline' },

  // Far right vertical strip (Start area)
  { id: '16758', x: 1244, y: 250, status: 'offline' },
  { id: '16750', x: 1244, y: 310, status: 'offline' },
  { id: '16726', x: 1244, y: 370, status: 'offline' },
  { id: '16717', x: 1244, y: 430, status: 'offline' },
  { id: '16705', x: 1244, y: 490, status: 'offline' },
  { id: '16705_b', id_display: '16705', x: 1244, y: 550, status: 'offline' },

  // Base Station
  { id: '00001054', x: 22, y: 248, status: 'base' },

  // 17587
  { id: '17587', x: 636, y: 600, status: 'offline' },
];

// ─── Color map ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  offline:   { fill: '#e8e8e8', stroke: '#999', text: '#333' },
  'not-in':  { fill: '#e05555', stroke: '#b83030', text: '#fff' },
  abandoned: { fill: '#e05555', stroke: '#b83030', text: '#fff' },
  online:    { fill: '#4caf50', stroke: '#2e7d32', text: '#fff' },
  base:      { fill: '#ff9800', stroke: '#e65100', text: '#fff' },
};

const LEGEND_ITEMS = [
  { status: 'offline',   label: 'Asset in offline route' },
  { status: 'not-in',    label: 'Asset not in offline route' },
  { status: 'abandoned', label: 'Asset abandoned, not in offline route', symbol: 'X' },
  { status: 'online',    label: 'Asset in offline route with online sensor' },
  { status: 'base',      label: 'Base Station' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Pulp2GroundFloorMap({ onAssetClick }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered]   = useState(null);
  const [tooltip, setTooltip]   = useState({ visible: false, x: 0, y: 0, asset: null });
  const svgRef = useRef(null);

  const handleAssetClick = (asset, e) => {
    e.stopPropagation();
    setSelected(asset.id === selected ? null : asset.id);
    if (onAssetClick) onAssetClick(asset);
  };

  const handleMouseEnter = (asset, e) => {
    setHovered(asset.id);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        visible: true,
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 8,
        asset,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (hovered && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip(t => ({ ...t, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 }));
    }
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setTooltip(t => ({ ...t, visible: false }));
  };

  const SVG_W = 1420;
  const SVG_H = 700;

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>PULP #2 — GROUND FLOOR</span>
        <span style={styles.headerSub}>Clearwater Paper · Augusta, GA</span>
      </div>

      {/* Map container */}
      <div style={styles.mapContainer}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={styles.svg}
          onMouseMove={handleMouseMove}
          onClick={() => { setSelected(null); }}
        >
          {/* ── Background grid ── */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2a1a" strokeWidth="0.5" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="#0d1a0d" />
          <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

          {/* ── PULP #3 zone label at bottom ── */}
          <rect x={0} y={620} width={SVG_W} height={80} fill="#131f13" stroke="#1e3a1e" strokeWidth="1" />
          <text x={SVG_W / 2} y={668} textAnchor="middle" style={styles.zoneLabelText}>PULP #3</text>

          {/* ── "Start" indicator ── */}
          <rect x={1350} y={140} width={60} height={28} rx={4} fill="#00e676" opacity={0.15} stroke="#00e676" strokeWidth={1} />
          <text x={1380} y={159} textAnchor="middle" style={styles.startText}>START</text>
          {/* Arrow down from Start */}
          <line x1={1380} y1={168} x2={1380} y2={195} stroke="#00e676" strokeWidth={1.5} markerEnd="url(#arrowGreen)" />

          {/* ── Arrow marker defs ── */}
          <defs>
            <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#888" />
            </marker>
            <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#00e676" />
            </marker>
          </defs>

          {/* ── Sample route arrows (major path segments) ── */}
          {[
            [42+32, 148, 118, 148], [118+32, 148, 194, 148], [194+32, 148, 270, 148],
            [42+32, 148, 42, 198], [118+32, 340, 118, 390],
            [636, 350, 636, 400], [712, 350, 712, 400], [712, 400, 712, 450],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#444" strokeWidth={1} markerEnd="url(#arrowGray)" strokeDasharray="4 3" />
          ))}

          {/* ── "access for 2nd floor route" label ── */}
          <text x={860} y={142} style={styles.accessLabel}>▲ access for 2nd floor route</text>

          {/* ── PIPE label ── */}
          <rect x={42} y={360} width={380} height={22} rx={2} fill="#1a2e1a" stroke="#2a4a2a" strokeWidth={1}/>
          <text x={232} y={375} textAnchor="middle" style={styles.pipeLabel}>PIPE</text>

          {/* ── Assets ── */}
          {ASSETS.map(asset => {
            const displayId = asset.id_display || asset.id;
            const colors    = STATUS_COLORS[asset.status];
            const isHovered = hovered === asset.id;
            const isSel     = selected === asset.id;
            const isAbandoned = asset.status === 'abandoned';
            const isBase    = asset.status === 'base';

            const bw = isBase ? 64 : 52;
            const bh = 22;

            return (
              <g
                key={asset.id}
                transform={`translate(${asset.x}, ${asset.y})`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleAssetClick(asset, e)}
                onMouseEnter={(e) => handleMouseEnter(asset, e)}
                onMouseLeave={handleMouseLeave}
              >
                {/* glow on hover/select */}
                {(isHovered || isSel) && (
                  <rect
                    x={-bw / 2 - 3} y={-bh / 2 - 3}
                    width={bw + 6} height={bh + 6}
                    rx={4} ry={4}
                    fill="none"
                    stroke={isSel ? '#00e5ff' : colors.fill}
                    strokeWidth={2}
                    opacity={0.8}
                  />
                )}
                <rect
                  x={-bw / 2} y={-bh / 2}
                  width={bw} height={bh}
                  rx={3} ry={3}
                  fill={colors.fill}
                  stroke={isSel ? '#00e5ff' : colors.stroke}
                  strokeWidth={isSel ? 1.5 : 1}
                />
                {isAbandoned ? (
                  <>
                    <text x={0} y={5} textAnchor="middle" style={{ ...styles.assetId, fill: colors.text, fontWeight: 'bold', fontSize: '11px' }}>✕</text>
                  </>
                ) : (
                  <text x={0} y={5} textAnchor="middle" style={{ ...styles.assetId, fill: colors.text }}>
                    {displayId}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip.visible && tooltip.asset && (
          <div style={{ ...styles.tooltip, left: tooltip.x, top: tooltip.y }}>
            <div style={styles.tooltipId}>{tooltip.asset.id_display || tooltip.asset.id}</div>
            <div style={styles.tooltipStatus}>{LEGEND_ITEMS.find(l => l.status === tooltip.asset.status)?.label}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {LEGEND_ITEMS.map(item => {
          const c = STATUS_COLORS[item.status];
          return (
            <div key={item.status} style={styles.legendItem}>
              <div style={{
                ...styles.legendSwatch,
                background: c.fill,
                border: `1px solid ${c.stroke}`,
                color: c.text,
                fontWeight: 'bold',
                fontSize: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.symbol || '99999'}
              </div>
              <span style={styles.legendLabel}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    background: '#0a150a',
    borderRadius: '6px',
    border: '1px solid #1e3a1e',
    overflow: 'hidden',
    fontFamily: "'Rajdhani', 'JetBrains Mono', monospace",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#0f1f0f',
    borderBottom: '1px solid #1e3a1e',
  },
  headerTitle: {
    color: '#e8f5e9',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontFamily: "'Orbitron', monospace",
  },
  headerSub: {
    color: '#558b2f',
    fontSize: '12px',
    letterSpacing: '1px',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'auto',
    background: '#0d1a0d',
  },
  svg: {
    display: 'block',
    width: '100%',
    minWidth: '900px',
    height: 'auto',
  },
  assetId: {
    fontSize: '9px',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    letterSpacing: '0.5px',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  zoneLabelText: {
    fill: '#2a4a2a',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: "'Orbitron', monospace",
    letterSpacing: '8px',
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  startText: {
    fill: '#00e676',
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: "'Orbitron', monospace",
    letterSpacing: '1px',
    userSelect: 'none',
  },
  accessLabel: {
    fill: '#4a7a4a',
    fontSize: '10px',
    fontFamily: "'Rajdhani', sans-serif",
    userSelect: 'none',
  },
  pipeLabel: {
    fill: '#3a6a3a',
    fontSize: '11px',
    letterSpacing: '3px',
    fontFamily: "'Orbitron', monospace",
    userSelect: 'none',
  },
  tooltip: {
    position: 'absolute',
    background: '#0f1f0f',
    border: '1px solid #00e676',
    borderRadius: '4px',
    padding: '6px 10px',
    pointerEvents: 'none',
    zIndex: 100,
    minWidth: '180px',
    boxShadow: '0 0 12px rgba(0,230,118,0.2)',
  },
  tooltipId: {
    color: '#00e676',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Orbitron', monospace",
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  tooltipStatus: {
    color: '#8bc34a',
    fontSize: '11px',
    fontFamily: "'Rajdhani', sans-serif",
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    padding: '12px 20px',
    background: '#0a150a',
    borderTop: '1px solid #1e3a1e',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendSwatch: {
    width: '48px',
    height: '18px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  legendLabel: {
    color: '#7a9a7a',
    fontSize: '11px',
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '0.3px',
  },
};
