"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DepositAmount() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const network = searchParams.get("network");
  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const skipReminder = localStorage.getItem("skipFeeReminder");
    if (!skipReminder) {
      setShowModal(true);
    }
  }, []);

  const [qrCodes, setQrCodes] = useState({ TRC20: "", ERC20: "" });
  const [depositAddresses, setDepositAddresses] = useState({ TRC20: "", ERC20: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setQrCodes({
              TRC20: data.settings.trc20QrUrl || "images/trc20.png",
              ERC20: data.settings.erc20QrUrl || "images/erc20.png",
            });
            setDepositAddresses({
              TRC20: data.settings.trc20Address || "",
              ERC20: data.settings.erc20Address || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching crypto settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const duration = 60 * 60 * 1000; // 1 hour in ms
    let expiryTime = localStorage.getItem("depositExpiryTime");

    if (!expiryTime) {
      expiryTime = Date.now() + duration;
      localStorage.setItem("depositExpiryTime", expiryTime.toString());
    } else {
      expiryTime = parseInt(expiryTime, 10);
    }

    const updateTimer = () => {
      const remaining = Math.floor((expiryTime - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        localStorage.removeItem("depositExpiryTime");
      }
    };

    updateTimer(); // run immediately
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format timer
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return { h, m, s };
  };

  const { h, m, s } = formatTime(timeLeft);

  // Persistent Txid input
  const [txid, setTxid] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("txid");
    if (saved) setTxid(saved);
  }, []);

  const handleTxidChange = (e) => {
    setTxid(e.target.value);
    localStorage.setItem("txid", e.target.value);
  };

  // Generate deposit ID and create time
  const [depositId, setDepositId] = useState("");
  const [createTime, setCreateTime] = useState("");

  useEffect(() => {
    const id =
      "DEP-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8);
    setDepositId(id);

    const now = new Date();
    setCreateTime(now.toLocaleString());
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    const payload = {
      amount: parseFloat(amount),
      network,
      depositId,
      createTime,
      txid,
      address: depositAddresses[network],
    };

    try {
      const res = await fetch("/api/admin/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Deposit submitted ✅" });

        // reset
        localStorage.removeItem("txid");
        setTxid("");

        // redirect after 2 sec
        setTimeout(() => {
          window.location.href = "/exchange";
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong ❌",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong ❌",
      });
    }
  };


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setMessage({ type: "success", text: "Copied to clipboard ✅" });
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to copy ❌" });
      });
  };


  return (
    <div>
      <main>
        <div className="page-wrappers no-empty-page deposit-amount-page">
          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/exchange">
                  <img src="images/back-btn.png" />
                </Link>
              </div>
              <h3>Deposit USDT</h3>
            </div>
            <div className="right d-flex">
              <img src="images/gray-warn.png" />
              <img src="images/undo.png" />
            </div>
          </header>

          <div className="page-wrapper">
            <section className="section-1 text-center">
              <p className="title">
                <b>Scan the QR code and pay</b>
              </p>

              {/* Dynamic QR */}
              <div className="image">
                <img src={qrCodes[network]} className="icon" style={{ height: '100px' }}/>
              </div>

              {/* Timer */}
              <div className="rem-time">
                <span className="num">{h[0]}</span>
                <span className="num">{h[1]}</span>{" "}
                <span className="sep">:</span>
                <span className="num">{m[0]}</span>
                <span className="num">{m[1]}</span>{" "}
                <span className="sep">:</span>
                <span className="num">{s[0]}</span>
                <span className="num">{s[1]}</span> remaining
              </div>

              <p>
                <b>
                  If have transaction fee, don't forget to add it. The transfer
                  amount must match the deposit amount.
                </b>
              </p>

              {/* Txid input */}
              <div className="select-amt">
                <input
                  type="text"
                  value={txid}
                  onChange={handleTxidChange}
                  placeholder="Please enter Txid"
                  name="txid"
                  style={{
                    width: "100%",
                    paddingRight: "50px",
                    border: "none",
                    outline: "none",
                    fontSize: "12px",
                    color: "#111",
                    background: "transparent",
                  }}
                />
                <div className="submit">
                  <button
                    className="button-style"
                    onClick={handleSubmit}
                    disabled={timeLeft <= 0} // disable if expired
                  >
                    Submit
                  </button>
                </div>
              </div>

              <p style={{ textAlign: "left", paddingTop: 20, opacity: ".4" }}>
                <b>
                  Your deposit USDT will be immediately to your wallet once
                  enter Txid
                </b>
              </p>
            </section>

              {message && (
                <div
                  style={{
                    backgroundColor:
                      message.type === "success" ? "#4caf50" : "#f44336",
                    color: "white",
                    padding: "10px",
                    marginBottom: "12px",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  {message.text}
                </div>
              )}

            <section className="section-2 inner-space">
              <div className="inside">
                <div className="rw">
                  <p className="title">Deposit Amount</p>
                  <div className="amt">
                    <img src="images/uic.png" className="icon" />{" "}
                    <h3>{amount}</h3>
                  </div>
                </div>

                <div className="rw">
                  <p className="title">Deposit Address</p>
                  <div className="address">
                    {depositAddresses[network]}
                    <span
                      className="copy"
                      onClick={() => handleCopy(depositAddresses[network])}
                      style={{ cursor: "pointer" }}
                    >
                      <img src="images/copy.png" className="icon" />
                    </span>
                  </div>
                </div>

              <div className="warning" style={{ margin: "7px 0" }}>
                <div className="inside">
                  <img src="images/warn.png" className="icon" />A Only support{" "}
                  <span className="red">{network}-USDT</span>, Any losses
                  caused by your improper operation will be borne by yourself.
                  Please operate with caution and double-check the recharge
                  address carefully
                </div>
              </div>

              <div className="rw">
                <p className="title">Deposit ID</p>
                <div className="address">
                  {depositId}
                  <span
                    className="copy"
                    onClick={() => handleCopy(depositId)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src="images/copy.png" className="icon" />
                  </span>
                </div>
              </div>

              <div className="rw">
                <p className="title">Network</p>
                <div className="amt no-weight">
                  <img
                    src={
                      network === "TRC20"
                        ? "images/tb-ic1.png"
                        : "images/tb-ic2.png"
                    }
                    className="icon"
                  />
                  USDT-{network}
                </div>
              </div>

              <div className="rw">
                <p className="title">Create Time</p>
                <div className="amt no-weight">{createTime}</div>
              </div>

              <div className="rw">
                <p className="title">Remark</p>
              </div>

              <div className="rw nobrd anc">
                <p className="title">
                  <a href="#">
                    <b>.</b> {network}-USDT only
                  </a>
                </p>
              </div>
          </div>
        </section>
    </div>
        </div >
      </main >
    {/* { showModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "360px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontFamily: "sans-serif",
          }}
        >
          <p
            style={{ fontSize: "14px", color: "#111", marginBottom: "16px" }}
          >
            Due to transaction fees charged by the exchange when transferring
            funds, please try to ensure that the deposited amount and the
            amount received are as close as possible.
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#111",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            For example, if the transaction fee for the exchange transfer is 1
            USDT and the deposited amount is 100.23 USDT, the transfer amount
            to the exchange should be 101.23 USDT.
          </p>

          <button
            onClick={() => setShowModal(false)}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            Ok
          </button>

          <div style={{ fontSize: "13px", color: "#111" }}>
            <label style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    localStorage.setItem("skipFeeReminder", "true");
                  } else {
                    localStorage.removeItem("skipFeeReminder");
                  }
                }}
                style={{ marginRight: "6px" }}
              />
              I already know, next time don't remind.
            </label>
          </div>
        </div>
      </div>
    )
} */}
    </div >
  );
}

