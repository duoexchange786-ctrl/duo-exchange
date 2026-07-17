'use client';
import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';

/* ─── Inline Styles (self-contained, dark premium theme) ─── */
const S = {
  /* Layout */
  page: {
    minHeight: '100%',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#f0f2ff',
    animation: 'udFadeUp 0.35s cubic-bezier(0.4,0,0.2,1)',
  },

  /* Back button row */
  backRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#a0aec0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  breadcrumb: {
    fontSize: '13px',
    color: '#636b80',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  breadcrumbActive: { color: '#f0f2ff', fontWeight: 600 },

  /* Hero Card */
  heroCard: {
    background: 'linear-gradient(135deg, #13151f 0%, #161928 60%, #1a1530 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  },
  heroGlow: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '220px',
    height: '220px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: '-40px',
    left: '40px',
    width: '160px',
    height: '160px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  avatarRing: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    padding: '2px',
    flexShrink: 0,
    boxShadow: '0 0 24px rgba(99,102,241,0.4)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#13151f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroInfo: { flex: 1, minWidth: 0 },
  heroName: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#f0f2ff',
    margin: '0 0 4px',
    letterSpacing: '-0.4px',
  },
  heroEmail: {
    fontSize: '14px',
    color: '#a0aec0',
    margin: '0 0 12px',
  },
  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
  },
  badge: (color, bg, border) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color,
    background: bg,
    border: `1px solid ${border}`,
  }),
  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#636b80',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  heroActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  /* Wallet Stat Cards */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: (accentColor, accentBg) => ({
    background: '#13151f',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px 22px',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
  }),
  statTopLine: (color) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: color,
    borderRadius: '16px 16px 0 0',
  }),
  statIcon: (bg, color) => ({
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    marginBottom: '12px',
  }),
  statLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#636b80',
    marginBottom: '4px',
  },
  statValue: (color) => ({
    fontSize: '24px',
    fontWeight: 800,
    color: color || '#f0f2ff',
    letterSpacing: '-0.5px',
  }),
  statSub: {
    fontSize: '11px',
    color: '#636b80',
    marginTop: '2px',
  },

  /* Two-column grid */
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },

  /* Section Card */
  card: {
    background: '#13151f',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#f0f2ff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardBody: { padding: '20px 22px' },

  /* Detail rows */
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  detailRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#636b80',
    fontWeight: 500,
  },
  detailValue: {
    fontSize: '13px',
    color: '#c8d0e8',
    fontWeight: 600,
    textAlign: 'right',
    maxWidth: '60%',
    wordBreak: 'break-all',
  },

  /* Wallet Adjustment Panel */
  adjustPanel: {
    background: 'rgba(99,102,241,0.06)',
    border: '1px solid rgba(99,102,241,0.18)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '16px',
    animation: 'udFadeUp 0.25s ease',
  },
  adjustTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#818cf8',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  typeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '14px',
  },
  typeBtn: (active, type) => ({
    padding: '10px',
    borderRadius: '10px',
    border: `1px solid ${active ? (type === 'CREDIT' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.07)'}`,
    background: active
      ? (type === 'CREDIT' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)')
      : 'rgba(255,255,255,0.03)',
    color: active
      ? (type === 'CREDIT' ? '#22c55e' : '#ef4444')
      : '#636b80',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    fontFamily: 'inherit',
  }),
  inputGroup: { marginBottom: '14px' },
  inputLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#636b80',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f111a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#f0f2ff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  adjustActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },

  /* Buttons */
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '10px 22px',
    background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
    whiteSpace: 'nowrap',
  },
  btnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '10px 22px',
    background: 'rgba(34,197,94,0.12)',
    color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.04)',
    color: '#a0aec0',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '10px 18px',
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },

  /* Bank card */
  bankCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    marginBottom: '10px',
    transition: 'all 0.2s',
    flexWrap: 'wrap',
    gap: '8px',
  },
  bankLeft: {},
  bankName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#c8d0e8',
    marginBottom: '2px',
  },
  bankAcct: {
    fontSize: '12px',
    color: '#636b80',
    fontFamily: "'JetBrains Mono', monospace, sans-serif",
    letterSpacing: '0.04em',
  },
  bankRight: { textAlign: 'right' },
  bankIfsc: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#818cf8',
    letterSpacing: '0.06em',
    marginBottom: '2px',
  },
  bankHolder: { fontSize: '12px', color: '#636b80' },

  /* Empty */
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px 20px',
    color: '#636b80',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '28px',
    opacity: 0.4,
  },
};

