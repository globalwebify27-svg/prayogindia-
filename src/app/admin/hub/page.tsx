"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Package,
  Plus,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Plane,
  X,
  Trash2,
  Tag,
  Eye,
  RefreshCw,
  Sparkles,
  Award,
  DollarSign,
  TrendingUp,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Sliders,
  Layers,
  Check,
  Zap,
  ExternalLink,
  MessageSquare,
  Headphones,
  Boxes,
  Lock,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { MOCK_CUSTOMER_ORDERS, CustomerOrder } from "@/data/accountData";

// Preset Hardware Images for easy 1-click product image selection
const HARDWARE_PRESET_IMAGES = [
  { name: "Arduino Uno R4", url: "/assets/images/categories/arduino.jpg" },
  { name: "Sensors Bundle", url: "/assets/images/categories/sensors.jpg" },
  { name: "FPV Camera Drone", url: "/assets/images/categories/vip_drone.png" },
  { name: "IoT ESP32 Wi-Fi", url: "/assets/images/categories/iot_wireless.jpg" },
  { name: "Robotics Chassis", url: "/assets/images/categories/robotics.jpg" },
  { name: "LiPo 4S Battery", url: "/assets/images/categories/batteries.jpg" },
  { name: "NEMA17 Stepper", url: "/assets/images/categories/stepper_motor.jpg" },
  { name: "HD Camera Module", url: "/assets/images/categories/camera.jpg" },
  { name: "3D Filament & Nozzle", url: "/assets/images/categories/3d_printing.jpg" },
  { name: "Soldering & Lab Tools", url: "/assets/images/categories/tools.jpg" },
];

const CATEGORIES_LIST = [
  "Arduino & Microcontrollers",
  "Sensors & Modules",
  "Motors, Drivers & Actuators",
  "Robotics & Drones",
  "IoT & Wireless",
  "Batteries & Power Supplies",
  "Camera & Vision Modules",
  "Stepper Motors & CNC",
  "3D Printing & Prototyping",
  "Tools & Lab Equipment",
];

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "RETAIL" | "B2B_INSTITUTIONAL" | "PRO_MAKER" | "STUDENT";
  companyName?: string;
  gstin?: string;
  rewardPoints: number;
  totalOrders: number;
  totalSpend: number;
  registeredDate: string;
  status: "ACTIVE" | "VERIFIED" | "PENDING";
}

const INITIAL_CUSTOMERS: AdminCustomer[] = [
  {
    id: "usr-1",
    name: "Dr. Rajesh Vardhan",
    email: "robotics.lab@iitd.ac.in",
    phone: "+91 98765 43210",
    type: "B2B_INSTITUTIONAL",
    companyName: "IIT Delhi Robotics Innovation Hub",
    gstin: "07AAACI1234A1Z5",
    rewardPoints: 1250,
    totalOrders: 14,
    totalSpend: 142850,
    registeredDate: "2024-11-12",
    status: "VERIFIED",
  },
  {
    id: "usr-2",
    name: "Aman Sharma",
    email: "aman.maker@gmail.com",
    phone: "+91 87097 89641",
    type: "PRO_MAKER",
    companyName: "AeroDynamics Tech",
    gstin: "08BBBCP5678B2Z1",
    rewardPoints: 475,
    totalOrders: 6,
    totalSpend: 28400,
    registeredDate: "2025-01-15",
    status: "ACTIVE",
  },
  {
    id: "usr-3",
    name: "Pooja Hegde",
    email: "pooja.iot@mit.edu",
    phone: "+91 99887 76655",
    type: "STUDENT",
    rewardPoints: 120,
    totalOrders: 2,
    totalSpend: 4650,
    registeredDate: "2025-02-01",
    status: "ACTIVE",
  },
  {
    id: "usr-4",
    name: "Vikramaditya Rao",
    email: "vikram@dronetech-india.com",
    phone: "+91 91234 56789",
    type: "B2B_INSTITUTIONAL",
    companyName: "DroneTech India Pvt Ltd",
    gstin: "29AAAAA0000A1Z5",
    rewardPoints: 3400,
    totalOrders: 22,
    totalSpend: 312000,
    registeredDate: "2024-08-20",
    status: "VERIFIED",
  },
  {
    id: "usr-5",
    name: "Siddharth Sen",
    email: "siddharth@makerhobby.in",
    phone: "+91 93456 78901",
    type: "RETAIL",
    rewardPoints: 210,
    totalOrders: 3,
    totalSpend: 8900,
    registeredDate: "2025-02-20",
    status: "ACTIVE",
  },
];

