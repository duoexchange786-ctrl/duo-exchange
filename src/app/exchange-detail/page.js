"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../components/footer";

function ExchangeDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [tx, setTx] = useState(null);
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch history to find the tx
        const resHist = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const histData = await resHist.json();
        const transaction = (histData.history || []).find(t => t._id === id || t.id === id);
        
        if (transaction) {
          setTx(transaction);
          
          // Fetch banks to find the payee info
          const resBank = await fetch("/api/bank-card", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resBank.ok) {
            const bankData = await resBank.json();
            const matchedBank = (bankData.banks || []).find(b => b.accountNo === transaction.address);
            if (matchedBank) {
              setBank(matchedBank);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666' }}>Loading details...</p>
      </div>
    );
  }

  if (!tx) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirction: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>Transaction not found</p>
        <button onClick={() => router.back()} style={{ padding: '8px 16px', background: '#10a992', color: '#fff', border: 'none', borderRadius: '4px' }}>Go Back</button>
      </div>
    );
  }

  const inrAmount = (tx.amount * 112.5).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const formattedDate = new Date(tx.createdAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  }).replace(',', ' at'); // e.g. 15 May 2026 at 10:18:01

  // Status mapping
  const isApproved = tx.status === 'APPROVED' || tx.status === 'SUCCESS';
  const isFailed = tx.status === 'FAILED' || tx.status === 'REJECTED';
  
  // Progress tracker logic
  const step1Bg = '#28a745';
  const step2Bg = isApproved ? '#28a745' : (isFailed ? '#dc3545' : '#b5b5b5');
  const step3Bg = isApproved ? '#28a745' : (isFailed ? '#dc3545' : '#b5b5b5');

  const payeeInfo = tx.bankDetails || bank || {};

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="page-wrappers no-empty-page" style={{ paddingBottom: '0' }}>
        <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper" style={{ padding: 0, backgroundColor: '#F8F9FA', minHeight: '100vh', margin: '0 auto' }}>
          
          <header style={{backgroundColor: '#fff', paddingTop: '20px', paddingBottom: '24px'}}>
            <div className="brdc" style={{ backgroundColor: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
              <div className="back-btn" onClick={() => router.back()} style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <img src="/images/back-btn.png" alt="Back" style={{ width: '20px', display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ color: '#555', fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>You will receive</p>
              <h2 style={{ fontSize: '36px', margin: '0', color: '#000', fontWeight: '700' }}>₹{inrAmount}</h2>
            </div>
          </header>

          <div style={{ backgroundColor: '#fff', padding: '24px 20px', marginTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* Background Lines */}
              <div style={{ position: 'absolute', top: '13px', left: '16.5%', right: '16.5%', height: '2px', backgroundColor: '#e0e0e0', zIndex: 1 }}></div>
              {(isApproved || isFailed) && (
                <div style={{ position: 'absolute', top: '13px', left: '16.5%', right: '16.5%', height: '2px', backgroundColor: isFailed ? '#dc3545' : '#28a745', zIndex: 2 }}></div>
              )}

              {/* Step 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '33%' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#28a745', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '700', color: '#111' }}>Submitted</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{formattedDate}</p>
              </div>
              
              {/* Step 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '33%' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step2Bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{isFailed ? '✕' : '✓'}</div>
              </div>
              
              {/* Step 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '33%' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step3Bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{isFailed ? '✕' : '✓'}</div>
                <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '700', color: '#111' }}>{isFailed ? 'Failed' : (isApproved ? 'Success' : 'Pending')}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px 20px', marginTop: '12px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '24px', color: '#111', fontWeight: '700' }}>Payee information</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Account No</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>{payeeInfo.accountNo || tx.address || 'N/A'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>IFSC / SWIFT</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>{payeeInfo.ifsc || '-'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Payee Name</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>{payeeInfo.payeeName || '-'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Bank Name</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>{payeeInfo.bankName || '-'}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px 20px', marginTop: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '24px', color: '#111', fontWeight: '700' }}>Trade information</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Trade no</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>{tx.depositId || `SELL-${tx._id.slice(-8).toUpperCase()}`}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Payment Method</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500' }}>IMPS</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Trade detail</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', fontSize: '14px', fontWeight: '600' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', backgroundColor: '#26A17B', color: '#fff', borderRadius: '50%', fontSize: '11px' }}>₮</span>
                {tx.amount}
                <span style={{ color: '#888', fontSize: '18px', margin: '0 2px' }}>⇆</span>
                ₹{inrAmount}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Remark</span>
              <span style={{ color: '#111', fontSize: '14px', fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{tx.description || '-'}</span>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function ExchangeDetail() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>}>
      <ExchangeDetailContent />
    </Suspense>
  );
}
