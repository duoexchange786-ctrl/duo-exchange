"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

export default function DemoPage() {
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
        // filter for exchange / withdraw (type === 'SELL')
        const exchanges = (data.history || []).filter(tx => tx.type?.toUpperCase() === 'SELL');
        setHistory(exchanges);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
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
          <header className="header" style={{backgroundColor: '#fff', borderBottom: '1px solid #eee'}}>
            <div className="brdc">
              <div className="back-btn" onClick={() => router.back()} style={{cursor: 'pointer'}}>
                <img src="/images/back-btn.png" alt="Back" style={{ width: '20px' }} />
              </div>
              <h3>Exchange History</h3>
            </div>
          </header>

          <div className="page-wrapperss" style={{ backgroundColor: '#F8F9FA', minHeight: 'calc(100vh - 60px)', paddingBottom: '60px' }}>
            <section className="section-1" style={{ padding: '0' }}>
              {loading ? (
                <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>Loading...</p>
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <img src="/images/empty.jpg" alt="No History" width="120" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="history-list" style={{ marginTop: '35px'  }}>
                  {history.map((tx) => {
                    const rawId = tx.depositId || tx.txnId || tx._id.slice(-8).toUpperCase();
                    // Match CD20**** pattern for Exchange
                    const displayTxId = "CD20****" + rawId.slice(-4).toUpperCase();
                    const statusText = tx.status === 'APPROVED' ? 'Success' : (tx.status || 'Pending');
                    const statusColor = statusText.toLowerCase() === 'success' ? '#28a745' : '#f39c12';
                    const inrAmount = (tx.amount * 112.5).toLocaleString('en-IN', { maximumFractionDigits: 0 });

                    return (
                      <Link href={`/exchange-detail?id=${tx._id || tx.id}`} key={tx._id || tx.id} className="history-card" style={{ textDecoration: 'none', display: 'block',  border:"1px solid #dfdfdfff" , padding:"10px" , marginTop:"10px" , borderRadius:"10px" }}>
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
                          <div className="status" style={{ color: statusColor }}>{statusText}</div>
                        </div>
                        
                        <div className="card-middle">
                          <div className="info-row">
                            <span className="label">Payment Method</span>
                            <span className="value">IMPS</span>
                          </div>
                          
                          <div className="info-row">
                            <span className="label">Trade detail</span>
                            <span className="value trade-detail-val">
                              <span className="tether-icon">₮</span>
                              <span>{tx.amount}</span>
                              <span className="exchange-arrows">⇆</span>
                              <span>₹{inrAmount}</span>
                            </span>
                          </div>

                          <div className="info-row">
                            <span className="label">Create time</span>
                            <span className="value date-value">
                              {`${new Date(tx.createdAt).getDate()}/${new Date(tx.createdAt).getMonth() + 1}/${new Date(tx.createdAt).getFullYear()}, ${new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}`}
                            </span>
                          </div>
                        </div>
                      </Link>
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
          padding: 0 16px;
          background-color: #F8F9FA;
        }

        .history-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          border: 1px solid #eaeaea;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #f1f1f1;
          gap: 12px;
        }

        .id-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .tx-id {
          font-weight: 700;
          font-size: 15px;
          color: #222;
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
          font-weight: 700;
          font-size: 14px;
        }

        .card-middle {
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
          color: #999;
          font-size: 13px;
        }

        .value {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          color: #222;
        }

        .date-value {
          font-weight: 400;
          color: #999;
        }

        .trade-detail-val {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .exchange-arrows {
          color: #aaa;
          font-size: 14px;
          font-weight: 500;
          margin: 0 2px;
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
          font-size: 11px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
