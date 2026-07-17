'use client'
import React, { useState, useEffect } from 'react';

//import Image from "next/image";
import Link from 'next/link';
import Footer from '../components/footer';


export default function DemoPage() {
  const [rates, setRates] = useState({ level1: 0.1, level2: 0.03, level3: 0.02, level4: 0.01, level5: 0.01 });
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch commission rates (public endpoint)
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/settings/referral');
        if (res.ok) {
          const data = await res.json();
          if (data.rates) setRates(data.rates);
        }
      } catch (err) {
        console.error('Failed to fetch referral rates:', err);
      }
    };
    fetchRates();

    // Fetch user's referral data if logged in
    const token = localStorage.getItem('token');
    if (token) {
      const fetchReferralData = async () => {
        try {
          const res = await fetch('/api/referral/my-code', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setReferralData(data);
          }
        } catch (err) {
          console.error('Failed to fetch referral data:', err);
        }
      };
      fetchReferralData();
    }
  }, []);

  const handleInvite = async () => {
    if (!referralData?.referralLink) return;
    setIsModalOpen(true);
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for non-HTTPS environments (e.g., local dev)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      textArea.remove();
    }
  };
  
  return (
    <div>
      <main>
        <div className="page-wrappers empty-page" style={{ minHeight: "100vh", paddingBottom: "100px" }}>

  <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
    <div className="brdc">
      <div className="back-btn">
        <Link href="/home">
          <img src="images/back-btn.png" />
        </Link>
      </div>
      <h3>Invites
      </h3>
    </div>

    <section className="section-1s banner-imgn">
      <div className='informate'>
        <div className="full"><div className="info">
          <h3>Invite friends and make money together</h3>
          <p>Each accepted order of your subordinates will get you corresponding rewards</p></div></div>
      </div>
      <div className="image">
        <img src="images/inv-img.jpg" style={{"width":"100%"}} />
      </div>
    </section>

    {referralData && (
      <div className="pricerefBx" style={{marginBottom: "10px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
          <div>
            <p style={{fontSize: "12px", color: "#888", margin: 0}}>Your Referral Code</p>
            <p style={{fontSize: "18px", fontWeight: "bold", margin: "4px 0", letterSpacing: "2px"}}>{referralData.referralCode}</p>
          </div>
          <div style={{textAlign: "right"}}>
            <p style={{fontSize: "12px", color: "#888", margin: 0}}>Total Referrals</p>
            <p style={{fontSize: "18px", fontWeight: "bold", margin: "4px 0"}}>{referralData.directReferrals}</p>
          </div>
        </div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <p style={{fontSize: "12px", color: "#888", margin: 0}}>Total Earnings</p>
            <p style={{fontSize: "16px", fontWeight: "bold", margin: "4px 0", color: "#10a992"}}>{referralData.totalEarnings.toFixed(4)} USDT</p>
          </div>
        </div>
      </div>
    )}

    <div className="pricerefBx pricerefBx-01">
      <h4><b>Rules</b></h4>
      <table width="100%">
          <thead>
            <tr>
                <th>Subordinate</th>
                <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>1 Level</td>
                <td>{rates.level1}%</td>
            </tr>
            <tr>
                <td>2 Level</td>
                <td>{rates.level2}%</td>
            </tr>
            <tr>
                <td>3 Level</td>
                <td>{rates.level3}%</td>
            </tr>
            <tr>
                <td>4 Level</td>
                <td>{rates.level4}%</td>
            </tr>
            <tr>
                <td>5 Level</td>
                <td>{rates.level5}%</td>
            </tr>
          </tbody>
      </table>
    </div>

    <div className="login-bx" style={{ margin: "20px 16px" }}>
      <button className="login-btn" onClick={handleInvite} style={{border: "none", cursor: "pointer", width: "100%"}}>
        Invite Friends
      </button>
    </div>

    {/* Bottom Modal for Invite Link */}
    {isModalOpen && (
      <>
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#fff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '24px',
          zIndex: 1000,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Share Invite Link</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer' }}>&times;</button>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid #e0e0e0',
            wordBreak: 'break-all',
            fontSize: '14px',
            color: '#333',
            marginBottom: '20px'
          }}>
            {referralData?.referralLink}
          </div>
          
          <button 
            onClick={() => copyToClipboard(referralData?.referralLink)}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: copied ? '#28a745' : '#10a992', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {copied ? '✅ Link Copied!' : 'Copy Link'}
          </button>
        </div>
        <style>{`
          @keyframes slideUp {
            from { transform: translate(-50%, 100%); }
            to { transform: translate(-50%, 0); }
          }
        `}</style>
      </>
    )}

  </div>
</div>

<Footer></Footer>

      </main>    
    </div>
  );
}

