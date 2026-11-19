import { describe, it, expect } from "vitest";
import { getOrderTimestamp } from "../data/accountData";

// Matching function identical to the Admin Orders desk implementation
function matchesDateFilter(
  order: any,
  dateFilter: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days" | "this_month" | "custom",
  customStart?: string,
  customEnd?: string
): boolean {
  if (dateFilter === "all") return true;

  const ts = getOrderTimestamp(order);
  if (!ts) return false;

  const orderDate = new Date(ts);
  const now = new Date();

  const orderStartOfDay = new Date(
    orderDate.getFullYear(),
    orderDate.getMonth(),
    orderDate.getDate()
  ).getTime();

  const todayStartOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  switch (dateFilter) {
    case "today":
      return orderStartOfDay === todayStartOfDay;

    case "yesterday":
      return orderStartOfDay === todayStartOfDay - ONE_DAY_MS;

    case "last_7_days":
      return (
        orderStartOfDay >= todayStartOfDay - 6 * ONE_DAY_MS &&
        orderStartOfDay <= todayStartOfDay + ONE_DAY_MS
      );

    case "last_30_days":
      return (
        orderStartOfDay >= todayStartOfDay - 29 * ONE_DAY_MS &&
        orderStartOfDay <= todayStartOfDay + ONE_DAY_MS
      );

    case "this_month":
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      );

    case "custom": {
      if (!customStart && !customEnd) return true;
      if (customStart) {
        const [sYear, sMonth, sDay] = customStart.split("-").map(Number);
        const startTime = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime();
        if (!isNaN(startTime) && ts < startTime) return false;
      }
      if (customEnd) {
        const [eYear, eMonth, eDay] = customEnd.split("-").map(Number);
        const endTime = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
        if (!isNaN(endTime) && ts > endTime) return false;
      }
      return true;
    }

    default:
      return true;
  }
}

describe("Admin Order Date Filter Engine", () => {
  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const todayOrderIso = {
    id: "ord-1",
    orderNumber: "PRG-WEB-TODAY",
    createdAt: now.toISOString(),
  };

  const todayWalkinOrder = {
    id: "ord-2",
    orderNumber: `WI-PAT-${now.getTime()}`,
  };

  const yesterdayOrder = {
    id: "ord-3",
    orderNumber: "PRG-WEB-YEST",
    createdAt: new Date(now.getTime() - ONE_DAY_MS).toISOString(),
  };

  const fiveDaysAgoOrder = {
    id: "ord-4",
    orderNumber: "PRG-WEB-5D",
    createdAt: new Date(now.getTime() - 5 * ONE_DAY_MS).toISOString(),
  };

  const fifteenDaysAgoOrder = {
    id: "ord-5",
    orderNumber: "PRG-WEB-15D",
    createdAt: new Date(now.getTime() - 15 * ONE_DAY_MS).toISOString(),
  };

  const fortyDaysAgoOrder = {
    id: "ord-6",
    orderNumber: "PRG-WEB-40D",
    createdAt: new Date(now.getTime() - 40 * ONE_DAY_MS).toISOString(),
  };

  it("filters orders for 'today' correctly", () => {
    expect(matchesDateFilter(todayOrderIso, "today")).toBe(true);
    expect(matchesDateFilter(todayWalkinOrder, "today")).toBe(true);
    expect(matchesDateFilter(yesterdayOrder, "today")).toBe(false);
    expect(matchesDateFilter(fiveDaysAgoOrder, "today")).toBe(false);
  });

  it("filters orders for 'yesterday' correctly", () => {
    expect(matchesDateFilter(yesterdayOrder, "yesterday")).toBe(true);
    expect(matchesDateFilter(todayOrderIso, "yesterday")).toBe(false);
    expect(matchesDateFilter(fiveDaysAgoOrder, "yesterday")).toBe(false);
  });

  it("filters orders for 'last_7_days' correctly", () => {
    expect(matchesDateFilter(todayOrderIso, "last_7_days")).toBe(true);
    expect(matchesDateFilter(yesterdayOrder, "last_7_days")).toBe(true);
    expect(matchesDateFilter(fiveDaysAgoOrder, "last_7_days")).toBe(true);
    expect(matchesDateFilter(fifteenDaysAgoOrder, "last_7_days")).toBe(false);
  });

  it("filters orders for 'last_30_days' correctly", () => {
    expect(matchesDateFilter(todayOrderIso, "last_30_days")).toBe(true);
    expect(matchesDateFilter(fiveDaysAgoOrder, "last_30_days")).toBe(true);
    expect(matchesDateFilter(fifteenDaysAgoOrder, "last_30_days")).toBe(true);
    expect(matchesDateFilter(fortyDaysAgoOrder, "last_30_days")).toBe(false);
  });

  it("filters orders for 'custom' date window correctly", () => {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(matchesDateFilter(todayOrderIso, "custom", todayStr, todayStr)).toBe(true);
    expect(matchesDateFilter(fortyDaysAgoOrder, "custom", todayStr, todayStr)).toBe(false);
  });

  it("returns true for 'all'", () => {
    expect(matchesDateFilter(todayOrderIso, "all")).toBe(true);
    expect(matchesDateFilter(fortyDaysAgoOrder, "all")).toBe(true);
  });
});