interface SupportInquiry {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  date: string;
  message: string;
}

const INITIAL_SUPPORT: SupportInquiry[] = [
  {
    id: "sup-1",
    ticketNumber: "PRY-SUP-891",
    customerName: "Aman Sharma",
    customerPhone: "+91 87097 89641",
    subject: "15-Min Drone Dispatch Status for BLDC Motors",
    category: "Order Tracking & Drone Hub",
    priority: "HIGH",
    status: "IN_PROGRESS",
    date: "Just now",
    message: "Requested drone dispatch for 4x 2205 Brushless Motors to Sector 62 Hub.",
  },
  {
    id: "sup-2",
    ticketNumber: "PRY-SUP-890",
    customerName: "Dr. Rajesh Vardhan",
    customerPhone: "+91 98765 43210",
    subject: "B2B Institutional GST Tax Invoice for Lab Setup",
    category: "B2B & GST Billing",
    priority: "MEDIUM",
    status: "OPEN",
    date: "2 hours ago",
    message: "Please re-issue the 18% GST invoice with our updated Department code.",
  },
  {
    id: "sup-3",
    ticketNumber: "PRY-SUP-889",
    customerName: "Pooja Hegde",
    customerPhone: "+91 99887 76655",
    subject: "ESP32-S3 Camera Pinout Schematic Inquiry",
    category: "Technical Hardware Support",
    priority: "LOW",
    status: "RESOLVED",
    date: "Yesterday",
    message: "Needed the GPIO pinout chart for ESP32-CAM AI module. Provided schematic link.",
  },
];

