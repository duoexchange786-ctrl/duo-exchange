'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';

function LoginAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'mpin', 'otp'
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const mpinRefs = useRef([]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Auth guard: redirect already logged-in users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.replace('/home');
  }, [router]);

  // Auto-hide messages
  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError('');
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  // Capture referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  // Load saved email + OTP cooldown
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) setEmail(savedEmail);

    const expiry = localStorage.getItem('otpCooldownExpiry');
    if (expiry) {
      const remaining = Math.floor((+expiry - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
        setOtpSent(true);
      }
    }
  }, []);

  // Save email in localStorage
  useEffect(() => {
    if (email) localStorage.setItem('email', email);
  }, [email]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('otpCooldownExpiry');
    }
  }, [cooldown]);

  const handleCheckEmail = async () => {
    if (!email) return setError('Please enter your email');
    if (!validateEmail(email.trim())) return setError('Please enter a valid email');

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.exists && data.hasMpin) {
          setStep('mpin');
          setTimeout(() => mpinRefs.current[0]?.focus(), 100);
        } else {
          setStep('otp');
          handleSendOtp(true); // auto send OTP
        }
      } else {
        setError(data.error || 'Failed to verify email');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (isAuto = false) => {
    if (!email) return setError('Please enter your email');
    if (!validateEmail(email.trim())) return setError('Please enter a valid email');

    setError('');
    setMessage('');
    if (!isAuto) setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setMessage('✅ OTP sent! Check your email.');

        setTimeout(() => otpInputRef.current?.focus(), 100);

        const expiry = Date.now() + 30 * 1000;
        localStorage.setItem('otpCooldownExpiry', expiry);
        setCooldown(30);
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
      if (!isAuto) setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email) return setError('Please enter your email');
    if (!otp) return setError('Please enter the OTP');

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const savedRefCode = localStorage.getItem('referralCode') || null;
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp, referralCode: savedRefCode }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.removeItem('referralCode');

        setMessage('OTP verified! Logging In...');
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

  const handleVerifyMpin = async () => {
    const mpinString = mpin.join('');
    if (mpinString.length !== 4) return setError('Please enter 4-digit MPIN');

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-mpin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mpin: mpinString }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        setMessage('Login successful!');
        setTimeout(() => {
          router.replace(data.redirectTo || '/home');
        }, 500);
      } else {
        const err = data.error || 'Invalid MPIN';
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
    if (e.key === 'Enter') {
      handleVerifyMpin();
    }
  };

  const resetToOtp = () => {
    setStep('otp');
    handleSendOtp();
  };

  return (
    <div>
      <main>
        <div className="page-wrappers full-height">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <div className="back-btn">
              {step !== 'email' ? (
                <a onClick={() => setStep('email')} style={{ cursor: 'pointer' }}>
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
                <b>Welcome to duoexchange </b>
              </h3>
              <h4 style={{ fontWeight: 'normal', fontSize: '16px', paddingBottom: '10px', color: '#696969' }}>
                Exchange more, earn more, make your life better.
              </h4>

              <div className="form-bx">
                {step === 'email' && (
                  <>
                    <div className="form-rw">
                      <label className="text">Email Address</label>
                      <input
                        type="text"
                        id="emailadd"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheckEmail(); }}
                      />
                    </div>
                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleCheckEmail}
                      disabled={loading}
                    >
                      {loading ? 'Checking...' : 'Continue'}
                    </button>
                  </>
                )}

                {step === 'otp' && (
                  <>
                    <div className="form-rw">
                      <label className="text">OTP sent to {email}</label>
                      <div className="pos">
                        <input
                          type="text"
                          id="otp"
                          placeholder="Enter Your OTP"
                          value={otp}
                          ref={otpInputRef}
                          onChange={(e) => setOtp(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOtp(); }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendOtp(false)}
                          disabled={loading || cooldown > 0}
                        >
                          {loading && !otpSent
                            ? 'Sending...'
                            : cooldown > 0
                              ? `Resend in ${cooldown}s`
                              : otpSent
                                ? 'Resend OTP'
                                : 'Send OTP'}
                        </button>
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
                      onClick={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Sign Up / Login'}
                    </button>
                  </>
                )}

                {step === 'mpin' && (
                  <>
                    <div style={{ marginBottom: '30px' }}>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
                        Enter 4-Digit MPIN for <b>{email}</b>
                      </p>
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '15px' }}>
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
                              width: '60px',
                              height: '60px',
                              fontSize: '32px',
                              textAlign: 'center',
                              borderRadius: '12px',
                              border: '2px solid #e0e0e0',
                              backgroundColor: '#fafafa',
                              color: '#333',
                              outline: 'none',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <a onClick={resetToOtp} style={{ color: '#10b981', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textDecoration: 'underline' }}>
                          Forgot MPIN? Reset via OTP
                        </a>
                      </div>
                    </div>
                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    {message && <p style={{ color: 'green', marginBottom: '10px' }}>{message}</p>}

                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleVerifyMpin}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Login'}
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

export default function LoginAccount() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <LoginAccountContent />
    </Suspense>
  );
}
