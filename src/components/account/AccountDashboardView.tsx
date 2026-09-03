"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  ShoppingBag,
  Heart,
  Award,
  MapPin,
  Headphones,
  User,
  ArrowRight,
} from "lucide-react";
import {
  MOCK_CUSTOMER_ORDERS,
  MOCK_SUPPORT_TICKETS,
  MOCK_SAVED_ADDRESSES,
} from "@/data/accountData";

export const AccountDashboardView: React.FC = () => {
  const { user, isLoggedIn } = useStore();

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto border border-[#00AEEF]/20">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In Required</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Please sign in to access your Prayog customer account, order history,
          addresses, and reward points.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="bg-[#00AEEF] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-slate-100 text-slate-800 px-6 py-2.5 rounded-full text-xs font-black uppercase"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-8 text-slate-900">
      {/* Welcome Banner Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name || "Valued Customer"} 👋
          </h1>
          <p className="text-xs text-slate-500">
            {user?.email} • {user?.customerType}
          </p>
        </div>

        <Link
          href="/account/profile"
          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto shadow-2xs"
        >
          Edit Profile
        </Link>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#00AEEF] transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#00AEEF] group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">
              {MOCK_CUSTOMER_ORDERS.length}
            </span>
            <h4 className="text-xs font-bold text-slate-500">
              Total Orders Placed
            </h4>
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#00AEEF] transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#FF3B30] group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">Saved</span>
            <h4 className="text-xs font-bold text-slate-500">
              Wishlist Products
            </h4>
          </div>
        </Link>

        <Link
          href="/account/rewards"
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#00AEEF] transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#FFC20E] group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">
              {user?.rewardPoints || 1250}
            </span>
            <h4 className="text-xs font-bold text-slate-500">
              Available Reward PTS
            </h4>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#00AEEF] transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#00AEEF] group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">
              {MOCK_SAVED_ADDRESSES.length}
            </span>
            <h4 className="text-xs font-bold text-slate-500">
              Saved Addresses
            </h4>
          </div>
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Recent Hardware Orders
          </h3>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {MOCK_CUSTOMER_ORDERS.slice(0, 1).map((ord) => (
            <div
              key={ord.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-extrabold text-slate-900">
                  {ord.orderNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block">
                  {ord.date} • {ord.items[0].name}
                </span>
              </div>
              <span className="bg-[#E0F7FC] text-[#00AEEF] font-bold px-3 py-1 rounded-full">
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
