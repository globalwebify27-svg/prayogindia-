"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StoreManagerRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ranchi/storemanager");
  }, [router]);

  return null;
}
