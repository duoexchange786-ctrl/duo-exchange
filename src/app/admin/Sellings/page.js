"use client";
import { useEffect, useState } from "react";
import styles from '../admin.module.css';
import Modal from '../components/Modal';
import { useToast } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

export default function AdminSellingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [acceptRemark, setAcceptRemark] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending-selling-requests");
      const data = await res.json();
      if (res.ok) setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setAcceptRemark('');
    setIsAcceptModalOpen(true);
  };

  const closeAcceptModal = () => {
    setIsAcceptModalOpen(false);
    setAcceptRemark('');
  };

  const handleConfirm = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/confirm-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest._id || selectedRequest.id, remark: acceptRemark }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Selling request confirmed ✅', 'success');
        fetchRequests();
        closeAcceptModal();
        closeDetailsModal();
      } else showToast(data.error || 'Failed to confirm request', 'error');
    } catch (err) {
      console.error(err);
      showToast('Error confirming request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return showToast('Please provide a rejection reason', 'error');
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reject-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest._id || selectedRequest.id, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Selling request rejected ❌', 'success');
        fetchRequests();
        closeRejectModal();
        closeDetailsModal();
      } else showToast(data.error || 'Failed to reject request', 'error');
    } catch (err) {
      console.error(err);
      showToast('Error rejecting request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading requests...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Selling Requests</h1>
          <p className={styles.pageSubtitle}>Manage pending crypto sell requests</p>
        </div>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((r) => {
                const txId = r._id || r.id;
                return (
                <tr key={txId}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{r.user?.email || 'N/A'}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>ID: #{txId}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e2e8f0" }}>${r.amount}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "14px", color: "#cbd5e1", fontFamily: "monospace" }}>{r.address?.substring(0, 12)}...</div>
                  </td>
                  <td>
                    <span className={`${styles.statBadge} ${styles.badgeYellow}`}>
                      <i className="fas fa-clock" style={{ marginRight: "4px" }}></i> {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => openDetailsModal(r)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => openAcceptModal(r)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#10b981" }}
                        disabled={processing}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        onClick={() => openRejectModal(r)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#ef4444" }}
                        disabled={processing}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No pending selling requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Withdrawal Details"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeDetailsModal}>Close</button>
            <button className={styles.btnDanger} onClick={() => openRejectModal(selectedRequest)}>Reject</button>
            <button className={styles.btnPrimary} onClick={() => openAcceptModal(selectedRequest)}>Confirm Withdrawal</button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Transaction ID</span>
              <span className={styles.detailValue}>#{selectedRequest._id || selectedRequest.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>User Email</span>
              <span className={styles.detailValue}>{selectedRequest.user?.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount</span>
              <span className={styles.detailValue} style={{ fontSize: '18px', color: '#059669' }}>${selectedRequest.amount}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`${styles.statBadge} ${styles.badgeYellow}`}>{selectedRequest.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>Bank/Wallet Details</h4>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', wordBreak: 'break-all', color: '#e2e8f0' }}>
                {selectedRequest.bankDetails ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                    <div><strong style={{color: '#94a3b8'}}>Bank:</strong> {selectedRequest.bankDetails.bankName || 'N/A'}</div>
                    <div><strong style={{color: '#94a3b8'}}>Account No:</strong> {selectedRequest.bankDetails.accountNo || selectedRequest.address}</div>
                    <div><strong style={{color: '#94a3b8'}}>IFSC:</strong> {selectedRequest.bankDetails.ifsc || 'N/A'}</div>
                    <div><strong style={{color: '#94a3b8'}}>Payee Name:</strong> {selectedRequest.bankDetails.payeeName || 'N/A'}</div>
                  </div>
                ) : (
                  selectedRequest.address || 'No address provided'
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Request"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeRejectModal}>Cancel</button>
            <button className={styles.btnDanger} onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: '16px', color: '#4b5563' }}>
            Please provide a reason for rejecting this request. This will be visible to the user.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Rejection Reason</label>
            <textarea
              className={styles.formInput}
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Invalid bank details, Suspicious activity..."
            ></textarea>
          </div>
        </div>
      </Modal>

      {/* Accept Modal */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={closeAcceptModal}
        title="Confirm Request"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeAcceptModal}>Cancel</button>
            <button className={styles.btnPrimary} onClick={handleConfirm} disabled={processing}>
              {processing ? 'Confirming...' : 'Accept Request'}
            </button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: '16px', color: '#4b5563' }}>
            Please provide a remark for accepting this request. This will be visible to the user.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Acceptance Remark</label>
            <textarea
              className={styles.formInput}
              rows="4"
              value={acceptRemark}
              onChange={(e) => setAcceptRemark(e.target.value)}
              placeholder="e.g., Processed successfully, Ref ID: 123456..."
            ></textarea>
          </div>
        </div>
      </Modal>
    </>
  );
}
