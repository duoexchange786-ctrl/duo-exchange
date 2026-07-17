"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "../components/footer";

export default function DepositHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        // filter for deposits
        const deposits = (data.history || []).filter(tx => tx.type?.toLowerCase() === 'deposit' || tx.type === 'DEPOSIT');
        setHistory(deposits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <main>
        <div className="page-wrappers no-empty-page">
          <header className="header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
            <div className="brdc">
              <div className="back-btn" onClick={() => router.back()} style={{ cursor: 'pointer' }}>
                <img src="/images/back-btn.png" alt="Back" style={{ width: '20px' }} />
              </div>
              <h3>Deposit History</h3>
            </div>
          </header>

          <div className="page-wrapperss" style={{ paddingTop: '20px', backgroundColor: '#F8F9FA', minHeight: 'calc(100vh - 60px)' }}>
            <section className="section-1" style={{ padding: '0 16px 20px 16px' }}>
              {loading ? (
                <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>Loading...</p>
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty.jpg" alt="No History" width="120" />
                  <p>No deposit history found</p>
                </div>
              ) : (
                <div className="history-list"
                  style={{ marginTop: '35px' }}
                >
                  {history.map((tx) => {
                    const txId = tx.depositId || tx.txnId || tx._id.slice(-8).toUpperCase();
                    const displayTxId = "DEP20****" + txId.slice(-4).toUpperCase();
                    const isTRC20 = tx.network?.toUpperCase().includes('TRC20');
                    const isERC20 = tx.network?.toUpperCase().includes('ERC20');
                    const networkIcon = isTRC20 ? '/images/trx.png' : isERC20 ? '/images/eth.png' : '/images/bnb.png'; // Fallback to bnb for BEP20

                    return (
                      <div key={tx._id} className="history-card">
                        <div className="card-top">
                          <div className="id-section">
                            <div className="doc-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            </div>
                            <span className="tx-id">{displayTxId}</span>
                          </div>
                          <div className="status">{tx.status === 'APPROVED' ? 'Finish' : tx.status || 'Finish'}</div>
                        </div>

                        <div className="card-middle">
                          <div className="info-row">
                            <span className="label">Network</span>
                            <span className="value">
                              <img src={networkIcon} alt="network" width="16" height="16" className="network-icon" />
                              {tx.network || 'BEP20-USDT'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Create time</span>
                            <span className="value date-value">
                              {new Date(tx.createdAt).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="card-bottom">
                          <span className="label">Trade detail</span>
                          <span className="amount">
                            <span className="tether-icon">₮</span>
                            <span className="amount-val">{tx.amount}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
        <Footer />
      </main>

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 60px;
          color: #666;
        }

        .empty-state p {
          margin-top: 12px;
          font-size: 14px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-card {
          background-color: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #F0F2F5;
          gap: 12px;
        }

        .id-section {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .tx-id {
          font-weight: 700;
          font-size: 15px;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: #F0F2F5;
          border-radius: 50%;
        }

        .status {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .card-middle {
          background-color: #F5F5F5;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: #888;
          font-size: 13px;
        }

        .value {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          color: #333;
        }
        
        .date-value {
          font-weight: 500;
        }

        .network-icon {
          border-radius: 50%;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .amount {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tether-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background-color: #26A17B;
          color: #fff;
          border-radius: 50%;
          font-size: 10px;
          font-weight: bold;
        }

        .amount-val {
          font-weight: 700;
          font-size: 16px;
          color: #111;
        }
      `}</style>
    </div>
  );
}
