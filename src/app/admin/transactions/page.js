'use client';
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
        setPage(data.page || p);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading transactions...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Transaction History</h2>
        <p className={styles.pageSubtitle}>View all deposits, withdrawals, and adjustments.</p>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.activityIcon} style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                        <i className={`fas ${txn.type === 'DEPOSIT' ? 'fa-wallet' : txn.type === 'SELL' ? 'fa-exchange-alt' : 'fa-cog'}`} 
                           style={{ color: txn.type === 'DEPOSIT' ? '#10b981' : txn.type === 'SELL' ? '#f59e0b' : '#6366f1' }}></i>
                      </div>
                      <span style={{ fontWeight: 500 }}>{txn.type}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{txn.user?.fullName || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{txn.user?.email}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: txn.type === 'DEPOSIT' || txn.type === 'ADMIN_CREDIT' ? '#059669' : '#dc2626' }}>
                    {txn.type === 'DEPOSIT' || txn.type === 'ADMIN_CREDIT' ? '+' : '-'}${txn.amount}
                  </td>
                  <td>
                    <span className={`${styles.statBadge} ${
                      txn.status === 'COMPLETED' ? styles.badgeGreen : 
                      txn.status === 'PENDING' ? styles.badgeYellow : 
                      styles.badgeRed
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#4b5563' }}>
                    {new Date(txn.createdAt).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {txn.description || '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.paginationContainer}>
        <button onClick={() => { if (page > 1) fetchTransactions(page - 1); }} disabled={page <= 1} className={styles.paginationBtn}>← Previous</button>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
        <button onClick={() => { if (page * pageSize < total) fetchTransactions(page + 1); }} disabled={page * pageSize >= total} className={styles.paginationBtn}>Next →</button>
      </div>
    </>
  );
}
