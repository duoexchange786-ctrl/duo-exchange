"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from '../admin.module.css';
import AdminDepositsPage from "../deposits/page";
import CommandMenu from "../components/CommandMenu";
import ModeratorLogsPage from "../moderator-logs/page";
import { AnimatePresence, motion } from "framer-motion";
import AdminSellingRequests from "../Sellings/page";
import Users from "../Users/Page";
import AdminSettingsPage from "../settings/page";
import AdminProfilePage from "../profile/page";
import AdminTransactionsPage from "../transactions/page";

const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-th-large", group: "main" },
  { id: "users", label: "Users", icon: "fas fa-users", group: "main" },
  { id: "deposits", label: "Deposits", icon: "fas fa-wallet", group: "operations" },
  { id: "withdrawals", label: "Withdrawals", icon: "fas fa-exchange-alt", group: "operations" },
  { id: "transactions", label: "Transactions", icon: "fas fa-list-alt", group: "operations" },
  { id: "settings", label: "Settings", icon: "fas fa-sliders-h", group: "system" },
  { id: "moderator-logs", label: "Audit Logs", icon: "fas fa-history", group: "system" },
];

const MOD_NAV_ITEMS = [
  { id: "deposits", label: "Deposits", icon: "fas fa-wallet", group: "operations" },
  { id: "withdrawals", label: "Withdrawals", icon: "fas fa-exchange-alt", group: "operations" },
  { id: "profile", label: "My Profile", icon: "fas fa-user-shield", group: "system" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [adminEmail, setAdminEmail] = useState("Admin");
  const [adminRole, setAdminRole] = useState("admin");
  const [stats, setStats] = useState({ deposits: 0, sells: 0, users: 0, recentActivity: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetch("/api/admin/check-session");
        if (!sessionRes.ok) {
          router.replace("/admin/login");
          return;
        }
        const sessionData = await sessionRes.json();
        setAdminEmail(sessionData.email || "Admin");
        setAdminRole(sessionData.role || "admin");

        // Set default page based on role
        if (sessionData.role === 'moderator') {
          setActivePage("deposits");
        }

        // Only fetch stats for admin role
        if (sessionData.role !== 'moderator') {
          const statsRes = await fetch("/api/admin/stats");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        }
        setLoading(false);
      } catch (err) {
        router.replace("/admin/login");
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.replace("/admin/login");
    }
  };

  const navigate = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0d14",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "3px solid rgba(99, 102, 241, 0.2)",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: "#636b80", fontSize: "14px", fontWeight: 500 }}>
          Loading dashboard...
        </span>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        if (adminRole === 'moderator') return <AdminDepositsPage />;
        return <DashboardHome stats={stats} onNavigate={navigate} adminEmail={adminEmail} />;
      case "users": return adminRole === 'moderator' ? null : <Users />;
      case "deposits": return <AdminDepositsPage />;
      case "withdrawals": return <AdminSellingRequests />;
      case "settings": return adminRole === 'moderator' ? null : <AdminSettingsPage />;
      case "profile": return <AdminProfilePage />;
      case "transactions": return adminRole === 'moderator' ? null : <AdminTransactionsPage />;
      case "moderator-logs": return adminRole === 'moderator' ? null : <ModeratorLogsPage />;
      default: return null;
    }
  };

  const navItems = adminRole === 'moderator' ? MOD_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const isAdmin = adminRole === 'admin';

  const groupedNav = isAdmin
    ? [
      { label: "Main", items: navItems.filter(n => n.group === "main") },
      { label: "Operations", items: navItems.filter(n => n.group === "operations") },
      { label: "System", items: navItems.filter(n => n.group === "system") },
    ]
    : [
      { label: "Operations", items: navItems.filter(n => n.group === "operations") },
      { label: "Account", items: navItems.filter(n => n.group === "system") },
    ];

  const adminInitial = adminEmail.charAt(0).toUpperCase();
  const roleBadgeColor = isAdmin ? '#6366f1' : '#f59e0b';
  const roleLabel = isAdmin ? 'Administrator' : 'Moderator';

  return (
    <div className={styles.adminShell}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars" />
          </button>
          <div className={styles.brandIcon}>
            <i className="fas fa-bolt" />
          </div>
          <div className={styles.brandText}>duoexchange </div>
        </div>

        <div className={styles.topBarRight}>
          {/* Pending indicators (admin sees counts, moderator sees them too) */}
          {stats.deposits > 0 && isAdmin && (
            <button
              onClick={() => navigate('deposits')}
              title={`${stats.deposits} pending deposits`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "8px",
                color: "#f59e0b",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <i className="fas fa-wallet" style={{ fontSize: "11px" }} />
              {stats.deposits}
            </button>
          )}
          {stats.sells > 0 && isAdmin && (
            <button
              onClick={() => navigate('withdrawals')}
              title={`${stats.sells} pending withdrawals`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "8px",
                color: "#818cf8",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <i className="fas fa-exchange-alt" style={{ fontSize: "11px" }} />
              {stats.sells}
            </button>
          )}


        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside className={`${styles.adminSidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        {/* Mobile header */}
        <div className={styles.mobileSidebarHeader}>
          <div className={styles.brand} style={{ gap: "8px" }}>
            <div className={styles.brandIcon} style={{ width: "28px", height: "28px", fontSize: "12px" }}>
              <i className="fas fa-bolt" />
            </div>
            <div className={styles.brandText}>duoexchange </div>
          </div>
          <button className={styles.closeSidebarBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Role badge in sidebar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isAdmin ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '11px',
            fontWeight: 600,
            color: roleBadgeColor,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            <i className={isAdmin ? 'fas fa-shield-alt' : 'fas fa-user-check'} style={{ fontSize: '10px' }} />
            {roleLabel}
          </div>
        </div>

        {/* Navigation groups */}
        {groupedNav.map((group) => (
          <div key={group.label} className={styles.navSection}>
            <div className={styles.navLabel}>{group.label}</div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
                onClick={() => navigate(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(item.id)}
              >
                <span className={styles.navIcon}>
                  <i className={item.icon} />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Divider + Logout */}
        <div className={styles.sidebarDivider} />
        <button
          className={styles.userMenuBtn}
          onClick={() => isAdmin ? navigate("settings") : navigate("profile")}
          style={{ width: '100%', marginBottom: '8px', justifyContent: 'flex-start' }}
        >
          <div className={styles.userAvatar}>{adminInitial}</div>
          <div style={{ textAlign: 'left' }}>
            <div className={styles.userName}>{adminEmail}</div>
            <div className={styles.userRole} style={{ color: roleBadgeColor }}>{roleLabel}</div>
          </div>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" />
          Sign Out
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.adminMain}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <CommandMenu navigate={navigate} isAdmin={isAdmin} />
    </div>
  );
}

/* ── Dashboard Home Content (Admin only) ── */
function DashboardHome({ stats, onNavigate, adminEmail }) {
  const statCards = [
    {
      label: "Pending Sells",
      value: stats.sells,
      icon: "fas fa-exchange-alt",
      iconClass: "iconBlue",
      desc: "Withdrawal requests",
      action: () => onNavigate("withdrawals"),
    },
    {
      label: "Pending Deposits",
      value: stats.deposits,
      icon: "fas fa-wallet",
      iconClass: "iconOrange",
      desc: "Awaiting confirmation",
      action: () => onNavigate("deposits"),
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: "fas fa-users",
      iconClass: "iconGreen",
      desc: "Registered accounts",
      action: () => onNavigate("users"),
    },
  ];

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {getHour()}, {adminEmail.split("@")[0]} 👋
          </h1>
          <p className={styles.pageSubtitle}>
            Here's an overview of your platform today.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={styles.statCard}
            onClick={card.action}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.statHeader}>
              <div className={`${styles.iconWrapper} ${styles[card.iconClass]}`}>
                <i className={card.icon} />
              </div>
              <div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            </div>
            <div className={styles.statValue}>{card.value}</div>
            <div className={styles.statTrend}>
              <span className={styles.trendLabel}>{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className={styles.dashboardGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="fas fa-activity" style={{ color: "#6366f1", marginRight: "8px" }} />
              Recent Activity
            </h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate("transactions")}>
              View All <i className="fas fa-arrow-right" style={{ fontSize: "10px" }} />
            </button>
          </div>

          <div className={styles.activityList}>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((txn) => {
                const isDeposit = txn.type === "DEPOSIT";
                const iconColor = isDeposit ? "#22c55e" : "#f59e0b";
                const icon = isDeposit ? "fa-wallet" : "fa-exchange-alt";
                const statusClass = txn.status === "COMPLETED"
                  ? styles.badgeGreen
                  : txn.status === "PENDING"
                    ? styles.badgeYellow
                    : styles.badgeRed;

                return (
                  <div key={txn.id} className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ color: iconColor }}>
                      <i className={`fas ${icon}`} />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {txn.type}
                        <span
                          className={`${styles.badge} ${statusClass}`}
                          style={{ marginLeft: "8px", fontSize: "10px" }}
                        >
                          {txn.status}
                        </span>
                      </div>
                      <div className={styles.activityDesc}>
                        <strong style={{ color: "#a0aec0" }}>${txn.amount} {txn.currency}</strong>
                        {" · "}
                        {txn.user?.fullName || txn.user?.email || "User"}
                      </div>
                      <div className={styles.activityTime}>
                        <i className="fas fa-clock" style={{ marginRight: "4px", fontSize: "10px" }} />
                        {new Date(txn.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="fas fa-inbox" />
                </div>
                <div className={styles.emptyTitle}>No recent activity</div>
                <div className={styles.emptyDesc}>Transactions will appear here as they come in</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <i className="fas fa-bolt" style={{ color: "#f59e0b", marginRight: "8px" }} />
            Quick Actions
          </h3>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {[
            { label: "Approve Deposits", icon: "fas fa-check-circle", page: "deposits", color: "#22c55e" },
            { label: "Review Withdrawals", icon: "fas fa-exchange-alt", page: "withdrawals", color: "#6366f1" },
            { label: "Manage Users", icon: "fas fa-users", page: "users", color: "#38bdf8" },
            { label: "All Transactions", icon: "fas fa-list-alt", page: "transactions", color: "#a855f7" },
          ].map((a) => (
            <button
              key={a.page}
              onClick={() => onNavigate(a.page)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                color: "#a0aec0",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
                flex: "1 1 auto",
                minWidth: "160px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${a.color}18`;
                e.currentTarget.style.borderColor = `${a.color}40`;
                e.currentTarget.style.color = a.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "#a0aec0";
              }}
            >
              <i className={a.icon} style={{ color: a.color, fontSize: "16px" }} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
