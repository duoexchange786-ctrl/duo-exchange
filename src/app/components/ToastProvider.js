"use client";
import React, { createContext, useContext, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const showToast = useCallback((message, type = "info") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast(message);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#13151f',
            color: '#f0f2ff',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#13151f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#13151f',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
}
