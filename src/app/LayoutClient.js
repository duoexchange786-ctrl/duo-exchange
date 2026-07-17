"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "./components/footer";
import ToastProvider from "./components/ToastProvider";
import ConfirmProvider from "./components/ConfirmProvider";

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideFooter = pathname?.startsWith("/admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const publicPaths = ["/", "/login", "/login-account"];
      
      // Bypass user auth for admin routes (they handle their own auth)
      if (pathname?.startsWith("/admin")) return;

      if (!publicPaths.includes(pathname)) {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
        }
      }
    }
  }, [pathname, router]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        {children}
        {!hideFooter && <Footer />}
      </ConfirmProvider>
    </ToastProvider>
  );
}
