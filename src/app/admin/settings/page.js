"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

const TABS = [
  { id: 'general',    label: 'General',    icon: 'fas fa-sliders-h' },
  { id: 'crypto',     label: 'Crypto',     icon: 'fas fa-coins' },
  { id: 'referral',   label: 'Referral',   icon: 'fas fa-share-alt' },
  { id: 'security',   label: 'Security',   icon: 'fas fa-shield-alt' },
  { id: 'moderators', label: 'Moderators', icon: 'fas fa-user-check' },
  { id: 'modLogs',    label: 'Mod Logs',   icon: 'fas fa-clipboard-list' },
];

export default function AdminSettingsPage() {
  const [rate, setRate] = useState(102);
  const [depositMin, setDepositMin] = useState(100);
  const [withdrawMin, setWithdrawMin] = useState(50);
  const [moderatorAmountLimit, setModeratorAmountLimit] = useState(500);

  const [trc20Address, setTrc20Address] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [trc20QrUrl, setTrc20QrUrl] = useState('');
  const [erc20QrUrl, setErc20QrUrl] = useState('');

  const [referralLevel1, setReferralLevel1] = useState(0.1);
  const [referralLevel2, setReferralLevel2] = useState(0.03);
  const [referralLevel3, setReferralLevel3] = useState(0.02);
  const [referralLevel4, setReferralLevel4] = useState(0.01);
  const [referralLevel5, setReferralLevel5] = useState(0.01);

  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  // Moderator management
  const [moderators, setModerators] = useState([]);
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [creatingMod, setCreatingMod] = useState(false);
  const [loadingMods, setLoadingMods] = useState(false);

  // Mod logs
  const [modLogs, setModLogs] = useState([]);
  const [modLogsTotal, setModLogsTotal] = useState(0);
  const [modLogsPage, setModLogsPage] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (activeTab === 'moderators') fetchModerators();
    if (activeTab === 'modLogs') fetchModLogs(1);
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/profile'),
      ]);
      if (settingsRes.status === 401 || profileRes.status === 401) {
        return router.replace('/admin/login');
      }
      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        const s = settingsData.settings;
        setRate(s.rate);
        setDepositMin(s.depositMin);
        setWithdrawMin(s.withdrawMin);
        setTrc20Address(s.trc20Address || '');
        setErc20Address(s.erc20Address || '');
        setTrc20QrUrl(s.trc20QrUrl || '');
        setErc20QrUrl(s.erc20QrUrl || '');
        if (s.referralLevel1 !== undefined) setReferralLevel1(s.referralLevel1);
        if (s.referralLevel2 !== undefined) setReferralLevel2(s.referralLevel2);
        if (s.referralLevel3 !== undefined) setReferralLevel3(s.referralLevel3);
        if (s.referralLevel4 !== undefined) setReferralLevel4(s.referralLevel4);
        if (s.referralLevel5 !== undefined) setReferralLevel5(s.referralLevel5);
        if (s.moderatorAmountLimit !== undefined) setModeratorAmountLimit(s.moderatorAmountLimit);
      }
      const profileData = await profileRes.json();
      if (profileData.success && profileData.admin) {
        setAdminEmail(profileData.admin.email || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerators = async () => {
    setLoadingMods(true);
    try {
      const res = await fetch('/api/admin/moderators');
      const data = await res.json();
      if (res.ok && data.moderators) setModerators(data.moderators);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMods(false);
    }
  };

  const fetchModLogs = async (page = 1) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/moderator-logs?page=${page}&pageSize=20`);
      const data = await res.json();
      if (res.ok) {
        setModLogs(data.logs || []);
        setModLogsTotal(data.total || 0);
        setModLogsPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSave = async () => {
    if (!trc20Address || !erc20Address) {
      showToast('Both TRC20 and ERC20 addresses are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        rate: parseFloat(rate) || 0,
        depositMin: parseFloat(depositMin) || 0,
        withdrawMin: parseFloat(withdrawMin) || 0,
        trc20Address, erc20Address, trc20QrUrl, erc20QrUrl,
        referralLevel1: parseFloat(referralLevel1) || 0,
        referralLevel2: parseFloat(referralLevel2) || 0,
        referralLevel3: parseFloat(referralLevel3) || 0,
        referralLevel4: parseFloat(referralLevel4) || 0,
        referralLevel5: parseFloat(referralLevel5) || 0,
        moderatorAmountLimit: parseFloat(moderatorAmountLimit) || 500,
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Settings updated successfully ✅', 'success');
        fetchSettings();
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (!currentPassword) {
      showToast('Current password is required', 'error');
      return;
    }
    setUpdatingSecurity(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail: adminEmail, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Security settings updated ✅', 'success');
        setCurrentPassword('');
        setNewPassword('');
        if (data.emailChanged) {
          showToast('Email changed! Please login again.', 'success');
          setTimeout(() => router.push('/admin/login'), 2000);
        } else {
          fetchSettings();
        }
      } else {
        showToast(data.error || 'Failed to update security settings', 'error');
      }
    } catch (err) {
      showToast('Failed to update security settings', 'error');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleCreateModerator = async () => {
    if (!modEmail || !modPassword) {
      showToast('Email and password are required', 'error');
      return;
    }
    if (modPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setCreatingMod(true);
    try {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: modEmail, password: modPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Moderator created successfully ✅', 'success');
        setModEmail('');
        setModPassword('');
        fetchModerators();
      } else {
        showToast(data.error || 'Failed to create moderator', 'error');
      }
    } catch (err) {
      showToast('Failed to create moderator', 'error');
    } finally {
      setCreatingMod(false);
    }
  };

  const handleDeleteModerator = async (id, email) => {
    const ok = await confirm(`Delete moderator "${email}"? This action cannot be undone.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/moderators?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('Moderator deleted ✅', 'success');
        fetchModerators();
      } else {
        showToast(data.error || 'Failed to delete moderator', 'error');
      }
    } catch (err) {
      showToast('Failed to delete moderator', 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        Loading settings...
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Configure platform settings and preferences</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            <i className={tab.icon} style={{ marginRight: '7px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.sectionCard}>
        <div style={{ padding: '28px 24px', maxWidth: activeTab === 'modLogs' ? '100%' : '640px' }}>

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-sliders-h" style={{ color: '#6366f1' }} />
                Transaction Settings
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-chart-line" style={{ marginRight: '6px', color: '#22c55e' }} />
                  Exchange Rate (per USDT in ₹)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="0.01"
                  placeholder="e.g. 102"
                />
                <p className={styles.formHint}>Exchange rate for USDT to INR conversion</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-arrow-down" style={{ marginRight: '6px', color: '#38bdf8' }} />
                  Minimum Deposit Amount (USDT)
                </label>
                <input
                  type="number"
                  value={depositMin}
                  onChange={(e) => setDepositMin(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="1"
                  placeholder="e.g. 100"
                />
                <p className={styles.formHint}>Minimum USDT amount users can deposit</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-arrow-up" style={{ marginRight: '6px', color: '#f59e0b' }} />
                  Minimum Withdrawal Amount (USDT)
                </label>
                <input
                  type="number"
                  value={withdrawMin}
                  onChange={(e) => setWithdrawMin(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="1"
                  placeholder="e.g. 50"
                />
                <p className={styles.formHint}>Minimum USDT amount users can withdraw</p>
              </div>

              <div style={{ height: '16px' }} />

              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-user-check" style={{ color: '#f59e0b' }} />
                Moderator Settings
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-dollar-sign" style={{ marginRight: '6px', color: '#f59e0b' }} />
                  Moderator Amount Limit (USDT)
                </label>
                <input
                  type="number"
                  value={moderatorAmountLimit}
                  onChange={(e) => setModeratorAmountLimit(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="1"
                  min="0"
                  placeholder="e.g. 500"
                />
                <p className={styles.formHint}>
                  Moderators can only view and approve/reject deposits & withdrawals up to this amount.
                  Transactions above this limit will only be visible to the admin.
                </p>
              </div>

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── CRYPTO ── */}
          {activeTab === 'crypto' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-coins" style={{ color: '#f59e0b' }} />
                Crypto Wallet Addresses
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>These wallet addresses and QR codes will be shown to users when they make a deposit.</span>
              </div>

              <NetworkField label="TRC20 Address" icon="fas fa-network-wired" iconColor="#f59e0b"
                value={trc20Address} onChange={setTrc20Address} placeholder="Enter TRC20 wallet address"
                qrUrl={trc20QrUrl} onQrChange={setTrc20QrUrl} qrLabel="TRC20 QR Code" />

              <div style={{ height: '24px' }} />

              <NetworkField label="ERC20 Address" icon="fas fa-network-wired" iconColor="#38bdf8"
                value={erc20Address} onChange={setErc20Address} placeholder="Enter ERC20 wallet address"
                qrUrl={erc20QrUrl} onQrChange={setErc20QrUrl} qrLabel="ERC20 QR Code" />

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── REFERRAL ── */}
          {activeTab === 'referral' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-share-alt" style={{ color: '#a855f7' }} />
                Referral Commission Rates
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>Set the commission percentage each referral level earns when their subordinate completes a transaction.</span>
              </div>

              {[
                { label: 'Level 1 — Direct Referrer',    emoji: '🥇', val: referralLevel1, set: setReferralLevel1 },
                { label: 'Level 2 — 2nd Upline',         emoji: '🥈', val: referralLevel2, set: setReferralLevel2 },
                { label: 'Level 3 — 3rd Upline',         emoji: '🥉', val: referralLevel3, set: setReferralLevel3 },
                { label: 'Level 4 — 4th Upline',         emoji: '4️⃣', val: referralLevel4, set: setReferralLevel4 },
                { label: 'Level 5 — 5th Upline',         emoji: '5️⃣', val: referralLevel5, set: setReferralLevel5 },
              ].map((lvl, i) => (
                <div key={i} className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {lvl.emoji}&nbsp; {lvl.label} <span style={{ color: '#636b80', fontWeight: 400 }}>(%)</span>
                  </label>
                  <input
                    type="number"
                    value={lvl.val}
                    onChange={(e) => lvl.set(e.target.value)}
                    className={styles.input}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>
              ))}

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-shield-alt" style={{ color: '#ef4444' }} />
                Admin Credentials
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-lock" style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <span>Update your admin email or password. You must enter your current password to confirm any changes.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }} />
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={styles.input}
                  placeholder="admin@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-key" style={{ marginRight: '6px', color: '#a855f7' }} />
                  New Password <span style={{ color: '#636b80', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Leave blank to keep current password"
                />
                <p className={styles.formHint}>Must be at least 8 characters</p>
              </div>

              <div className={styles.formGroup} style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px',
              }}>
                <label className={styles.formLabel} style={{ color: '#f87171' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }} />
                  Current Password <span style={{ fontWeight: 400 }}>(Required to save)</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your current password to confirm"
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleUpdateSecurity}
                  disabled={updatingSecurity || !currentPassword}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ opacity: !currentPassword ? 0.5 : 1 }}
                >
                  {updatingSecurity
                    ? <><i className="fas fa-spinner fa-spin" /> Updating...</>
                    : <><i className="fas fa-shield-alt" /> Update Security Settings</>
                  }
                </button>
              </div>
            </>
          )}

          {/* ── MODERATORS ── */}
          {activeTab === 'moderators' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-user-check" style={{ color: '#f59e0b' }} />
                Moderator Management
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Create moderator accounts that can login to the admin panel with limited access. 
                  Moderators can only view and approve/reject deposits & withdrawals within the configured amount limit.
                </span>
              </div>

              {/* Create new moderator */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{
                  fontSize: '14px', fontWeight: 700, color: '#f59e0b',
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <i className="fas fa-plus-circle" />
                  Create New Moderator
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={modEmail}
                    onChange={(e) => setModEmail(e.target.value)}
                    className={styles.input}
                    placeholder="moderator@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-key" style={{ marginRight: '6px', color: '#a855f7' }} />
                    Password
                  </label>
                  <input
                    type="password"
                    value={modPassword}
                    onChange={(e) => setModPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Min 8 characters"
                  />
                </div>

                <button
                  onClick={handleCreateModerator}
                  disabled={creatingMod || !modEmail || !modPassword}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ 
                    opacity: (!modEmail || !modPassword) ? 0.5 : 1,
                    background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                  }}
                >
                  {creatingMod
                    ? <><i className="fas fa-spinner fa-spin" /> Creating...</>
                    : <><i className="fas fa-user-plus" /> Create Moderator</>
                  }
                </button>
              </div>

              {/* Existing moderators list */}
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-users" style={{ color: '#6366f1' }} />
                Existing Moderators ({moderators.length})
              </div>

              {loadingMods ? (
                <div className={styles.loadingState} style={{ padding: '20px' }}>
                  <div className={styles.spinner} />
                  Loading...
                </div>
              ) : moderators.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px', color: '#636b80',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <i className="fas fa-user-slash" style={{ fontSize: '32px', marginBottom: '12px', display: 'block', color: '#4a5068' }} />
                  No moderators created yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {moderators.map((mod) => (
                    <div key={mod._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {mod.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f2ff' }}>{mod.email}</div>
                          <div style={{ fontSize: '11px', color: '#636b80' }}>
                            Created: {new Date(mod.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteModerator(mod._id, mod.email)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 14px', background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px',
                          color: '#f87171', fontSize: '12px', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <i className="fas fa-trash-alt" style={{ fontSize: '11px' }} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── MOD LOGS ── */}
          {activeTab === 'modLogs' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-clipboard-list" style={{ color: '#a855f7' }} />
                Moderator Activity Logs
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>All moderator actions are logged here. Track deposit/withdrawal approvals, rejections, and password changes.</span>
              </div>

              {loadingLogs ? (
                <div className={styles.loadingState} style={{ padding: '20px' }}>
                  <div className={styles.spinner} />
                  Loading logs...
                </div>
              ) : modLogs.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px', color: '#636b80',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <i className="fas fa-clipboard-check" style={{ fontSize: '36px', marginBottom: '12px', display: 'block', color: '#4a5068' }} />
                  No moderator activity logged yet
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table} style={{ minWidth: '700px' }}>
                      <thead>
                        <tr>
                          <th>Moderator</th>
                          <th>Action</th>
                          <th>Details</th>
                          <th>Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modLogs.map((log, i) => {
                          const actionColors = {
                            'CONFIRM_DEPOSIT': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: 'fa-check-circle' },
                            'REJECT_DEPOSIT': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: 'fa-times-circle' },
                            'CONFIRM_WITHDRAWAL': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', icon: 'fa-check-circle' },
                            'REJECT_WITHDRAWAL': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: 'fa-times-circle' },
                            'CHANGE_PASSWORD': { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', icon: 'fa-key' },
                            'LOGIN': { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', icon: 'fa-sign-in-alt' },
                          };
                          const ac = actionColors[log.action] || { bg: 'rgba(255,255,255,0.05)', color: '#a0aec0', icon: 'fa-circle' };
                          
                          return (
                            <tr key={log._id || i}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0,
                                  }}>
                                    {(log.moderatorEmail || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f2ff' }}>
                                    {log.moderatorEmail}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                                  padding: '3px 10px', borderRadius: '6px',
                                  background: ac.bg, color: ac.color,
                                  fontSize: '11px', fontWeight: 600,
                                }}>
                                  <i className={`fas ${ac.icon}`} style={{ fontSize: '10px' }} />
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '13px', color: '#a0aec0', wordBreak: 'break-word' }}>
                                  {log.details || '—'}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontSize: '13px', color: '#a0aec0' }}>
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '11px', color: '#636b80' }}>
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {modLogsTotal > 20 && (
                    <div style={{
                      display: 'flex', justifyContent: 'center', gap: '8px',
                      marginTop: '20px', paddingTop: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <button
                        onClick={() => fetchModLogs(modLogsPage - 1)}
                        disabled={modLogsPage <= 1}
                        className={`${styles.btn}`}
                        style={{
                          padding: '6px 14px', fontSize: '12px',
                          opacity: modLogsPage <= 1 ? 0.4 : 1,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#a0aec0', borderRadius: '8px', cursor: 'pointer',
                        }}
                      >
                        <i className="fas fa-chevron-left" style={{ marginRight: '4px' }} />
                        Previous
                      </button>
                      <span style={{
                        display: 'flex', alignItems: 'center',
                        fontSize: '12px', color: '#636b80', padding: '0 12px',
                      }}>
                        Page {modLogsPage} of {Math.ceil(modLogsTotal / 20)}
                      </span>
                      <button
                        onClick={() => fetchModLogs(modLogsPage + 1)}
                        disabled={modLogsPage >= Math.ceil(modLogsTotal / 20)}
                        className={`${styles.btn}`}
                        style={{
                          padding: '6px 14px', fontSize: '12px',
                          opacity: modLogsPage >= Math.ceil(modLogsTotal / 20) ? 0.4 : 1,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#a0aec0', borderRadius: '8px', cursor: 'pointer',
                        }}
                      >
                        Next
                        <i className="fas fa-chevron-right" style={{ marginLeft: '4px' }} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Helper: Save Bar ── */
function SaveBar({ onSave, saving }) {
  return (
    <div style={{
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <button
        onClick={onSave}
        disabled={saving}
        className={`${styles.btn} ${styles.btnPrimary}`}
      >
        {saving
          ? <><i className="fas fa-spinner fa-spin" /> Saving...</>
          : <><i className="fas fa-save" /> Save Changes</>
        }
      </button>
    </div>
  );
}

/* ── Helper: Network Field (address + QR) ── */
function NetworkField({ label, icon, iconColor, value, onChange, placeholder, qrUrl, onQrChange, qrLabel }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onQrChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 600, color: '#a0aec0', marginBottom: '8px',
        }}>
          <i className={icon} style={{ color: iconColor }} />
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#f0f2ff',
            background: '#0f111a',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a0aec0', marginBottom: '8px' }}>
          {qrLabel}
        </label>
        {qrUrl && (
          <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
            <img
              src={qrUrl}
              alt={qrLabel}
              style={{
                width: '120px', height: '120px', objectFit: 'cover',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                display: 'block',
              }}
            />
            <button
              onClick={() => onQrChange('')}
              style={{
                position: 'absolute', top: '-8px', right: '-8px',
                width: '22px', height: '22px',
                background: '#ef4444', border: 'none', borderRadius: '50%',
                color: 'white', fontSize: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{
            display: 'block',
            fontSize: '13px',
            color: '#636b80',
            background: '#0f111a',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}
