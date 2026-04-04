"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("ed_admin_token");
    const auth = localStorage.getItem("ed_admin_auth");
    if (!token && !auth) {
      router.replace("/admin-login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
