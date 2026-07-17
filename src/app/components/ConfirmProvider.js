"use client";
import React, { createContext, useContext, useState } from "react";

const ConfirmContext = createContext(null);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export default function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = (message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  };

  const handleOkay = () => {
    if (confirmState) confirmState.resolve(true);
    setConfirmState(null);
  };
  const handleCancel = () => {
    if (confirmState) confirmState.resolve(false);
    setConfirmState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", zIndex: 9998 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, width: 420, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <p style={{ marginBottom: 20, fontWeight: 600, fontSize: 16, color: "#1a1d23" }}>{confirmState.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={handleCancel} style={{ padding: "10px 16px", borderRadius: 6, background: '#f3f4f6', border: 'none', color: '#1a1d23', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleOkay} style={{ padding: "10px 16px", borderRadius: 6, background: '#000000', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
