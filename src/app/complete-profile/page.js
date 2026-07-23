'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CompleteProfile() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async () => {
    if (!fullName || !mobile) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, mobile }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/home');
      } else {
        setError(data.error || 'Failed to update profile');
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
        <div className="page-wrappers">
          <div className="page-wrapperss page-wrapper-login page-wrapper-ex page-wrapper-loginacc form-wrapper">
            <div className="back-btn">
              <Link href="/login">
                <img src="/images/back-btn.png" />
              </Link>
            </div>
            <section className="section-1">
              <h3 className="title">
                <b>Welcome to duoexchange </b>
              </h3>
              <h4 style={{ fontWeight: 'normal', fontSize: '20px', paddingBottom: '10px', color: '#696969' }}>
                Exchange more, earn more, make your life better.
              </h4>

              <div className="form-bx">
                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                <div className="form-rw">
                  <label className="text">Full Name</label>
                  <input
                    type="text"
                    id="ff"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-rw">
                  <label className="text">Mobile Number</label>
                  <div className="pos">
                    <input
                      type="text"
                      id="dd"
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleCompleteProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}





