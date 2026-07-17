'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function USDTDeposit() {
  const [activeTab, setActiveTab] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState(''); 
  const [depositMin, setDepositMin] = useState(100);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.depositMin) {
            setDepositMin(data.settings.depositMin);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchWallet = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.usdtAvailable || 0);
        } else if (res.status === 401) {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
      }
    };

    fetchWallet();
  }, []);

  // Handle input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    if (value && parseFloat(value) < depositMin) {
      setError(`Minimum deposit amount is ${depositMin} USDT.`);
    } else {
      setError('');
    }
  };

  // Disable deposit if amount < depositMin
  const isDepositDisabled = !amount || parseFloat(amount) < depositMin;

  return (
    <div>
      <main>
        <div className="page-wrappers no-empty-page">

          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/exchange">
                  <img src="images/back-btn.png" />
                </Link>
              </div>
              <h3>Deposit USDT</h3>
            </div>
            <div className="right">
              <Link href="/deposit-history">
                <img src="images/undo.png" />
              </Link>
            </div>
          </header>

          <div className="page-wrapperss">
            <section className="section-1" style={{paddingTop: '37px'}}>
              <div className="bnr">
                <img src="images/top-bnr.png" style={{ width: "100%", float: "left" }} />
              </div>
              <div className="btmbnr">
                <img src="images/recharge-top-bg.png" style={{ width: "100%" }} />
              </div>
            </section>

            <section className="section-2 inner-space">
              <div className="inside">
                {/* NETWORK TABS */}
                <div className="top">
                  <p className="title">Network</p>
                  <div className="select-tbs">
                    <div
                      className={`tb ${activeTab === 'TRC20' ? 'active' : ''}`}
                      onClick={() => setActiveTab('TRC20')}
                    >
                      <input
                        type="radio"
                        name="tab"
                        checked={activeTab === 'TRC20'}
                        onChange={() => setActiveTab('TRC20')}
                      />
                      <img src="images/tb-ic1.png" className="icon" /> TRC20
                      <img src="image/y-tick.png" className="y-icon" />
                    </div>

                    <div
                      className={`tb ${activeTab === 'ERC20' ? 'active' : ''}`}
                      onClick={() => setActiveTab('ERC20')}
                    >
                      <input
                        type="radio"
                        name="tab"
                        checked={activeTab === 'ERC20'}
                        onChange={() => setActiveTab('ERC20')}
                      />
                      <img src="images/tb-ic2.png" className="icon" /> ERC20
                      <img src="image/y-tick.png" className="y-icon" />
                    </div>
                  </div>
                </div>

                {/* AMOUNT INPUT */}
                <div className="btm">
                  <p className="title">Amount</p>
                  <div className="select-amt" style={{ position: "relative" }}>
                    <input
                      type="number"
                      placeholder="Please enter the amount"
                      name="amt"
                      value={amount}
                      onChange={handleAmountChange} // <-- updated handler
                      style={{
                        width: "100%",
                        paddingRight: "50px",
                        border: "none",
                        outline: "none",
                        fontSize: "15px",
                        color: "#111",
                        background: "transparent",
                        zIndex: 2,
                        position: "relative",

                      }}
                    />
                    <div
                      className="amt"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        zIndex:9
                      }}
                    >
                      <img src="images/uic.png" className="icon" /> USDT
                    </div>

                   

                    <style jsx>{`
                      input::-webkit-outer-spin-button,
                      input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                      input[type="number"] {
                        -moz-appearance: textfield;
                      }
                      ::placeholder {
                        color: gray;
                        font-size: 15px;
                      }
                    `}</style>
                  </div>
                </div>
                 {error && (
                      <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                        {error}
                      </p>
                    )}

                {/* DEPOSIT BUTTON */}
                <p className="title" style={{paddingTop: '5px'}}>Available($) {walletBalance}</p>
                <Link
                  href={isDepositDisabled ? '#' : {
                    pathname: "/deposit-amount",
                    query: { amount, network: activeTab },
                  }}
                  className="button-style"
                  onClick={(e) => isDepositDisabled && e.preventDefault()} // prevent if invalid
                >
                  Deposit
                </Link>
              </div>
            </section>

            <div className="warning inner-space">
              <div className="inside">
                <img src="images/warn.png" className="icon" />
                For the safety of your funds, please note that the recharge address for each order is different. 
                Please double-check carefully to avoid the risk of irretrievable funds.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}













