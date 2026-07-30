'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const mpinRefs = useRef([]);
  const otpInputRef = useRef(null);
  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.replace('/home');
  }, [router]);

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError('');
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  const handleMpinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newMpin = [...mpin];
    newMpin[index] = value.slice(-1);
    setMpin(newMpin);

    if (value && index < 3) {
      mpinRefs.current[index + 1]?.focus();
    }
  };

  const handleMpinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      mpinRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!fullName) return setError('Please enter your full name');
    if (!mobile) return setError('Please enter your mobile number');
    if (!email) return setError('Please enter your email');
    if (!validateEmail(email.trim())) return setError('Please enter a valid email');
    
    const mpinString = mpin.join('');
    if (mpinString.length !== 4) return setError('Please enter 4-digit MPIN');

    setError('');
    setMessage('');
    setLoading(true);

    try {
      // First check if email already exists
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const checkData = await checkRes.json();
      
      if (checkData.exists) {
        setLoading(false);
        return setError('Email is already registered. Please login instead.');
      }

      // Send OTP
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ OTP sent! Check your email.');
        setStep('otp');
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } else {
        const err = data.error || 'Failed to send OTP';
        showToast(err, 'error');
        setError(err);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp) return setError('Please enter the OTP');

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const savedRefCode = localStorage.getItem('referralCode') || null;
      const mpinString = mpin.join('');

      const res = await fetch('/api/auth/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp,
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          mpin: mpinString,
          referralCode: savedRefCode 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.removeItem('referralCode');

        setMessage('Registration successful! Logging In...');
        setTimeout(() => {
          router.replace(data.redirectTo || '/home');
        }, 500);
      } else {
        const err = data.error || 'Invalid OTP';
        showToast(err, 'error');
        setError(err);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main>
        <div className="page-wrappers full-height">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <div className="back-btn">
              {step === 'otp' ? (
                <a onClick={() => setStep('details')} style={{ cursor: 'pointer' }}>
                  <img src="/images/back-btn.png" />
                </a>
              ) : (
                <Link href="/login">
                  <img src="/images/back-btn.png" />
                </Link>
              )}
            </div>
            <section className="section-1">
              <h3 className="title">
                <b>Register on duoexchange </b>
              </h3>
              <h4 style={{ fontWeight: 'normal', fontSize: '16px', paddingBottom: '10px', color: '#696969' }}>
                Create an account to start exchanging.
              </h4>

              <div className="form-bx">
                {step === 'details' && (
                  <>
                    <div className="form-rw">
                      <label className="text">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-rw">
                      <label className="text">Mobile Number</label>
                      <input
                        type="text"
                        placeholder="Enter your mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>

                    <div className="form-rw">
                      <label className="text">Email Address</label>
                      <input
                        type="text"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-rw" style={{ marginBottom: '20px' }}>
                      <label className="text">Set 4-Digit MPIN</label>
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                        {mpin.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (mpinRefs.current[index] = el)}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleMpinChange(index, e.target.value)}
                            onKeyDown={(e) => handleMpinKeyDown(index, e)}
                            style={{
                              width: '50px',
                              height: '50px',
                              fontSize: '24px',
                              textAlign: 'center',
                              borderRadius: '10px',
                              border: '1px solid #ccc',
                              outline: 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    
                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <Link href="/login-account" style={{ color: '#10b981', fontSize: '14px', textDecoration: 'underline' }}>
                        Already have an account? Login here
                      </Link>
                    </div>
                  </>
                )}

                {step === 'otp' && (
                  <>
                    <div className="form-rw">
                      <label className="text">OTP sent to {email}</label>
                      <div className="pos">
                        <input
                          type="text"
                          placeholder="Enter Your OTP"
                          value={otp}
                          ref={otpInputRef}
                          onChange={(e) => setOtp(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
                        />
                      </div>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '5px' }}></i>
                      If you don't see the OTP in your inbox, please <b>check your spam/junk folder</b>.
                    </div>

                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    {message && <p style={{ color: 'green', marginBottom: '10px' }}>{message}</p>}

                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Complete Registration'}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
