'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../components/footer';
import { useRouter } from 'next/navigation';

export default function ReferralsRewardPage() {
  const router = useRouter();
  const [referralData, setReferralData] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [codeRes, earningsRes] = await Promise.all([
          fetch('/api/referral/my-code', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/referral/earnings', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (codeRes.ok) {
          const codeData = await codeRes.json();
          setReferralData(codeData);
        }
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings(earningsData.earnings || []);
        }
      } catch (err) {
        console.error('Failed to fetch referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Generate days array from account creation to today
  const generateDays = () => {
    if (!referralData || !referralData.accountCreatedAt) return [];
    
    const accountDate = new Date(referralData.accountCreatedAt);
    accountDate.setHours(0,0,0,0);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const days = [];
    const current = new Date(today);
    
    while (current >= accountDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() - 1);
    }
    
    return days;
  };

  const getRewardForDay = (dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const dailyEarnings = earnings.filter(e => {
      const eDateStr = new Date(e.createdAt).toISOString().split('T')[0];
      return eDateStr === dateStr;
    });
    
    const total = dailyEarnings.reduce((sum, e) => sum + e.amount, 0);
    return total;
  };

  const daysList = generateDays();

  return (
    <div>
      <main>
        <div className="page-wrappers empty-page full-height" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
            <header style={{
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ cursor: 'pointer', position: 'absolute', left: '16px' }} onClick={() => router.back()}>
                <img src="/images/back-btn.png" alt="Back" style={{ width: '20px' }} />
              </div>
              <h3 style={{ margin: '0 auto', fontSize: '18px', fontWeight: '700', color: '#111' }}>Referrals reward</h3>
            </header>

            <div style={{ flex: 1, backgroundColor: '#fff' }}>
              {/* Table Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #f1f1f1'
              }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Date</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Reward</span>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: '#f1c40f', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#fff'
                  }}>💸</div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
              )}

              {/* Days List */}
              {!loading && daysList.map((day, index) => {
                const reward = getRewardForDay(day);
                const isEven = index % 2 === 0;
                
                const formattedDate = day.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: isEven ? '#efefef' : '#ffffff'
                  }}>
                    <span style={{ fontSize: '14px', color: '#555' }}>{formattedDate}</span>
                    <span style={{ fontSize: '14px', color: '#06b58f' }}>{reward > 0 ? reward.toFixed(4) : '0'}</span>
                  </div>
                );
              })}

              {!loading && daysList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No data available.</div>
              )}
            </div>

            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
