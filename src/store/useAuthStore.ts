import { create } from "zustand";
import { CustomerUser } from "./types";
import { CustomerType } from "@/data/customerTypes";

interface AuthState {
  user: CustomerUser | null;
  isLoggedIn: boolean;
  loginUser: (user: CustomerUser) => void;
  logoutUser: () => void;
  updateUser: (data: Partial<CustomerUser>) => void;
  setCustomerType: (type: CustomerType) => void;
  redeemRewardPoints: (pointsToRedeem: number) => number;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,

  loginUser: (userData: CustomerUser) => {
    set({ user: userData, isLoggedIn: true });
  },

  logoutUser: () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    set({ user: null, isLoggedIn: false });
  },

  updateUser: (data: Partial<CustomerUser>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
      isLoggedIn: !!state.user,
    }));
  },

  setCustomerType: (type: CustomerType) => {
    set((state) => ({
      user: state.user
        ? { ...state.user, customerType: type }
        : {
            name: "Guest Customer",
            email: "guest@prayog.in",
            phone: "",
            customerType: type,
            rewardPoints: 0,
          },
      isLoggedIn: true,
    }));
  },

  redeemRewardPoints: (pointsToRedeem: number): number => {
    const user = get().user;
    if (!user || user.rewardPoints < pointsToRedeem) return 0;
    const discountAmount = pointsToRedeem * 0.5; // 1 point = ₹0.50
    set({
      user: { ...user, rewardPoints: user.rewardPoints - pointsToRedeem },
    });
    return discountAmount;
  },

  initSession: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && data?.user) {
        set({
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            customerType: data.user.customerType || "Registered Customer",
            companyName: data.user.companyName,
            gstin: data.user.gstin,
            rewardPoints:
              typeof data.user.rewardPoints === "number"
                ? data.user.rewardPoints
                : 100,
          },
          isLoggedIn: true,
        });
      }
    } catch {
      // Offline / guest session
    }
  },
}));

// ── Fine-grained pure selectors
export const selectUser = (state: AuthState): CustomerUser | null => state.user;
export const selectIsLoggedIn = (state: AuthState): boolean => state.isLoggedIn;
export const selectRewardPoints = (state: AuthState): number =>
  state.user?.rewardPoints ?? 0;
