"use client";
import React, { useEffect, useState } from "react";
import styles from "../admin.module.css";
import { useToast } from "@/app/components/ToastProvider";

export default function ModeratorLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const { showToast } = useToast();

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderator-logs?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setTotal(data.total);
        setPage(data.page);
      } else {
        showToast(data.error || "Failed to fetch logs", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error fetching logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <i className="fas fa-history" style={{ color: "#8b5cf6", marginRight: "8px" }} />
          Moderator Audit Logs
        </h3>
      </div>
      
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#636b80" }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }} /> Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><i className="fas fa-inbox" /></div>
            <div className={styles.emptyTitle}>No logs found</div>
            <div className={styles.emptyDesc}>No moderator actions have been recorded yet.</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Moderator</th>
                <th>Target User</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span className={`${styles.badge} ${log.action.includes('REJECT') ? styles.badgeRed : log.action.includes('APPROVE') ? styles.badgeGreen : styles.badgeBlue}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.moderatorEmail}</td>
                  <td>{log.targetUserEmail || "N/A"}</td>
                  <td>
                    <div style={{ fontSize: "12px", color: "#a0aec0", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.details}>
                      {log.details || "-"}
                    </div>
                  </td>
                  <td style={{ fontSize: "12px", color: "#636b80" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button className={styles.paginationBtn} disabled={page === 1} onClick={() => fetchLogs(page - 1)}>
            <i className="fas fa-chevron-left" /> Prev
          </button>
          <span style={{ color: "#a0aec0", fontSize: "13px" }}>
            Page {page} of {totalPages}
          </span>
          <button className={styles.paginationBtn} disabled={page === totalPages} onClick={() => fetchLogs(page + 1)}>
            Next <i className="fas fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
