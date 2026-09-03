"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function StoreManagerBranchRedirect() {
  const router = useRouter();
  const params = useParams();
  const branch = (params?.branch as string) || "ranchi";

  useEffect(() => {
    router.replace(`/${branch}/storemanager`);
  }, [router, branch]);

  return null;
}
