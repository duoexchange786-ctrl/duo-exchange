'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';

export default function SetMpinPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login-account');
    }
  }, [router]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newMpin = [...mpin];
    newMpin[index] = value.slice(-1);
    setMpin(newMpin);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const mpinString = mpin.join('');
    if (mpinString.length !== 4) {
      showToast('Please enter a 4-digit MPIN', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/set-mpin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mpin: mpinString }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('MPIN set successfully!', 'success');
        setTimeout(() => {
          router.replace(data.redirectTo || '/home');
        }, 500);
      } else {
        showToast(data.error || 'Failed to set MPIN', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main>
        <div className="page-wrappers full-height">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <section className="section-1">
              <h3 className="title">
                <b>Set Your MPIN</b>
              </h3>
              <h4 style={{ fontWeight: 'normal', fontSize: '16px', paddingBottom: '20px', color: '#696969' }}>
                Create a 4-digit MPIN for faster logins in the future.
              </h4>

              <div className="form-bx">
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                  {mpin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text" // using text but masking with css if needed, or password type
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                      }}
                      className="mpin-input" // can add custom css later if needed
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Set MPIN'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
