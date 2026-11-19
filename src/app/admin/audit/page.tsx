"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuditPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-slate-400 text-xs font-semibold">Redirecting to Dashboard...</div>
    </div>
  );
}
