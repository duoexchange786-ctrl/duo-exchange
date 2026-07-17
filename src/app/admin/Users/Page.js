'use client';
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useToast } from '@/app/components/ToastProvider';
import UserDetailPage from './UserDetail';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // null = list view
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setPage(data.page || p);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // If a user is selected, render the full-page detail view
  if (selectedUser) {
    return (
      <UserDetailPage
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm)
    );
  });

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading users...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>
            {total} registered user{total !== 1 ? 's' : ''} on duoexchange
          </p>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>
            <i className="fas fa-search"></i>
          </span>
        </div>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Wallet Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '16px', color: 'white', flexShrink: 0,
                      }}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f0f2ff' }}>{user.fullName || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#636b80' }}>ID: #{user._id?.toString().slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px', color: '#c8d0e8' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#636b80' }}>{user.mobile || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '15px' }}>
                      ${parseFloat(user.wallet?.usdtAvailable ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#636b80' }}>USDT</div>
                  </td>
                  <td>
                    <span className={`${styles.statBadge} ${styles.badgeGreen}`}>Active</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={styles.viewAllBtn}
                    >
                      <i className="fas fa-eye" style={{ fontSize: '11px' }} />
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#636b80' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.4 }}>
                      <i className="fas fa-users" />
                    </div>
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.paginationContainer}>
        <button
          onClick={() => { if (page > 1) fetchUsers(page - 1); }}
          disabled={page <= 1}
          className={styles.paginationBtn}
        >
          ← Previous
        </button>
        <span style={{ fontSize: '13px', color: '#636b80', fontWeight: 500 }}>
          Page {page} of {Math.ceil(total / pageSize) || 1}
        </span>
        <button
          onClick={() => { if (page * pageSize < total) fetchUsers(page + 1); }}
          disabled={page * pageSize >= total}
          className={styles.paginationBtn}
        >
          Next →
        </button>
      </div>
    </>
  );
}
