"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Exchange() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [timeLeft, setTimeLeft] = useState(52);

  const [rate, setRate] = useState(107);
  const [withdrawMin, setWithdrawMin] = useState(50);
  const [usdtAmount, setUsdtAmount] = useState("");
  const [inrAmount, setInrAmount] = useState("");
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.rate) setRate(data.settings.rate);
            if (data.settings.withdrawMin) setWithdrawMin(data.settings.withdrawMin);
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
    if (token) {
      setIsLoggedIn(true);
      fetchBanks(token);
      fetchBalance(token);
    }
    setCheckingAuth(false);
  }, []);

  const fetchBanks = async (token) => {
    try {
      const res = await fetch("/api/bank-card", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBanks(data.banks || []);
        if (data.banks && data.banks.length > 0) {
          setSelectedBankId(data.banks[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch banks:", err);
    }
  };

  const fetchBalance = async (token) => {
    try {
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.usdtAvailable || 0);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const handleUsdtChange = (e) => {
    const val = e.target.value;
    setUsdtAmount(val);
    if (val && !isNaN(val)) {
      setInrAmount((parseFloat(val) * rate).toFixed(2));
    } else {
      setInrAmount("");
    }
  };

  const handleInrChange = (e) => {
    const val = e.target.value;
    setInrAmount(val);
    if (val && !isNaN(val)) {
      setUsdtAmount((parseFloat(val) / rate).toFixed(2));
    } else {
      setUsdtAmount("");
    }
  };

  const handleSell = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!usdtAmount || parseFloat(usdtAmount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (parseFloat(usdtAmount) < withdrawMin) {
      setMessage(`Minimum sell amount is ${withdrawMin} USDT.`);
      return;
    }
    if (parseFloat(usdtAmount) > balance) {
      setMessage(`Insufficient balance. Available: ${balance} USDT. Please add funds.`);
      return;
    }
    if (!selectedBankId) {
      setMessage("Please select a bank account.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const selectedBank = banks.find(b => b.id === selectedBankId);

      const res = await fetch("/api/admin/selling-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank: selectedBank,
          amount: parseFloat(usdtAmount)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Selling request submitted successfully!");
        setUsdtAmount("");
        setInrAmount("");
        fetchBalance(token); // Refresh balance
      } else {
        setMessage(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error submitting request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      // window.location.reload(); // Avoid reload loop if logic is flawed
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (checkingAuth) return null;

  return (
    <div>
      <main>
        <div className="page-wrappers" style={{ background: '#f6f7fa' }}>
          <header className="header" style={{ padding: '9px 11px 5px 11px' }}>
            <div className="left">
              <div className="logo-icon">
                <Image
                  src="/image/applink-icon.png"
                  alt="logo"
                  width={50}
                  height={44}
                  priority
                />
              </div>
              <div className="logo-text"><p>duoexchange </p></div>
            </div>
            <div className="right">
              {/* <Link href="#">
                <Image                
                src="/image/bell.png"
                alt="notification"
                width={24}
                height={24}
                priority
                /></Link> */}
              <Link href="https://t.me/duoexchange" style={{ marginLeft: "10px" }}>
                <Image
                  src="/image/customer-care-icon.png"
                  alt="earphone"
                  width={24}
                  height={24}
                  priority
                /></Link>
            </div>
          </header>



          <div className="page-wrapper page-wrapper-ex" style={{ padding: 0 }}>
            <div className="mainHeadExchange">
              <p className="">Platform Rate</p>
              <h3>1 USDT = INR {rate}</h3>
              <div className="logoImg"><img src="/image/grn_logo1.png" /></div>
            </div>

            <div style={{ padding: '10px 15px 14px 15px' }}>
              <section className="section-3">
                <p className="title" style={{ textAlign: "left", paddingTop: '5px' }}>
                  <b>Flash Exchange</b>
                </p>
                <p className="title ptitle">Crypto</p>
                <div className="select-amt" style={{ position: "relative", background: '#fff' }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdtAmount}
                    onChange={handleUsdtChange}
                    style={{
                      width: "100%",
                      paddingRight: "50px",
                      border: "none",
                      outline: "none",
                      fontSize: "12px",
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
                      zIndex: 9
                    }}
                  >
                    <img src="/image/uic.png" className="icon" /> USDT
                  </div>
                </div>
                <div className="dflex avail">
                  <Link href="/USDT-deposit" style={{ fontSize: '12px', fontWeight: 500, marginTop: '5px', color: '#06b58f' }}>
                    Deposit
                  </Link>
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto', paddingTop: '5px', paddingLeft: '5px' }}>
                    Available: {balance.toFixed(2)} USDT
                  </span>
                </div>

                <div className="middleSection">
                  <div className=""></div>
                  <img src="/image/or.png" />
                  <div className=""></div>
                </div>

                <p className="title ptitle" style={{ textAlign: "left", paddingTop: '0px' }}>
                  Fiat
                </p>
                <div className="select-amt" style={{ position: "relative", background: '#fff' }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={inrAmount}
                    onChange={handleInrChange}
                    style={{
                      width: "100%",
                      paddingRight: "50px",
                      border: "none",
                      outline: "none",
                      fontSize: "12px",
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
                      zIndex: 9
                    }}
                  >
                    <img src="/image/inr1.png" className="icon" /> INR
                  </div>
                </div>

                <p className="title ptitle" style={{ textAlign: "left", paddingTop: '10px' }}>
                  Transfer to
                </p>
                <div className="select-amt" style={{ position: "relative", background: '#fff', margin: '0px 0 20px' }}>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="form-control"
                    style={{
                      width: "100%",
                      paddingRight: "50px",
                      border: "none",
                      outline: "none",
                      fontSize: "12px",
                      color: "#111",
                      background: "transparent",
                      zIndex: 2,
                      position: "relative",
                      padding: '10px 0'
                    }}
                  >
                    {banks.length > 0 ? (
                      banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankName} - {bank.accountNo}
                        </option>
                      ))
                    ) : (
                      <option value="">Please add bank account first</option>
                    )}
                  </select>

                </div>

                {message && (
                  <p style={{
                    color: message.includes('✅') ? 'green' : 'red',
                    fontSize: '12px',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    {message}
                  </p>
                )}

                <div className="login-bx" style={{ marginBottom: "5px" }}>
                  <button
                    className="login-btn"
                    onClick={handleSell}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#ccc' : '#10a992',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Processing...' : 'SELL USDT'}
                  </button>
                </div>
              </section>

              <section className="section-4">
                <p className="title" style={{ textAlign: "left" }}>
                  <b>Exchanges Price</b>
                </p>
                <div className="dflex-out">
                  <div className="bx">
                    <div className="dflex">
                      <img src="images/wazirx.png" />{" "}
                      <Link href="https://wazirx.com/" target="_blank">
                        <img src="images/grn-right-arw.png" />
                      </Link>
                    </div>
                    <div className="text">
                      Avg <span className="b">90.69</span>{" "}
                      <span className="rs">RS</span>
                    </div>
                    <div className="small">1USDT = ₹90.69</div>
                    <div className="rw">
                      Min <span className="black">90.69RS</span>
                    </div>
                    <div className="rw">
                      Max <span className="black">90.76RS</span>
                    </div>
                  </div>
                  <div className="bx">
                    <div className="dflex">
                      <img src="images/binance.png" />{" "}
                      <Link href="https://p2p.binance.com/en/trade/BUY/USDT?fiat=INR&payment=ALL" target="_blank">
                        <img src="images/grn-right-arw.png" />
                      </Link>
                    </div>
                    <div className="text">
                      Avg <span className="b">94.34</span>{" "}
                      <span className="rs">RS</span>
                    </div>
                    <div className="small">1USDT = ₹95.82</div>
                    <div className="rw">
                      Min <span className="black">94.99RS</span>
                    </div>
                    <div className="rw">
                      Max <span className="black">96.2RS</span>
                    </div>
                  </div>
                </div>
                <p className="title btm" style={{}}>
                  Statistics based on the latest 10 pieces of data
                </p>
              </section>
              <section className="section-2">
                <p className="title" style={{ textAlign: "left" }}>
                  <b>Platform Advantage</b>
                </p>
                <div className="rw">
                  <div className="bx">
                    <div className="image">
                      <img src="images/mic.png" style={{}} />{" "}
                      <h3>
                        <span className="fontt">24/7</span> Support
                      </h3>
                    </div>
                    <div className="info">
                      <p>
                        Got a problem? Just get in touch. Our customer service
                        support team is available 24/7.
                      </p>
                    </div>
                  </div>
                  <div className="bx">
                    <div className="image">
                      <img src="images/card.png" style={{}} />{" "}
                      <h3>Transaction Free</h3>
                    </div>
                    <div className="info">
                      <p>
                        Use a variety of payment methods to trade cryptocurrency,
                        free, safe and fast.
                      </p>
                    </div>
                  </div>
                  <div className="bx">
                    <div className="image">
                      <img src="images/money.png" style={{}} />{" "}
                      <h3>Rich Information</h3>
                    </div>
                    <div className="info">
                      <p>
                        Gather a wealth of information, let you know the industry
                        dynamics in first time.
                      </p>
                    </div>
                  </div>
                  <div className="bx">
                    <div className="image">
                      <img src="images/pro.png" style={{}} />{" "}
                      <h3>Reliable Security</h3>
                    </div>
                    <div className="info">
                      <p>
                        Our sophisticated security measures protect your
                        cryptocurrency from all risks.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