export default function UserDetailPage({ user: initialUser, onBack }) {
  const [user, setUser] = useState(initialUser);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState('CREDIT');
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const { showToast } = useToast();

  const initial = (user.fullName || user.email || '?').charAt(0).toUpperCase();
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const handleAdjust = async () => {
    const amt = parseFloat(adjAmount);
    if (!adjAmount || isNaN(amt) || amt <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/users/adjust-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount: adjAmount, type: adjType, reason: adjReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Wallet adjusted successfully', 'success');
        setUser(u => ({ ...u, wallet: { ...u.wallet, usdtAvailable: data.newBalance } }));
        setShowAdjust(false);
        setAdjAmount('');
        setAdjReason('');
      } else {
        showToast(data.error || 'Adjustment failed', 'error');
      }
    } catch {
      showToast('Adjustment failed', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const available = parseFloat(user.wallet?.usdtAvailable ?? 0);
  const deposited = parseFloat(user.wallet?.usdtDeposited ?? 0);
  const withdrawn = parseFloat(user.wallet?.usdtWithdrawn ?? 0);

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes udFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ud-back-btn:hover { background: rgba(255,255,255,0.08) !important; color: #f0f2ff !important; border-color: rgba(255,255,255,0.14) !important; }
        .ud-stat-card:hover { border-color: rgba(99,102,241,0.25) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .ud-bank-card:hover { border-color: rgba(99,102,241,0.25) !important; background: rgba(99,102,241,0.05) !important; }
        .ud-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.35) !important; }
        .ud-btn-success:hover:not(:disabled) { background: rgba(34,197,94,0.2) !important; }
        .ud-btn-secondary:hover { background: rgba(255,255,255,0.08) !important; color: #f0f2ff !important; }
        .ud-btn-danger:hover { background: rgba(239,68,68,0.18) !important; }
        .ud-input:focus { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        @media (max-width: 640px) {
          .ud-hero-inner { flex-direction: column !important; align-items: flex-start !important; }
          .ud-hero-actions { width: 100% !important; }
          .ud-two-col { grid-template-columns: 1fr !important; }
          .ud-stats-row { grid-template-columns: 1fr 1fr !important; }
          .ud-type-row { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .ud-stats-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={S.page}>
        {/* ── Back + Breadcrumb ── */}
        <div style={S.backRow}>
          <button
            className="ud-back-btn"
            style={S.backBtn}
            onClick={onBack}
          >
            <i className="fas fa-arrow-left" style={{ fontSize: '12px' }} />
            Back to Users
          </button>
          <div style={S.breadcrumb}>
            <span>Users</span>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
            <span style={S.breadcrumbActive}>{user.fullName || user.email}</span>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <div style={S.heroCard}>
          <div style={S.heroGlow} />
          <div style={S.heroGlow2} />
          <div className="ud-hero-inner" style={S.heroInner}>
            {/* Avatar */}
            <div style={S.avatarRing}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', fontWeight: 800, color: 'white',
              }}>
                {initial}
              </div>
            </div>

            {/* Info */}
            <div style={S.heroInfo}>
              <h1 style={S.heroName}>{user.fullName || 'Unnamed User'}</h1>
              <p style={S.heroEmail}>{user.email}</p>
              <div style={S.heroMeta}>
                <span style={S.badge('#22c55e', 'rgba(34,197,94,0.12)', 'rgba(34,197,94,0.3)')}>
                  <i className="fas fa-circle" style={{ fontSize: '6px' }} /> Active
                </span>
                <span style={S.metaChip}>
                  <i className="fas fa-hashtag" style={{ fontSize: '10px' }} />
                  ID: #{user._id?.toString().slice(-8)}
                </span>
                {user.mobile && (
                  <span style={S.metaChip}>
                    <i className="fas fa-phone" style={{ fontSize: '10px' }} />
                    {user.mobile}
                  </span>
                )}
                <span style={S.metaChip}>
                  <i className="fas fa-calendar-alt" style={{ fontSize: '10px' }} />
                  Joined {joined}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="ud-hero-actions" style={S.heroActions}>
              {!showAdjust ? (
                <button
                  className="ud-btn-primary"
                  style={S.btnPrimary}
                  onClick={() => setShowAdjust(true)}
                >
                  <i className="fas fa-wallet" />
                  Adjust Wallet
                </button>
              ) : (
                <button
                  className="ud-btn-secondary"
                  style={S.btnSecondary}
                  onClick={() => { setShowAdjust(false); setAdjAmount(''); setAdjReason(''); }}
                >
                  <i className="fas fa-times" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Wallet Stats ── */}
        <div className="ud-stats-row" style={S.statsRow}>
          {/* Available */}
          <div className="ud-stat-card" style={{ ...S.statCard(), transition: 'all 0.2s', cursor: 'default' }}>
            <div style={S.statTopLine('linear-gradient(90deg,#22c55e,#16a34a)')} />
            <div style={S.statIcon('rgba(34,197,94,0.12)', '#22c55e')}>
              <i className="fas fa-wallet" />
            </div>
            <div style={S.statLabel}>Available Balance</div>
            <div style={S.statValue('#22c55e')}>${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={S.statSub}>USDT</div>
          </div>

          {/* Deposited */}
          <div className="ud-stat-card" style={{ ...S.statCard(), transition: 'all 0.2s', cursor: 'default' }}>
            <div style={S.statTopLine('linear-gradient(90deg,#6366f1,#8b5cf6)')} />
            <div style={S.statIcon('rgba(99,102,241,0.12)', '#818cf8')}>
              <i className="fas fa-arrow-down" />
            </div>
            <div style={S.statLabel}>Total Deposited</div>
            <div style={S.statValue('#818cf8')}>${deposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={S.statSub}>USDT</div>
          </div>

          {/* Withdrawn */}
          <div className="ud-stat-card" style={{ ...S.statCard(), transition: 'all 0.2s', cursor: 'default' }}>
            <div style={S.statTopLine('linear-gradient(90deg,#f59e0b,#d97706)')} />
            <div style={S.statIcon('rgba(245,158,11,0.12)', '#f59e0b')}>
              <i className="fas fa-arrow-up" />
            </div>
            <div style={S.statLabel}>Total Withdrawn</div>
            <div style={S.statValue('#f59e0b')}>${withdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={S.statSub}>USDT</div>
          </div>

          {/* Net */}
          <div className="ud-stat-card" style={{ ...S.statCard(), transition: 'all 0.2s', cursor: 'default' }}>
            <div style={S.statTopLine('linear-gradient(90deg,#38bdf8,#0284c7)')} />
            <div style={S.statIcon('rgba(56,189,248,0.12)', '#38bdf8')}>
              <i className="fas fa-chart-line" />
            </div>
            <div style={S.statLabel}>Net Activity</div>
            <div style={S.statValue('#38bdf8')}>${(deposited - withdrawn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={S.statSub}>Deposited − Withdrawn</div>
          </div>
        </div>

        {/* ── Two column grid ── */}
        <div className="ud-two-col" style={S.twoCol}>

          {/* Personal Info */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h3 style={S.cardTitle}>
                <i className="fas fa-user" style={{ color: '#818cf8', fontSize: '13px' }} />
                Personal Information
              </h3>
            </div>
            <div style={S.cardBody}>
              {[
                { label: 'Full Name',     value: user.fullName || 'N/A', icon: 'fas fa-id-badge' },
                { label: 'Email Address', value: user.email, icon: 'fas fa-envelope' },
                { label: 'Mobile',        value: user.mobile || 'N/A', icon: 'fas fa-phone' },
                { label: 'User ID',       value: `#${user._id?.toString().slice(-8)}`, icon: 'fas fa-fingerprint' },
                { label: 'Joined',        value: joined, icon: 'fas fa-calendar' },
                { label: 'Status',        value: 'Active', icon: 'fas fa-circle', special: 'active' },
              ].map((row, i, arr) => (
                <div key={row.label} style={i < arr.length - 1 ? S.detailRow : S.detailRowLast}>
                  <span style={S.detailLabel}>
                    <i className={row.icon} style={{ width: '14px', marginRight: '7px', color: '#636b80', fontSize: '11px' }} />
                    {row.label}
                  </span>
                  {row.special === 'active' ? (
                    <span style={S.badge('#22c55e', 'rgba(34,197,94,0.1)', 'rgba(34,197,94,0.25)')}>
                      <i className="fas fa-circle" style={{ fontSize: '6px' }} /> Active
                    </span>
                  ) : (
                    <span style={S.detailValue}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Adjustment */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h3 style={S.cardTitle}>
                <i className="fas fa-sliders-h" style={{ color: '#818cf8', fontSize: '13px' }} />
                Wallet Management
              </h3>
              {!showAdjust && (
                <button
                  className="ud-btn-primary"
                  style={{ ...S.btnPrimary, padding: '7px 16px', fontSize: '12px' }}
                  onClick={() => setShowAdjust(true)}
                >
                  <i className="fas fa-plus" /> Adjust
                </button>
              )}
            </div>
            <div style={S.cardBody}>
              {/* Balance summary */}
              <div style={{
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '12px', padding: '16px', marginBottom: showAdjust ? '16px' : '0',
              }}>
                <div style={{ fontSize: '12px', color: '#636b80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Current Balance</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e', letterSpacing: '-1px' }}>
                  ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span style={{ fontSize: '14px', color: '#636b80', fontWeight: 500, marginLeft: '8px' }}>USDT</span>
                </div>
              </div>

              {/* Adjustment form */}
              {showAdjust && (
                <div style={S.adjustPanel}>
                  <div style={S.adjustTitle}>
                    <i className="fas fa-edit" />
                    Adjust Wallet Balance
                  </div>

                  {/* Type toggle */}
                  <div className="ud-type-row" style={S.typeRow}>
                    <button
                      style={S.typeBtn(adjType === 'CREDIT', 'CREDIT')}
                      onClick={() => setAdjType('CREDIT')}
                    >
                      <i className="fas fa-plus-circle" /> Credit (+)
                    </button>
                    <button
                      style={S.typeBtn(adjType === 'DEBIT', 'DEBIT')}
                      onClick={() => setAdjType('DEBIT')}
                    >
                      <i className="fas fa-minus-circle" /> Debit (−)
                    </button>
                  </div>

                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Amount (USDT)</label>
                    <input
                      type="number"
                      className="ud-input"
                      style={S.input}
                      value={adjAmount}
                      onChange={e => setAdjAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Reason <span style={{ color: '#636b80', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      className="ud-input"
                      style={S.input}
                      value={adjReason}
                      onChange={e => setAdjReason(e.target.value)}
                      placeholder="e.g. Bonus, Correction, Refund"
                    />
                  </div>

                  <div style={S.adjustActions}>
                    <button
                      className={adjType === 'CREDIT' ? 'ud-btn-success' : 'ud-btn-danger'}
                      style={adjType === 'CREDIT' ? S.btnSuccess : S.btnDanger}
                      onClick={handleAdjust}
                      disabled={adjusting}
                    >
                      {adjusting
                        ? <><i className="fas fa-spinner fa-spin" /> Processing…</>
                        : adjType === 'CREDIT'
                          ? <><i className="fas fa-check" /> Confirm Credit</>
                          : <><i className="fas fa-check" /> Confirm Debit</>
                      }
                    </button>
                    <button
                      className="ud-btn-secondary"
                      style={S.btnSecondary}
                      onClick={() => { setShowAdjust(false); setAdjAmount(''); setAdjReason(''); }}
                      disabled={adjusting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bank Accounts ── */}
        <div style={{ ...S.card, marginBottom: '32px' }}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>
              <i className="fas fa-university" style={{ color: '#818cf8', fontSize: '13px' }} />
              Linked Bank Accounts
            </h3>
            <span style={S.badge('#818cf8', 'rgba(99,102,241,0.1)', 'rgba(99,102,241,0.25)')}>
              {user.bankCards?.length ?? 0} Account{(user.bankCards?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={S.cardBody}>
            {user.bankCards && user.bankCards.length > 0 ? (
              user.bankCards.map((bank, idx) => (
                <div key={idx} className="ud-bank-card" style={S.bankCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: 'white', fontSize: '16px',
                    }}>
                      <i className="fas fa-university" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.bankName}>{bank.bankName || 'Bank'}</div>
                      <div style={S.bankAcct}>{bank.accountNo || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={S.bankRight}>
                    <div style={S.bankIfsc}>{bank.ifsc || '—'}</div>
                    <div style={S.bankHolder}>{bank.holderName || '—'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={S.empty}>
                <div style={S.emptyIcon}><i className="fas fa-university" /></div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#4a5068' }}>No bank accounts linked</div>
                <div style={{ fontSize: '12px' }}>This user hasn't added any bank accounts yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
