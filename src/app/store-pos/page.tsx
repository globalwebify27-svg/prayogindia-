"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StorePOSGatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pos");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center text-white">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">
          Opening Prayog India Store POS Terminal...
        </p>
      </div>
    </div>
  );
}
