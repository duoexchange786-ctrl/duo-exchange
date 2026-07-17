"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useToast } from '@/app/components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile');
      if (res.status === 401) return router.replace('/admin/login');
      if (res.status === 404) {
        setEmail('admin@duoexchange.com');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.admin) {
        setEmail(data.admin.email);
        setRole(data.admin.role || 'admin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPassword) return showToast('Current password is required', 'error');
    if (!newPassword) return showToast('New password is required', 'error');
    if (newPassword.length < 8) return showToast('New password must be at least 8 characters', 'error');

    setSaving(true);
    try {
      const body = { currentPassword, newPassword };
      // Only admin can change email — moderators send password only
      if (role === 'admin') {
        body.newEmail = email || undefined;
      }

      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 404) {
        showToast('Profile API not implemented yet', 'info');
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        showToast('Password updated successfully ✅', 'success');
        setCurrentPassword('');
        setNewPassword('');
        if (data.emailChanged) {
          showToast('Email changed — please login again', 'info');
          setTimeout(() => router.replace('/admin/login'), 1500);
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Server error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        Loading profile...
      </div>
    );
  }

  const initial = email.charAt(0).toUpperCase();
  const isModerator = role === 'moderator';

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            {isModerator ? 'Change your account password' : 'Manage your admin account details'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Identity Card */}
        <div className={styles.sectionCard} style={{ overflow: 'hidden' }}>
          <div style={{
            background: isModerator
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '28px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: isModerator
                ? 'linear-gradient(135deg, #f59e0b, #eab308)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
              boxShadow: isModerator
                ? '0 0 20px rgba(245, 158, 11, 0.3)'
                : '0 0 20px rgba(99, 102, 241, 0.3)',
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f0f2ff', marginBottom: '4px' }}>
                {isModerator ? 'Moderator' : 'Administrator'}
              </div>
              <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '10px' }}>{email}</div>
              <span className={`${styles.badge} ${isModerator ? styles.badgeYellow : styles.badgePurple}`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <i className={isModerator ? 'fas fa-user-check' : 'fas fa-shield-alt'} style={{ fontSize: '10px' }} />
                {isModerator ? 'Moderator' : ' Admin'}
              </span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div className={styles.settingsSectionTitle}>
              <i className="fas fa-user-edit" style={{ color: isModerator ? '#f59e0b' : '#6366f1' }} />
              Account Information
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => !isModerator && setEmail(e.target.value)}
                className={styles.input}
                placeholder="admin@duoexchange.com"
                disabled={isModerator}
                style={isModerator ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              />
              {isModerator && (
                <p className={styles.formHint} style={{ color: '#f59e0b' }}>
                  <i className="fas fa-lock" style={{ marginRight: '4px', fontSize: '10px' }} />
                  Email cannot be changed by moderators
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="fas fa-lock" style={{ color: '#f59e0b', marginRight: '8px' }} />
              Change Password
            </h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-lock" style={{ marginRight: '6px', color: '#636b80' }} />
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter your current password"
              />
              <p className={styles.formHint}>Required to make any changes</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-key" style={{ marginRight: '6px', color: '#a855f7' }} />
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={saving}
                id="admin-profile-save-btn"
              >
                {saving
                  ? <><i className="fas fa-spinner fa-spin" /> Saving...</>
                  : <><i className="fas fa-save" /> Update Password</>
                }
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}