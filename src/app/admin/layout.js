// Admin layout: no footer, independent from main layout
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  return <div className={`${styles.adminLayout} min-h-screen`}>{children}</div>;
}
