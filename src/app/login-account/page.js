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
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);

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

  const handleSendOtp = async () => {
    if (!email) return setError('Please enter your email');
    if (!validateEmail(email.trim())) return setError('Please enter a valid email');

    setError('');
    setMessage('');
    setLoadingOtp(true);

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

        otpInputRef.current?.focus();

        const expiry = Date.now() + 30 * 1000;
        localStorage.setItem('otpCooldownExpiry', expiry);
        setCooldown(30);
      } else {
        // Don't force-redirect on 401 when sending OTP; show readable message instead
        const err = data.error || 'Failed to send OTP';
        showToast(err, 'error');
        setError(err);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
      showToast('Something went wrong', 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setError('');
    setMessage('');
    setLoadingVerify(true);

    try {
      const savedRefCode = localStorage.getItem('referralCode') || null;
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp, referralCode: savedRefCode }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // Clear referral code after successful login
        localStorage.removeItem('referralCode');

        setMessage('OTP verified! Logging In...');
        setTimeout(() => {
          // Use router.replace to navigate within the app (safer than full reload)
          router.replace(data.redirectTo || '/home');
        }, 500);
      } else {
        // Don't redirect on 401: show the error so the user can re-try OTP
        const err = data.error || 'Invalid OTP';
        showToast(err, 'error');
        setError(err);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div>
      <main>
        <div className="page-wrappers full-height">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <div className="back-btn">
              <Link href="/login">
                <img src="images/back-btn.png" />
              </Link>
            </div>
            <section className="section-1">
              <h3 className="title">
                <b>Welcome to duoexchange </b>
              </h3>
              <h4 style={{ fontWeight: 'normal', fontSize: '16px', paddingBottom: '10px', color: '#696969' }}>
                Exchange more, earn more, make your life better.
              </h4>


              <div className="form-bx">
                <div className="form-rw">
                  <label className="text">Email Address</label>
                  <input
                    type="text"
                    id="emailadd"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-rw">
                  <label className="text">OTP</label>
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
                      onClick={handleSendOtp}
                      disabled={loadingOtp || cooldown > 0}
                    >
                      {loadingOtp
                        ? 'Sending...'
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : otpSent
                            ? 'Resend OTP'
                            : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                {message && <p style={{ color: 'green', marginBottom: '10px' }}>{message}</p>}

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleVerifyOtp}
                  disabled={loadingVerify}
                >
                  {loadingVerify ? 'Verifying...' : 'Sign Up / Login'}
                </button>
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