export default function UnifiedAdminHubPage() {
  const [activeTab, setActiveTab] = useState<
    "users" | "orders" | "add-product" | "edit-products" | "categories" | "support"
  >("edit-products");

  // Global State for all things
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS as Product[]);
  const [ordersList, setOrdersList] = useState<CustomerOrder[]>(MOCK_CUSTOMER_ORDERS);
  const [customersList, setCustomersList] = useState<AdminCustomer[]>(INITIAL_CUSTOMERS);
  const [supportList, setSupportList] = useState<SupportInquiry[]>(INITIAL_SUPPORT);

  // Search & Filter state
  const [globalSearch, setGlobalSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [userTypeFilter, setUserTypeFilter] = useState("All");

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<AdminCustomer | null>(null);
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);
  const [grantCoinsUser, setGrantCoinsUser] = useState<AdminCustomer | null>(null);
  const [coinsToAdd, setCoinsToAdd] = useState<number>(50);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("Prayog India");
  const [newProdCategory, setNewProdCategory] = useState(CATEGORIES_LIST[0]);
  const [newProdSubcategory, setNewProdSubcategory] = useState("Development Boards");
  const [newProdPrice, setNewProdPrice] = useState<number>(1499);
  const [newProdMrp, setNewProdMrp] = useState<number>(2499);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdImage, setNewProdImage] = useState("/assets/images/categories/arduino.jpg");
  const [newProdDesc, setNewProdDesc] = useState(
    "High-performance hardware component engineered for Indian makers, engineers, and educational labs.",
  );
  const [newProdFeature1, setNewProdFeature1] = useState("32-bit High-Speed Microcontroller");
  const [newProdFeature2, setNewProdFeature2] = useState("Integrated Wi-Fi & Bluetooth 5.0");
  const [newProdFeature3, setNewProdFeature3] = useState("Supports Arduino IDE & MicroPython");
  const [newProdIsSensitive, setNewProdIsSensitive] = useState(false);
  const [newProdInStock, setNewProdInStock] = useState(true);

  // Calculated Metrics
  const totalRevenue = useMemo(
    () => ordersList.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    [ordersList],
  );
  const totalItemsCount = productsList.length;
  const lowStockCount = useMemo(
    () => productsList.filter((p) => (p.specs?.stock ? parseInt(p.specs.stock) < 10 : false)).length,
    [productsList],
  );

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesSearch =
        !globalSearch ||
        p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(globalSearch.toLowerCase());

      const matchesCat =
        productCategoryFilter === "All" ||
        p.category.toLowerCase().includes(productCategoryFilter.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [productsList, globalSearch, productCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchesSearch =
        !globalSearch ||
        o.orderNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
        o.shippingAddress.toLowerCase().includes(globalSearch.toLowerCase()) ||
        o.status.toLowerCase().includes(globalSearch.toLowerCase());

      const matchesStatus =
        orderStatusFilter === "All" ||
        o.status.toLowerCase().replace(/ /g, "_") ===
          orderStatusFilter.toLowerCase().replace(/ /g, "_");

      return matchesSearch && matchesStatus;
    });
  }, [ordersList, globalSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customersList.filter((c) => {
      const matchesSearch =
        !globalSearch ||
        c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.phone.includes(globalSearch) ||
        (c.companyName && c.companyName.toLowerCase().includes(globalSearch.toLowerCase()));

      const matchesType = userTypeFilter === "All" || c.type === userTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [customersList, globalSearch, userTypeFilter]);

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku || !newProdPrice) {
      alert("Please fill in Product Name, SKU, and Selling Price.");
      return;
    }

    const discountPercent = Math.round(((newProdMrp - newProdPrice) / newProdMrp) * 100);

    const createdProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      sku: newProdSku.toUpperCase(),
      brand: newProdBrand,
      category: newProdCategory,
      subcategory: newProdSubcategory,
      price: Number(newProdPrice),
      mrp: Number(newProdMrp),
      discount: `${discountPercent > 0 ? discountPercent : 0}% OFF`,
      rating: 4.8,
      reviews: 1,
      inStock: newProdInStock,
      image: newProdImage,
      description: newProdDesc,
      features: [newProdFeature1, newProdFeature2, newProdFeature3].filter(Boolean),
      specs: {
        Stock: String(newProdStock),
        Brand: newProdBrand,
        Category: newProdCategory,
        "GST Rate": "18%",
        "Sensitive Part": newProdIsSensitive ? "Yes (High-Voltage/Lithium)" : "No",
      },
    };

    setProductsList([createdProduct, ...productsList]);
    showToast(`✅ Product "${newProdName}" added successfully to live catalog!`);

    // Reset Form
    setNewProdName("");
    setNewProdSku("");
    setNewProdPrice(999);
    setNewProdMrp(1499);
    setActiveTab("edit-products");
  };

  const handleUpdateProduct = (updated: Product) => {
    setProductsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
    showToast(`✅ Product "${updated.name}" updated successfully.`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      showToast(`🗑️ Product "${name}" deleted.`);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: CustomerOrder["status"]) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    showToast(`📦 Order ${orderId} status updated to: ${newStatus}`);
  };

  const handleGrantCoins = () => {
    if (!grantCoinsUser) return;
    setCustomersList((prev) =>
      prev.map((c) =>
        c.id === grantCoinsUser.id
          ? { ...c, rewardPoints: c.rewardPoints + Number(coinsToAdd) }
          : c,
      ),
    );
    showToast(`🪙 Granted +${coinsToAdd} Prayog Coins to ${grantCoinsUser.name}!`);
    setGrantCoinsUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#005CA9] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-400/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#FFC20E]" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#003B73] to-[#005CA9] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-sky-400/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-amber-400/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Prayog India • Unified Administration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              All-In-One Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl leading-relaxed">
              Manage customers, process drone & ground orders, create new hardware parts, and modify catalog inventory—all in one unified console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("add-product")}
              className="flex items-center gap-2 bg-[#FFC20E] hover:bg-[#F59E0B] text-slate-900 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-900 stroke-[3]" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-slate-100">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Users</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {customersList.length} <span className="text-xs font-normal text-sky-300">Registered</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Orders</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {ordersList.length} <span className="text-xs font-normal text-sky-300">Total</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Products</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {totalItemsCount} <span className="text-xs font-normal text-sky-300">In Catalog</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FFC20E]" />
              <span>Total Sales GMV</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              ₹ {totalRevenue.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Master Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab("edit-products")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "edit-products"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Edit & Manage Products</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {productsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("add-product")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "add-product"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Management</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {ordersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Details & CRM</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {customersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "categories"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categories</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {CATEGORIES_LIST.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "support"
              ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Desk</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {supportList.length}
          </span>
        </button>
      </div>

      {/* Global Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab.replace("-", " ")} by keyword, name, SKU, or phone...`}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab-specific contextual filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {activeTab === "edit-products" && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-slate-400 text-[11px]">Category:</span>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
              >
                <option value="All">All Categories ({productsList.length})</option>
                {CATEGORIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
              >
                <option value="All">All Orders ({ordersList.length})</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-slate-400 text-[11px]">Type:</span>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
              >
                <option value="All">All User Types ({customersList.length})</option>
                <option value="B2B_INSTITUTIONAL">B2B Institutional</option>
                <option value="PRO_MAKER">Pro Maker VIP</option>
                <option value="RETAIL">Retail Customer</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDIT & MANAGE PRODUCTS (CATALOG MASTER) */}
      {/* ========================================================================= */}
      {activeTab === "edit-products" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Products Catalog Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredProducts.length} hardware products available in Prayog Store & Mobile App.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("add-product")}
              className="flex items-center gap-1.5 bg-[#005CA9] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#004A87] transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Another Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">SKU / Brand</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredProducts.map((p) => {
                  const stockNum = p.specs?.Stock ? parseInt(p.specs.Stock) : 45;
                  const isLow = stockNum < 10;

                  return (
                    <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 line-clamp-1 max-w-xs">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                              {p.description || "Hardware component for makers"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          {p.sku}
                        </div>
                        <div className="text-[10.5px] text-slate-400">{p.brand || "Prayog India"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">₹{p.price}</div>
                        {p.mrp && p.mrp > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{p.mrp} <span className="text-emerald-600 font-bold ml-0.5">{p.discount}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isLow
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-amber-600" : "bg-emerald-600"}`} />
                            {stockNum} Units
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Edit Button */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#005CA9] transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADD NEW PRODUCT FORM */}
      {/* ========================================================================= */}
      {activeTab === "add-product" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Add New Hardware Product
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create and publish a component to the mobile app & web store simultaneously.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Live Publishing
              </span>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 mt-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  1. Core Product Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ESP32-S3 Dual-Core AI Camera Development Board"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SKU / Part Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PRY-ESP32-S3"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      className="w-full font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Category *
                    </label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
                    >
                      {CATEGORIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  2. Pricing, Inventory & Economics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={newProdMrp}
                      onChange={(e) => setNewProdMrp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Initial Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Image & Preset Library */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  3. Media & Product Photo
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Image Asset URL
                  </label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2">
                    Quick Pick from Prayog Pre-Loaded High-Res Library:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {HARDWARE_PRESET_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setNewProdImage(preset.url)}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          newProdImage === preset.url
                            ? "bg-sky-50 border-[#005CA9] text-[#005CA9] ring-2 ring-[#005CA9]/30"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="line-clamp-1 text-center text-[10px]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description & Technical Features */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  4. Technical Specs & Description
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Feature 1 (e.g. 240MHz Dual-Core)"
                    value={newProdFeature1}
                    onChange={(e) => setNewProdFeature1(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Feature 2 (e.g. Wi-Fi & BLE 5.0)"
                    value={newProdFeature2}
                    onChange={(e) => setNewProdFeature2(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Feature 3 (e.g. Type-C Interface)"
                    value={newProdFeature3}
                    onChange={(e) => setNewProdFeature3(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>

                {/* Flags */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newProdIsSensitive}
                      onChange={(e) => setNewProdIsSensitive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9]"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Sensitive Item (High-Voltage AC / Lithium)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newProdInStock}
                      onChange={(e) => setNewProdInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9]"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Instantly Mark In-Stock
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#005CA9] hover:bg-[#004A87] text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>Publish Product to Store & App</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile App Card Preview (1 column) */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Live Mobile App Card Preview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-[10px]">
                  Real-time
                </span>
              </div>

              {/* Card Container */}
              <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-lg border border-slate-100 space-y-3">
                <div className="w-full h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 relative border border-slate-100">
                  <img
                    src={newProdImage || "/assets/images/categories/arduino.jpg"}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {newProdMrp > newProdPrice && (
                    <span className="absolute top-2.5 left-2.5 bg-[#FFC20E] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      {Math.round(((newProdMrp - newProdPrice) / newProdMrp) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#005CA9] bg-sky-50 px-2 py-0.5 rounded-md">
                    {newProdCategory}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1.5 line-clamp-2">
                    {newProdName || "Your Hardware Product Name"}
                  </h4>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black text-slate-900">
                    ₹{newProdPrice || 0}
                  </span>
                  {newProdMrp > newProdPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{newProdMrp}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 line-clamp-2">
                  {newProdDesc}
                </div>

                <button
                  type="button"
                  className="w-full bg-[#005CA9] text-white py-2 rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart (Simulated)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Customer Orders & Drone Dispatch
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage fulfillment, update statuses, and trigger 15-min express drone dispatches.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer & Address</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-slate-900 text-[12px]">
                        {o.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{o.date}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {o.shippingAddress.split(",")[0] || "Customer Delivery"}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {o.shippingAddress}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {o.itemsCount} Item{o.itemsCount > 1 ? "s" : ""}
                        </span>
                        {o.items && o.items[0] && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            ({o.items[0].name})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{o.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Prepaid (UPI/Card)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            o.id,
                            e.target.value as CustomerOrder["status"],
                          )
                        }
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          o.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : o.status === "Shipped" || o.status === "Out for Delivery"
                            ? "bg-sky-50 text-sky-800 border-sky-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 15-Min Drone Dispatch Trigger */}
                        <button
                          onClick={() => {
                            handleUpdateOrderStatus(o.id, "Out for Delivery");
                            showToast(`🛸 Express Drone Dispatched for ${o.orderNumber}! ETA: 14 mins.`);
                          }}
                          className="flex items-center gap-1.5 bg-[#031B33] hover:bg-[#003B73] text-[#FFC20E] text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Plane className="w-3.5 h-3.5" />
                          <span>Drone Hub</span>
                        </button>

                        {/* View Invoice Modal Button */}
                        <button
                          onClick={() => setViewingOrder(o)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USER DETAILS & CRM */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Registered Users & Customer Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer profiles, B2B institutional records, maker streak coins, and purchase history.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Customer Type</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Prayog Coins</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#031B33] text-white flex items-center justify-center font-bold text-sm border-2 border-amber-400">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                            <span>{c.phone}</span>
                            <span>•</span>
                            <span>{c.email}</span>
                          </div>
                          {c.companyName && (
                            <div className="text-[10px] text-sky-700 font-bold mt-0.5">
                              🏢 {c.companyName} (GST: {c.gstin})
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-extrabold ${
                          c.type === "B2B_INSTITUTIONAL"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : c.type === "PRO_MAKER"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {c.type.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.totalOrders} Orders
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        🪙 {c.rewardPoints}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Grant Coins Button */}
                        <button
                          onClick={() => setGrantCoinsUser(c)}
                          className="flex items-center gap-1 bg-[#FFC20E] text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>+Coins</span>
                        </button>

                        {/* View User Modal */}
                        <button
                          onClick={() => setViewingCustomer(c)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CATEGORIES MASTER */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_LIST.map((cat, idx) => {
            const count = productsList.filter((p) =>
              p.category.toLowerCase().includes(cat.toLowerCase()),
            ).length;
            const presetImg = HARDWARE_PRESET_IMAGES[idx % HARDWARE_PRESET_IMAGES.length]?.url;

            return (
              <div
                key={cat}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 hover:border-[#005CA9] transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 overflow-hidden flex items-center justify-center shrink-0">
                    <img src={presetImg} alt={cat} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{cat}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{count || 12} Live Products</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProductCategoryFilter(cat);
                    setActiveTab("edit-products");
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#005CA9] hover:text-white text-slate-600 transition-all cursor-pointer"
                  title="View Products in Category"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPORT DESK */}
      {/* ========================================================================= */}
      {activeTab === "support" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              Customer Support & Technical Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live technical queries, drone dispatch updates, and lab procurement requests.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {supportList.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#005CA9] bg-sky-50 px-2.5 py-0.5 rounded-md">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-700">{ticket.category}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{ticket.date}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{ticket.subject}</h4>
                  <p className="text-xs text-slate-600">{ticket.message}</p>
                  <div className="text-[11px] font-bold text-slate-500 pt-1">
                    👤 From: {ticket.customerName} ({ticket.customerPhone})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      ticket.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ticket.status}
                  </span>

                  {ticket.status !== "RESOLVED" && (
                    <button
                      onClick={() => {
                        setSupportList((prev) =>
                          prev.map((t) =>
                            t.id === ticket.id ? { ...t, status: "RESOLVED" } : t,
                          ),
                        );
                        showToast(`✅ Ticket ${ticket.ticketNumber} marked as Resolved!`);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Edit Product Details
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.mrp}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        mrp: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  value={
                    editingProduct.specs?.Stock
                      ? parseInt(editingProduct.specs.Stock)
                      : 45
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      specs: {
                        ...editingProduct.specs,
                        Stock: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-extrabold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateProduct(editingProduct)}
                className="px-5 py-2 text-xs font-extrabold bg-[#005CA9] text-white rounded-xl hover:bg-[#004A87] shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GRANT COINS */}
      {/* ========================================================================= */}
      {grantCoinsUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
              🪙
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Grant Prayog Coins
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add loyalty reward coins to <strong>{grantCoinsUser.name}</strong>.
            </p>

            <div className="my-6">
              <input
                type="number"
                value={coinsToAdd}
                onChange={(e) => setCoinsToAdd(Number(e.target.value))}
                className="w-32 text-center bg-slate-50 border-2 border-amber-400 rounded-2xl py-3 text-2xl font-black text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setGrantCoinsUser(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrantCoins}
                className="px-6 py-2.5 text-xs font-extrabold bg-[#FFC20E] text-slate-900 rounded-xl hover:bg-amber-400 shadow-md cursor-pointer"
              >
                Grant Coins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW CUSTOMER DETAILS */}
      {/* ========================================================================= */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#031B33] text-white flex items-center justify-center font-bold text-lg border-2 border-amber-400">
                  {viewingCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{viewingCustomer.name}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {viewingCustomer.type.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs font-medium text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Phone:</span>
                <span className="font-bold text-slate-900">{viewingCustomer.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-slate-900">{viewingCustomer.email}</span>
              </div>
              {viewingCustomer.companyName && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Company / Lab:</span>
                    <span className="font-bold text-slate-900">{viewingCustomer.companyName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">GSTIN:</span>
                    <span className="font-mono font-bold text-sky-700">{viewingCustomer.gstin}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Total Orders:</span>
                <span className="font-bold text-slate-900">{viewingCustomer.totalOrders} Orders</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Lifetime Spend:</span>
                <span className="font-extrabold text-slate-900">₹{viewingCustomer.totalSpend.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Prayog Coins:</span>
                <span className="font-extrabold text-amber-700">🪙 {viewingCustomer.rewardPoints}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW INVOICE & ORDER */}
      {/* ========================================================================= */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">
                  Tax Invoice & Order Receipt
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  {viewingOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[11px] font-bold text-slate-500">Shipping Address:</div>
                <div className="font-semibold text-slate-900">{viewingOrder.shippingAddress}</div>
                <div className="text-slate-400 text-[11px] pt-1">Date: {viewingOrder.date} • Status: <strong className="text-[#005CA9]">{viewingOrder.status}</strong></div>
              </div>

              <div>
                <div className="font-extrabold text-slate-800 mb-2">Order Items:</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewingOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="font-extrabold text-slate-900">₹{item.quantity * item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount Paid (Incl. 18% GST):</span>
                <span>₹{viewingOrder.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-[#005CA9] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
