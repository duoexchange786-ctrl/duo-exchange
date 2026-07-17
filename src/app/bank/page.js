"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react"; 
import { useToast } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

export default function BankPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedBankId, setSelectedBankId] = useState(null);
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBank = localStorage.getItem("selectedBank");
      if (storedBank) {
        setSelectedBankId(JSON.parse(storedBank).id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/bank-card", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          setMessage(data.message || "Failed to fetch bank accounts.");
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

    fetchBanks();
  }, []);

  const handleSelectBank = async (bank) => {
    setSelectedBankId(bank.id);
    localStorage.setItem("selectedBank", JSON.stringify(bank));

    try {
      await fetch("/api/select-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "USER_ID_HERE", bankId: bank.id }),
      });
    } catch (error) {
      console.error("Error selecting bank:", error);
    }

    router.push("/exchange");
  };

  const handleDeleteBank = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in.", "error");
      return;
    }

    // confirm deletion with modal
    const confirmed = await confirm("Are you sure you want to delete this bank account?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/bank-card", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to delete bank account.", "error");
        return;
      }

      setBanks(banks.filter((bank) => bank.id !== id));

      if (selectedBankId === id) {
        localStorage.removeItem("selectedBank");
        setSelectedBankId(null);
      }

      showToast("Bank account deleted.", "success");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again later.", "error");
    }
  };

  // ✅ Inline style objects
  const styles = {
    bankList: {
      marginTop: "10px",
    },
    bankCard: {
      position: "relative",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "6px",
      padding: "10px",
      marginBottom: "10px",
      textAlign: "left",
      cursor: "pointer",
      transition: "border 0.2s, background 0.2s",
      fontSize: "12px",
      color: "#333",
    },
    bankCardSelected: {
      border: "1px solid #333",
      background: "#fff",
    },
    paragraph: {
      margin: "4px 0",
    },
    hr: {
      margin: "8px 0px",
      borderTop: ".1px solid gray-50",
    },
    deleteBtn: {
      position: "absolute",
      bottom: "0px",
      right: "10px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "gray",
    },
  };

  return (
    <div>
      <main>
        <div className="page-wrappers no-empty-page deposit-amount-page add-bank-page" style={{height: '100vh'}}>
          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/home">
                  <img src="/images/back-btn.png" alt="back" />
                </Link>
              </div>
              <h3>Bank Account</h3>
            </div>
            <div className="right">
              <img src="/images/undo.png" alt="undo" />
            </div>
          </header>


          <div className="page-wrapper page-wrapper-ex">
            <section className="section-1 text-center">
              <div className="add-bank">
                <Link href="/bind-bank-card" className="button-style">
                  <img src="/images/addicon.png" alt="Add Bank" className="icon" /> Add bank account
                </Link>
              </div>
              {loading ? (
                <p>Loading bank accounts...</p>
              ) : message ? (
                <p style={{ color: "red", marginTop: "10px" }}>{message}</p>
              ) : banks.length === 0 ? (
                <p style={{padding: "10px 0 0 0 "}}>No bank accounts added yet.</p>
              ) : (
                <div style={styles.bankList}>
                  {banks.map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      style={{
                        ...styles.bankCard,
                        ...(selectedBankId === bank.id ? styles.bankCardSelected : {}),
                      }}
                    >
                      <p style={styles.paragraph}>Account No: {bank.accountNo}</p>
                      <p style={styles.paragraph}>Bank Name: {bank.bankName}</p>
                      <p style={styles.paragraph}>IFSC: {bank.ifsc}</p>
                      <p style={styles.paragraph}>Payee Name: {bank.payeeName}</p>

                      <hr style={styles.hr} />

                      {/* Timestamp + Delete button */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "gray" }}>
                        <span>
                          {bank.createdAt
                            ? new Date(bank.createdAt).toLocaleString() // shows date + time
                            : ""}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBank(bank.id);
                          }}
                          style={{ ...styles.deleteBtn, position: "static" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

