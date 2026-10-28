"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// Export everything from the new modern Zustand state management
export * from "@/store";

/**
 * StoreProvider component for the application root.
 * Serves as an initialization boundary for global store effects (e.g. session fetching).
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    useAuthStore.getState().initSession();
  }, []);

  return <>{children}</>;
};
