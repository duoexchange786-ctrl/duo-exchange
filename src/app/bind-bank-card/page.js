'use client';

import Image from 'next/image';
import Link from 'next/link';
 import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddBankCard() {
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); 
  const [messageType, setMessageType] = useState(''); 
  const router = useRouter();
const handleSubmit = async () => {
  if (!accountNo || !bankName || !ifsc || !payeeName) {
    setMessageType('error');
    setMessage('Please fill all fields.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    setMessageType('error');
    setMessage('You must be logged in.');
    return;
  }

  setLoading(true);
  setMessage('');

  try {
    const response = await fetch('/api/bank-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ accountNo, bankName, ifsc, payeeName }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ Show success message first
      setMessageType('success');
      setMessage('Bank card added successfully! Redirecting...');
      setAccountNo('');
      setBankName('');
      setIfsc('');
      setPayeeName('');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/bank');
      }, 1500);
    } else {
      // ❌ Failed: reset form so user can try again
      setMessageType('error');
      setMessage(data.message || 'Failed to add bank card.');
      setAccountNo('');
      setBankName('');
      setIfsc('');
      setPayeeName('');
    }
  } catch (error) {
    console.error(error);
    setMessageType('error');
    setMessage('Something went wrong.');
    setAccountNo('');
    setBankName('');
    setIfsc('');
    setPayeeName('');
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <main>
        <div className="page-wrappers bind-bank-card full-height">
          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/bank">
                  <Image src="/images/back-btn.png" width={24} height={24} alt="Back" />
                </Link>
              </div>
              <h3>Bind bank card</h3>
            </div>
            <div className="right"></div>
          </header>

          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <section className="section-1">
              <div className="form-bx">
                <div className="form-rw">
                  <label className="text" htmlFor="account-no">AccNo.</label>
                  <input
                    type="text"
                    id="account-no"
                    placeholder="Please enter Account No."
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))} // only digits
                  />
                </div>

                <div className="form-rw">
                  <label className="text" htmlFor="bank-name">BankName.</label>
                  <input
                    type="text"
                    id="bank-name"
                    placeholder="Please enter Bank Name."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="form-rw">
                  <label className="text" htmlFor="ifsc">IFSC</label>
                  <div className="pos">
                    <input
                      type="text"
                      id="ifsc"
                      placeholder="Please enter IFSC"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())} // auto-uppercase
                      maxLength={11} // standard IFSC length
                    />
                  </div>
                </div>

                <div className="form-rw">
                  <label className="text" htmlFor="payee-name">AccName.</label>
                  <input
                    type="text"
                    id="payee-name"
                    placeholder="Please enter Payee Name."
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                  />
                </div>

                <button
                  className="login-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Commit'}
                </button>

                {message && (
                  <p style={{ color: messageType === 'success' ? 'green' : 'red', marginTop: '10px' }}>
                    {message}
                  </p>
                )}
              </div>

              <br />
              <p>
                Please check the information carefully before submission. If transfer
                issues occur due to incorrect information, it is the user's responsibility.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
