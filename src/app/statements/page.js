'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/footer';

export default function StatementsPage() {
  const router = useRouter();
  const [statements, setStatements] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [stmtRes, walletRes] = await Promise.all([
          fetch("/api/statements", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/wallet", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (stmtRes.ok) {
          const data = await stmtRes.json();
          setStatements(data.statements || []);
        }
        
        if (walletRes.ok) {
          const wData = await walletRes.json();
          setBalance(wData.usdtAvailable || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Group by Date
  const groupedStatements = statements.reduce((acc, stmt) => {
    const d = new Date(stmt.createdAt);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(stmt);
    return acc;
  }, {});

  return (
    <div>
      <main>
        <div className="page-wrappers empty-page full-height" style={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
            
            {/* Header */}
            <header style={{
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              position: 'relative',
              borderBottom: '1px solid #f1f1f1'
            }}>
              <div style={{ cursor: 'pointer', position: 'absolute', left: '16px' }} onClick={() => router.back()}>
                <img src="/images/back-btn.png" alt="Back" style={{ width: '20px' }} />
              </div>
              <h3 style={{ margin: '0 auto', fontSize: '18px', fontWeight: '700', color: '#111' }}>Statements</h3>
            </header>

            <div style={{ padding: '16px', flex: 1 }}>
              {/* Wallet Banner Card */}
              <div style={{
                backgroundColor: '#e8f5e9',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ color: '#555', fontSize: '14px', marginBottom: '8px' }}>Wallet total amount</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#111' }}>${balance.toFixed(2)}</div>
                </div>
                <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#4285f4', 
                    borderRadius: '8px' 
                  }}></div>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: '24px', 
                    height: '16px', 
                    backgroundColor: '#8bc34a', 
                    borderRadius: '4px' 
                  }}></div>
                </div>
              </div>

              {loading ? (
                <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>Loading...</p>
              ) : Object.keys(groupedStatements).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>No statements available.</div>
              ) : (
                <div style={{ paddingBottom: '20px' }}>
                  {Object.entries(groupedStatements).map(([dateStr, stmts]) => (
                    <div key={dateStr} style={{ marginBottom: '8px' }}>
                      <div style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>{dateStr}</div>
                      
                      {stmts.map((stmt, i) => {
                        const isDeposit = stmt.type === 'DEPOSIT' || stmt.type === 'ADMIN_CREDIT';
                        const amountStr = (isDeposit ? '+$' : '-$') + stmt.amount.toFixed(2);
                        const amountColor = isDeposit ? '#28a745' : '#e74c3c';
                        
                        const timeStr = new Date(stmt.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        
                        // Map type names
                        let typeName = stmt.type;
                        if (typeName === 'SELL') typeName = 'Exchange';
                        else typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1).toLowerCase();

                        // Map Status
                        let statusText = stmt.status;
                        if (statusText === 'PENDING') statusText = 'Pending';
                        if (statusText === 'SUCCESS' || statusText === 'COMPLETED' || statusText === 'APPROVED') statusText = 'Success';
                        if (statusText === 'FAILED' || statusText === 'REJECTED') statusText = 'Failed';

                        return (
                          <div key={i} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '12px 0',
                            borderBottom: '1px solid #f1f1f1'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                backgroundColor: '#f8f9fa', 
                                border: '1px solid #eee',
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#555',
                                fontSize: '18px'
                              }}>
                                ⇄
                              </div>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{typeName}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>{timeStr}</div>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: amountColor, marginBottom: '4px' }}>{amountStr}</div>
                              <div style={{ fontSize: '12px', color: '#888' }}>Status: {statusText}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
