"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBank() {
  const router = useRouter();

  const [initialBank] = useState(() => {
    if (typeof window !== "undefined") {
      const storedBank = localStorage.getItem("selectedBank");
      return storedBank ? JSON.parse(storedBank) : null;
    }
    return null;
  });

  const [banks, setBanks] = useState(initialBank ? [initialBank] : []);
  const [selectedBankId, setSelectedBankId] = useState(initialBank?.id || null);
  const [loading, setLoading] = useState(!initialBank);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(102);
  const [withdrawMin, setWithdrawMin] = useState(50);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) {
        setRate(data.settings.rate ?? 102);
        setWithdrawMin(data.settings.withdrawMin ?? 50);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  // ✅ Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!initialBank) fetchBanks();
    fetchBalance();
  }, []);

  const fetchBanks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bank-card", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      setBanks(data.banks || []);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setBalance(data.usdtAvailable || 0);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const handleConfirm = async () => {
    const amt = parseFloat(amount);

    if (!amount || isNaN(amt)) {
      setMessage("Please enter an amount.");
      setSuccessMessage(""); // clear success
      return;
    }
    if (withdrawMin > amt) {
      setMessage(`❌ Minimum ${withdrawMin} USDT.`);
      setSuccessMessage("");
      return;
    }
    if (amt > balance) {
      setMessage(`❌ Insufficient balance. You have ${balance} USDT. Please add funds.`);
      setSuccessMessage("");
      return;
    }
    if (!selectedBank) {
      setMessage("Please select a bank account.");
      setSuccessMessage("");
      return;
    }

    setMessage("");
    setSuccessMessage(""); // clear previous success

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/selling-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bank: selectedBank, amount: amt }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("✅ Selling request sent for the confirmation!. please wait....");
        setAmount(""); // reset input
        setMessage("");
        setTimeout(() => setSuccessMessage(""), 5000); // hide after 5s
      } else {
        setMessage(data.error || "Failed to send selling request");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error sending selling request");
    }
  };

  if (loading) {
    return (
      <div className="page-wrappers">
        <div className="loader" style={{ textAlign: "center", marginTop: "40px" }}>
          <Image src="/images/loading.webp" alt="loader" width={50} height={50} priority unoptimized />
        </div>
      </div>
    );
  }

  const selectedBankCardStyle = {
    borderTop: "1px solid #ccc",
    borderBottom: "1px solid #ccc",
  };

  return (
    <div>
      <main>
        <div className="page-wrappers no-empty-page deposit-amount-page add-bank-page">
          {/* HEADER */}
          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/exchange">
                  <img src="images/back-btn.png" />
                </Link>
              </div>
              <h3>Exchange</h3>
            </div>
            <div className="right">
              <img src="images/undo.png" />
            </div>
          </header>

          {/* CONTENT */}
          <div className="page-wrapper page-wrapper-ex">
             <div className="bnr"><img src="images/top-bnr.png" style={{width: "100%", float: "left"}}/></div>
            {/* BANK SELECTION */}
            <section className="section-1 text-center">
              <div className="dflex border-btm">
                <p className="title">
                  <b>Select payee</b>
                </p>
                <div className="image">
                  <Link href="/bank">
                    <img src="images/add-u-icon.png" className="icon" />
                  </Link>
                </div>
              </div>

              {selectedBank ? (
                <div style={selectedBankCardStyle}>
                  <div
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "10px 0",
                      fontSize: "12px",
                      color: "gray",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Account No.</span>
                    <span>{selectedBank.accountNo}</span>
                  </div>

                  <div
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "10px 0",
                      fontSize: "12px",
                      color: "gray",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>IFSC</span>
                    <span style={{ color: "black" }}>{selectedBank.ifsc}</span>
                  </div>

                  <div
                    style={{
                      padding: "10px 0",
                      fontSize: "12px",
                      color: "gray",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Payee Name</span>
                    <span style={{ color: "black" }}>{selectedBank.payeeName}</span>
                  </div>
                </div>
              ) : (
                <div className="add-bank">
                  <Link href="/bind-bank-card" className="button-style">
                    <img src="images/addicon.png" className="icon" /> Add bank account
                  </Link>
                </div>
              )}
            </section>

            {/* SELL AMOUNT */}
            <section className="section-2 inner-space">
              <div className="inside">
                <div className="btm">
                  <p className="title">Sell USDT</p>
                  <div className="select-amt" style={{ position: "relative", border:'1px solid #ddd', padding:'6px' }}>
                    <input
                      type="number"
                      placeholder="Please enter the amount"
                      name="amt"
                      id="rrd"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                        font-size: 12px;
                      }
                    `}</style>
                  </div>
                </div>

                {/* ❌ Error message */}
                {message && <p className="error" style={{ padding:"10px", fontSize: "12px", color: "red", fontWeight: "500" }}>{message}</p>}

                {/* ✅ Success message */}
                {successMessage && <p className="success" style={{ padding:"10px", fontSize: "12px", color: "green", fontWeight: "500" }}>{successMessage}</p>}

                {/* EXTRA INFO */}
                <div className="dflex avail">
                  <p className="title clrgren" style={{ fontSize: "10px", fontWeight: "600" }}>
                    Available($) {balance}{" "}
                    <img src="images/uic.png" className="icon" style={{ maxWidth: 13 }} />
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: "600" }}>1USDT=₹{rate}</p>
                </div>

                {/* ✅ Conversion Message */}
                {amount && (
                  <p style={{ fontSize: "12px", color: "black", fontWeight: "bold" }}>
                    You will receive Rs. {(parseFloat(amount) * rate).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </section>

            <section className="table-section">
                <div className="pricerefBx">
  <table width="100%">
    <thead>
      <tr>
        <th>Exchanges($)</th>
        <th>Prices(₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>&gt;=980.4 and &lt;1960.79</td>
        <td>
          102+ <span className="red">0.25</span>
        </td>
      </tr>
      <tr>
        <td>&gt;=1960.79 and &lt;2941.18</td>
        <td>
          102+ <span className="red">0.5</span>
        </td>
      </tr>
      <tr>
        <td>&gt;=2941.18 and &lt;4901.97</td>
        <td>
          102+ <span className="red">1</span>
        </td>
      </tr>
      <tr>
        <td>&gt;=4901.97</td>
        <td>
          102+ <span className="red">1.5</span>
        </td>
      </tr>
      <tr>
        <td colSpan={2}>
          <a href="#">What is tiered price policy?</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</section>

            {/* FOOTER */}
            <div className="warning inner-space">
              <div className="login-bx" style={{ backgroundColor: "black", borderRadius: "100px" }}>
               <button style={{ marginBottom: '0' }} className="login-btn" onClick={handleConfirm}>
  Confirm
</button>

              </div>
              <div className="inside">
                In order to get your funds back better, faster and more conveniently,
                your exchange order may be split into multiple parts
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
































