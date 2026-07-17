"use client";
import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import styles from "./CommandMenu.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandMenu({ navigate, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Command>
              <Command.Input placeholder="Type a command or search..." autoFocus />
              <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group heading="Navigation">
                  <Command.Item onSelect={() => { navigate("dashboard"); setIsOpen(false); }}>
                    <i className="fas fa-th-large" style={{ width: 20 }} /> Dashboard
                  </Command.Item>
                  {isAdmin && (
                    <Command.Item onSelect={() => { navigate("users"); setIsOpen(false); }}>
                      <i className="fas fa-users" style={{ width: 20 }} /> Users
                    </Command.Item>
                  )}
                  <Command.Item onSelect={() => { navigate("deposits"); setIsOpen(false); }}>
                    <i className="fas fa-wallet" style={{ width: 20 }} /> Deposits
                  </Command.Item>
                  <Command.Item onSelect={() => { navigate("withdrawals"); setIsOpen(false); }}>
                    <i className="fas fa-exchange-alt" style={{ width: 20 }} /> Withdrawals
                  </Command.Item>
                  {isAdmin && (
                    <Command.Item onSelect={() => { navigate("transactions"); setIsOpen(false); }}>
                      <i className="fas fa-list-alt" style={{ width: 20 }} /> Transactions
                    </Command.Item>
                  )}
                </Command.Group>

                <Command.Group heading="System & Profile">
                  {isAdmin && (
                    <Command.Item onSelect={() => { navigate("settings"); setIsOpen(false); }}>
                      <i className="fas fa-sliders-h" style={{ width: 20 }} /> Settings
                    </Command.Item>
                  )}
                  <Command.Item onSelect={() => { navigate("profile"); setIsOpen(false); }}>
                    <i className="fas fa-user-shield" style={{ width: 20 }} /> Profile
                  </Command.Item>
                  {isAdmin && (
                    <Command.Item onSelect={() => { navigate("moderator-logs"); setIsOpen(false); }}>
                      <i className="fas fa-history" style={{ width: 20 }} /> Audit Logs
                    </Command.Item>
                  )}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
