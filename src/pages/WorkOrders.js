import React, { useState, useRef } from 'react';
import { useWorkOrders } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const STATUSES = ['open', 'in-progress', 'completed', 'on-hold'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const STATUS_COLORS = {
  open: 'var(--andritz-blue)',
  'in-progress': 'var(--accent-orange)',
  completed: 'var(--accent-green)',
  'on-hold': 'var(--accent-yellow)'
};
const PRIORITY_COLORS = {
  low: 'var(--accent-green)',
  medium: 'var(--accent-yellow)',
  high: 'var(--accent-orange)',
  critical: 'var(--accent-red)'
};

function genWONumber() {
  return `WO-${Date.now().toString(36).toUpperCase()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
}

export default function WorkOrders({ mill }) {
  const [orders, setOrders] = useWorkOrders(mill.id);
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const [form, setForm] = useState({
    woNumber: genWONumber(),
    openedBy: '',
    woDate: new Date().toISOString().split('T')[0],
    assetName: '',
    reason: '',
    priority: 'medium',
    status: 'open',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.openedBy || !form.assetName || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    const newOrder = { ...form, id: Date.now(), createdAt: new Date().toISOString() };
    setOrders(prev => [newOrder, ...prev]);
    setShowModal(false);
    setForm({ woNumber: genWONumber(), openedBy: '', woDate: new Date().toISOString().split('T')[0], assetName: '', reason: '', priority: 'medium', status: 'open', attachments: [] });
    toast.success(`Work Order ${newOrder.woNumber} created`);
  };

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Status updated to ${status}`);
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setViewOrder(null);
    toast.success('Work order deleted');
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }));
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...fileList] }));
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.woNumber.toLowerCase().includes(search.toLowerCase()) || o.assetName.toLowerCase().includes(search.toLowerCase()) || o.openedBy.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});

  return (
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 4, color: mill.color, marginBottom: 6, opacity: 0.8 }}>
            MAINTENANCE MANAGEMENT
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: 2 }}>Work Orders</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
            {mill.shortName} · {orders.length} total orders
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-cyber" style={{ borderColor: mill.color, color: mill.color }}>
          + New Work Order
        </button>
      </div>

      {/* Status overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[{ label: 'All', val: orders.length, key: 'all', color: 'var(--text-secondary)' },
          ...STATUSES.map(s => ({ label: s.replace('-', ' '), val: counts[s] || 0, key: s, color: STATUS_COLORS[s] }))
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            all: 'unset', cursor: 'pointer',
            background: filter === s.key ? `${s.color}15` : 'var(--bg-card)',
            border: `1px solid ${filter === s.key ? s.color : 'var(--border-dim)'}`,
            borderRadius: 2, padding: '14px 16px', transition: 'all 0.2s'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="input-cyber"
          placeholder="Search by WO number, asset, or technician..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 2 }}>
              NO WORK ORDERS FOUND
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {orders.length === 0 ? 'Create your first work order to get started' : 'Adjust your filters'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-cyber">
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Opened By</th>
                  <th>Date</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: mill.color }}>{order.woNumber}</span>
                    </td>
                    <td>{order.openedBy}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{order.woDate}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.assetName}</td>
                    <td>
                      <span className="badge" style={{
                        background: `${PRIORITY_COLORS[order.priority]}15`,
                        color: PRIORITY_COLORS[order.priority],
                        border: `1px solid ${PRIORITY_COLORS[order.priority]}40`
                      }}>
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{
                          background: `${STATUS_COLORS[order.status]}15`,
                          border: `1px solid ${STATUS_COLORS[order.status]}40`,
                          color: STATUS_COLORS[order.status],
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: 1,
                          padding: '4px 8px',
                          borderRadius: 2,
                          cursor: 'pointer'
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => setViewOrder(order)} style={{
                        all: 'unset', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: 'var(--text-muted)', letterSpacing: 1,
                        padding: '4px 10px', border: '1px solid var(--border-dim)',
                        borderRadius: 2, marginRight: 6, transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = mill.color; e.currentTarget.style.color = mill.color; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dim)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New WO Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 3, color: mill.color, marginBottom: 4 }}>NEW WORK ORDER</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', letterSpacing: 1 }}>{mill.shortName}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div>
                    <label className="label-cyber">WO Number</label>
                    <input className="input-cyber" value={form.woNumber} readOnly style={{ opacity: 0.6 }} />
                  </div>
                  <div>
                    <label className="label-cyber">WO Date *</label>
                    <input className="input-cyber" type="date" value={form.woDate} onChange={e => setForm(p => ({ ...p, woDate: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label-cyber">Opened By *</label>
                    <input className="input-cyber" placeholder="Technician name" value={form.openedBy} onChange={e => setForm(p => ({ ...p, openedBy: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label-cyber">Asset Name *</label>
                    <input className="input-cyber" placeholder="Asset / equipment name" value={form.assetName} onChange={e => setForm(p => ({ ...p, assetName: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label-cyber">Priority</label>
                    <select className="input-cyber" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-cyber">Status</label>
                    <select className="input-cyber" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <label className="label-cyber">Reason / Description *</label>
                  <textarea className="input-cyber" rows={4} placeholder="Describe the issue, maintenance needed, or observation..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required />
                </div>
                <div style={{ marginTop: 20 }}>
                  <label className="label-cyber">Attachments</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    style={{
                      border: '1px dashed var(--border-glow)',
                      borderRadius: 2,
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(0,117,190,0.03)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2 }}>
                      DROP FILES HERE OR CLICK TO BROWSE
                    </div>
                    <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
                  </div>
                  {form.attachments.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {form.attachments.map((f, i) => (
                        <div key={i} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 10,
                          color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-dim)', padding: '4px 10px', borderRadius: 2
                        }}>
                          📎 {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="divider-cyber" />
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{
                    all: 'unset', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2,
                    color: 'var(--text-muted)', padding: '10px 20px', border: '1px solid var(--border-dim)', borderRadius: 2
                  }}>
                    CANCEL
                  </button>
                  <button type="submit" className="btn-cyber" style={{ borderColor: mill.color, color: mill.color }}>
                    CREATE WORK ORDER
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewOrder(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 3, color: mill.color, marginBottom: 4 }}>WORK ORDER DETAILS</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: mill.color, letterSpacing: 1 }}>{viewOrder.woNumber}</h3>
              </div>
              <button onClick={() => setViewOrder(null)} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2" style={{ marginBottom: 20 }}>
                {[
                  { label: 'Opened By', val: viewOrder.openedBy },
                  { label: 'WO Date', val: viewOrder.woDate },
                  { label: 'Asset', val: viewOrder.assetName },
                  { label: 'Priority', val: viewOrder.priority },
                  { label: 'Status', val: viewOrder.status },
                  { label: 'Created', val: viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString() : '—' }
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)' }}>{item.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Reason / Description</div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
                  padding: '14px', borderRadius: 2, lineHeight: 1.7
                }}>
                  {viewOrder.reason}
                </div>
              </div>
              {viewOrder.attachments?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Attachments ({viewOrder.attachments.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {viewOrder.attachments.map((f, i) => (
                      <div key={i} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: mill.color, background: `${mill.color}10`,
                        border: `1px solid ${mill.color}40`, padding: '6px 12px', borderRadius: 2
                      }}>
                        📎 {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="divider-cyber" />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => deleteOrder(viewOrder.id)} style={{
                  all: 'unset', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 2,
                  color: 'var(--accent-red)', padding: '10px 20px',
                  border: '1px solid rgba(255,45,85,0.4)', borderRadius: 2, transition: 'all 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  DELETE ORDER
                </button>
                <button onClick={() => setViewOrder(null)} className="btn-cyber" style={{ borderColor: mill.color, color: mill.color }}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}