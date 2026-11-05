"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Upload,
  Video,
  X,
  Sparkles,
  Layers,
  FileText,
  ListPlus,
  Trash2,
  Globe,
  Tag,
  Eye,
  Edit3,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Info,
  Share2,
  ExternalLink,
  Copy,
  Smartphone,
  Monitor,
  Sliders,
  Check,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Zap,
  Download,
  MoreVertical,
  Box,
  IndianRupee,
  Users,
  ShoppingCart,
  LayoutGrid,
  List,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";
import { ShippingTagType } from "@/data/productShippingConfig";
import {
  CATEGORIES_HIERARCHY,
  flattenCategories,
} from "@/data/categoriesHierarchy";
import { CATEGORIES_DATA } from "@/data/categories";
import { compressImageOnClient } from "@/lib/clientImageCompressor";

interface UploadedMediaItem {
  name: string;
  type: "image" | "video";
  url: string;
  publicId?: string;
  bytes?: number;
  originalBytes?: number;
  savingsPercentage?: number;
}

interface ProductItemRow {
  id: string;
  name: string;
  sku: string;
  brand?: string;
  category?: string | { name: string };
  categoryName?: string;
  subcategory?: string;
  price: number;
  mrp?: number;
  stock?: number;
  inStock?: boolean;
  gstPercent?: number;
  description?: string;
  weightGrams?: number;
  dimensionsCm?: { length: number; width: number; height: number };
  shippingTag?: string;
  image?: string;
  images?: Array<string | { imageUrl: string }>;
  videoUrl?: string;
  features?: string[];
  applications?: string[];
  whatsIncluded?: string[];
  specs?: Record<string, string>;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  indexFollow?: boolean;
  structuredDataType?: string;
  seoSlug?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItemRow[]>(
    PRODUCTS as unknown as ProductItemRow[],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ProductItemRow | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "media" | "specs" | "shipping" | "seo"
  >("general");

  // Selection & UI Filters (Image 1 Specs)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Drafts" | "Archived">("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Selection handlers
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Comprehensive CSV Export handler (Includes all Details, SEO attributes, and Image URLs)
  const handleExportProducts = () => {
    const headers = [
      "ID",
      "Slug",
      "Name",
      "SKU",
      "Brand",
      "Category",
      "Subcategory",
      "Price (INR)",
      "MRP (INR)",
      "Stock",
      "Status",
      "GST Percent",
      "Description",
      // Media / Images
      "Primary Image URL",
      "All Image URLs",
      "Video URL",
      // SEO Information
      "Meta Title",
      "Meta Description",
      "SEO Slug",
      "Meta Keywords",
      "Canonical URL",
      "OG Image URL",
      "Robots Indexing",
      "Schema Structured Type",
      // Specifications & Shipping
      "Key Features",
      "Applications",
      "Whats Included",
      "Technical Specs",
      "Weight (grams)",
      "Dimensions (cm)",
      "Shipping Tag",
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = products.map((p) => {
      // Primary & All Images
      const imgList: string[] = [];
      if (p.image) imgList.push(p.image);
      if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
          const url = typeof img === "string" ? img : img?.imageUrl;
          if (url && !imgList.includes(url)) imgList.push(url);
        });
      }
      const primaryImage = imgList[0] || p.image || "";
      const allImages = imgList.join("; ");

      // Category
      const catName =
        typeof p.category === "object"
          ? p.category?.name
          : p.category || p.categoryName || "";

      // Status
      const statusText =
        p.stock === 0
          ? "Out of Stock"
          : p.inStock === false
          ? "Inactive"
          : !p.sku || p.name.toLowerCase().includes("draft")
          ? "Draft"
          : "Published";

      // SEO Fields
      const autoSlug = (p.slug || p.id || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const metaTitle =
        p.metaTitle ||
        `${p.name} - Buy Online at Best Price | ${p.brand || "Prayog India"}`;
      const metaDescription =
        p.metaDescription ||
        `Buy genuine ${p.name} online in India from Prayog India. Best price, official warranty & express delivery.`;
      const seoSlug = p.seoSlug || p.slug || autoSlug;
      const metaKeywords = Array.isArray(p.metaKeywords)
        ? p.metaKeywords.join(", ")
        : "";
      const canonicalUrl =
        p.canonicalUrl || `https://www.prayogindia.com/products/${seoSlug}`;
      const ogImage = p.ogImage || primaryImage;
      const robotsIndexing =
        p.indexFollow !== false ? "index, follow" : "noindex, nofollow";
      const schemaType = p.structuredDataType || "Product";

      // Specifications & Rich Details
      const features = Array.isArray(p.features) ? p.features.join(" | ") : "";
      const applications = Array.isArray(p.applications)
        ? p.applications.join(" | ")
        : "";
      const whatsIncluded = Array.isArray(p.whatsIncluded)
        ? p.whatsIncluded.join(" | ")
        : "";
      const specsString = p.specs
        ? Object.entries(p.specs)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")
        : "";
      const dimsString = p.dimensionsCm
        ? `${p.dimensionsCm.length}x${p.dimensionsCm.width}x${p.dimensionsCm.height}`
        : "";

      return [
        escapeCsv(p.id),
        escapeCsv(p.slug || autoSlug),
        escapeCsv(p.name),
        escapeCsv(p.sku),
        escapeCsv(p.brand || "Prayog India"),
        escapeCsv(catName),
        escapeCsv(p.subcategory || ""),
        escapeCsv(p.price),
        escapeCsv(p.mrp || p.price),
        escapeCsv(p.stock ?? 25),
        escapeCsv(statusText),
        escapeCsv(p.gstPercent ?? 18),
        escapeCsv(p.description || ""),
        // Media
        escapeCsv(primaryImage),
        escapeCsv(allImages),
        escapeCsv(p.videoUrl || ""),
        // SEO
        escapeCsv(metaTitle),
        escapeCsv(metaDescription),
        escapeCsv(seoSlug),
        escapeCsv(metaKeywords),
        escapeCsv(canonicalUrl),
        escapeCsv(ogImage),
        escapeCsv(robotsIndexing),
        escapeCsv(schemaType),
        // Specs & Shipping
        escapeCsv(features),
        escapeCsv(applications),
        escapeCsv(whatsIncluded),
        escapeCsv(specsString),
        escapeCsv(p.weightGrams || ""),
        escapeCsv(dimsString),
        escapeCsv(p.shippingTag || "Standard"),
      ].join(",");
    });

    // UTF-8 BOM prefix (\uFEFF) ensures Excel & Google Sheets open with full Unicode support
    const csvContent =
      "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `prayog_products_catalog_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Bulk Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importParsedRows, setImportParsedRows] = useState<Array<Record<string, string>>>([]);
  const [importUpdateExisting, setImportUpdateExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSummary, setImportSummary] = useState<{
    created: number;
    updated: number;
    total: number;
    errors: Array<{ row: number; name: string; error: string }>;
  } | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Quote-aware, multi-line, BOM-safe CSV Parser
  const parseCsvText = (text: string): Array<Record<string, string>> => {
    const cleanText = text.replace(/^\uFEFF/, "");
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === "\r" || char === "\n") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim());
    const dataObjects: Array<Record<string, string>> = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length === 0 || row.every((c) => !c)) continue;

      const obj: Record<string, string> = {};
      headers.forEach((header, colIdx) => {
        if (header) {
          obj[header] = row[colIdx] ?? "";
        }
      });
      dataObjects.push(obj);
    }

    return dataObjects;
  };

  const handleCsvFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setImportError("Please upload a valid .csv spreadsheet file.");
      return;
    }
    setImportError("");
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const parsed = parseCsvText(text);
        if (parsed.length === 0) {
          setImportError("CSV file has no data rows after the header line.");
        } else {
          setImportParsedRows(parsed);
        }
      } catch {
        setImportError("Unable to parse CSV file. Please make sure it is a valid UTF-8 CSV.");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDownloadSampleCsvTemplate = () => {
    const headers = [
      "Name",
      "SKU",
      "Brand",
      "Category",
      "Subcategory",
      "Price (INR)",
      "MRP (INR)",
      "Stock",
      "GST Percent",
      "Description",
      "Primary Image URL",
      "All Image URLs",
      "Video URL",
      "Meta Title",
      "Meta Description",
      "SEO Slug",
      "Meta Keywords",
      "Canonical URL",
      "Key Features",
      "Applications",
      "Whats Included",
      "Technical Specs",
      "Weight (grams)",
      "Shipping Tag",
    ];

    const sampleRows = [
      [
        "Arduino UNO R3 DIP Development Board",
        "ARD-UNO-R3-DIP",
        "Prayog India",
        "Arduino & Microcontrollers",
        "Development Boards",
        "599",
        "899",
        "50",
        "18",
        "The standard Arduino Uno R3 board powered by ATmega328P with removable DIP socket.",
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "Arduino UNO R3 DIP - Buy Online at Best Price | Prayog India",
        "Buy authentic Arduino Uno R3 DIP development board with ATmega328P. Fast dispatch across India.",
        "arduino-uno-r3-dip",
        "arduino, uno r3, atmega328p, robotics board, buy online",
        "https://www.prayogindia.com/products/arduino-uno-r3-dip",
        "16 MHz Quartz Crystal | 14 Digital I/O Pins | 6 Analog Inputs",
        "STEM Education | Robotics Prototyping | IoT Automation",
        "1x Arduino UNO R3 Board | 1x USB Cable Type-B",
        "Microcontroller: ATmega328P; Operating Voltage: 5V; Flash Memory: 32 KB",
        "180",
        "Standard Product",
      ],
      [
        "ESP32 Wi-Fi + Bluetooth Dual Core Module",
        "ESP32-WROOM-32D",
        "Prayog India",
        "Development Boards",
        "ESP32 / ESP8266",
        "349",
        "549",
        "120",
        "18",
        "Powerful 240MHz dual-core Xtensa microcontroller with integrated 2.4GHz Wi-Fi and Bluetooth 4.2 BLE.",
        "https://images.unsplash.com/photo-1608755728617-aefab37d45f6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1608755728617-aefab37d45f6?auto=format&fit=crop&w=800&q=80",
        "",
        "ESP32 Wi-Fi Bluetooth Dev Board - Buy Online | Prayog India",
        "ESP32 development module with Wi-Fi and Bluetooth for smart home and IoT engineering projects.",
        "esp32-wifi-bluetooth-dev-board",
        "esp32, wifi, bluetooth, iot module, prayog india",
        "https://www.prayogindia.com/products/esp32-wifi-bluetooth-dev-board",
        "Dual-core 240MHz CPU | Ultra-low power co-processor | Ultra-fast WiFi & BLE",
        "IoT Devices | Home Automation | Wireless Sensor Networks",
        "1x ESP32 NodeMCU Dev Board",
        "Operating Voltage: 3.3V; Clock Speed: 240MHz; SRAM: 520 KB",
        "60",
        "Standard Product",
      ],
      [
        "L298N Dual H-Bridge DC Stepper Motor Driver",
        "MOT-DRV-L298N",
        "Prayog India",
        "Electronic Components",
        "Motors & Drivers",
        "189",
        "299",
        "85",
        "18",
        "High power dual H-bridge motor driver module capable of driving two DC motors or one 4-wire stepper motor.",
        "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=800&q=80",
        "",
        "L298N Motor Driver Module - Buy Online | Prayog India",
        "Heavy duty L298N motor driver module with large heat sink for robotics and smart car chassis.",
        "l298n-motor-driver-module",
        "l298n, motor driver, h-bridge, dc motor driver, arduino robot",
        "https://www.prayogindia.com/products/l298n-motor-driver-module",
        "Dual H-Bridge Driver | Large Heatsink | Up to 2A per channel",
        "Robotic Vehicles | Smart Cars | Stepper Motor Drives",
        "1x L298N Motor Driver Board with Heatsink",
        "Driver Chip: L298N; Logic Voltage: 5V; Drive Voltage: 5V-35V; Peak Current: 2A",
        "110",
        "Standard Product",
      ],
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCsv).join(","),
        ...sampleRows.map((r) => r.map(escapeCsv).join(",")),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "prayog_product_import_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    if (importParsedRows.length === 0) return;
    setIsImporting(true);
    setImportProgress(25);

    try {
      setImportProgress(45);
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: importParsedRows,
          updateExisting: importUpdateExisting,
        }),
      });

      setImportProgress(85);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Bulk import failed.");
      }

      setImportProgress(100);
      setImportSummary({
        created: json.createdCount ?? 0,
        updated: json.updatedCount ?? 0,
        total: (json.createdCount ?? 0) + (json.updatedCount ?? 0),
        errors: Array.isArray(json.errors) ? json.errors : [],
      });

      refreshProductList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error importing products";
      alert(`❌ Import Failed: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Categories list from Hierarchy
  const flatCategories = React.useMemo(() => {
    return flattenCategories(CATEGORIES_HIERARCHY);
  }, []);

  // Form Fields - Basic
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newBrand, setNewBrand] = useState("Prayog India");
  const [newCategory, setNewCategory] = useState("Electronic Components");
  const [newSubcategory, setNewSubcategory] = useState("Resistors");

  // Dynamic available subcategories derived from selected category
  const availableSubcategories = React.useMemo(() => {
    // 1. Try finding in CATEGORIES_HIERARCHY
    const cleanCat = newCategory.trim().toLowerCase();
    const hierarchyMatch = CATEGORIES_HIERARCHY.find(
      (c) =>
        c.name.toLowerCase() === cleanCat ||
        c.slug.toLowerCase() === cleanCat ||
        cleanCat.includes(c.name.toLowerCase()),
    );
    if (hierarchyMatch && hierarchyMatch.children && hierarchyMatch.children.length > 0) {
      return hierarchyMatch.children.map((child) => child.name);
    }

    // 2. Try finding in CATEGORIES_DATA
    const dataMatch = CATEGORIES_DATA.find(
      (c) =>
        c.name.toLowerCase() === cleanCat ||
        c.slug.toLowerCase() === cleanCat ||
        cleanCat.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(cleanCat),
    );
    if (dataMatch && dataMatch.subcategories && dataMatch.subcategories.length > 0) {
      return dataMatch.subcategories.map((sub) => sub.name);
    }

    // 3. Fallback standard list for generic categories
    if (cleanCat.includes("electronic") || cleanCat.includes("component")) {
      return ["Resistors", "Capacitors", "ICs", "LEDs", "Relays", "Connectors", "Diodes", "Switches"];
    }
    if (cleanCat.includes("robot")) {
      return ["Robot Kits", "Motors & Drivers", "Wheels & Chassis", "Robotics Accessories", "Controllers"];
    }
    if (cleanCat.includes("dev") || cleanCat.includes("arduino") || cleanCat.includes("board")) {
      return ["Arduino", "Raspberry Pi", "ESP32 / ESP8266", "ARM Cortex", "Other Development Boards"];
    }
    if (cleanCat.includes("drone") || cleanCat.includes("uav")) {
      return ["Flight Controllers", "Motors", "ESC", "GPS Modules", "Propellers", "Batteries", "Cameras", "Frames"];
    }
    if (cleanCat.includes("sensor") || cleanCat.includes("iot")) {
      return ["Sensors & Modules", "IoT Products", "Wireless Transceivers", "Environmental Sensors", "Motion Sensors"];
    }
    if (cleanCat.includes("power") || cleanCat.includes("battery")) {
      return ["LiPo Batteries", "18650 Cells", "Power Supplies", "Chargers & BMS", "Solar Modules"];
    }
    if (cleanCat.includes("stem") || cleanCat.includes("edu")) {
      return ["STEM Kits", "Educational Kits", "Educational Toys", "Project Kits", "ATL Packages"];
    }

    return ["General", "Accessories", "Components", "Modules"];
  }, [newCategory]);
  const [newPrice, setNewPrice] = useState("");
  const [newMrp, setNewMrp] = useState("");
  const [newGstPercent, setNewGstPercent] = useState("18");
  const [newStock, setNewStock] = useState("25");
  const [newDescription, setNewDescription] = useState("");

  // Form Fields - Media (Images & Videos)
  const [mediaList, setMediaList] = useState<UploadedMediaItem[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields - Rich Details (Shown on Frontend)
  const [featuresList, setFeaturesList] = useState<string[]>([
    "High-speed 32-bit core microcontroller",
    "Onboard USB-C interface & voltage regulators",
  ]);
  const [featureInput, setFeatureInput] = useState("");

  const [applicationsList, setApplicationsList] = useState<string[]>([
    "Robotics",
    "STEM Education",
    "IoT Smart Devices",
  ]);
  const [appInput, setAppInput] = useState("");

  const [includedList, setIncludedList] = useState<string[]>([
    "1x Hardware Board Module",
    "1x Quickstart Pinout Guide",
  ]);
  const [includedInput, setIncludedInput] = useState("");

  const [specsRows, setSpecsRows] = useState<
    Array<{ key: string; val: string }>
  >([
    { key: "Operating Voltage", val: "5V DC" },
    { key: "Input Voltage (Limits)", val: "6-20V" },
    { key: "Clock Speed", val: "16 MHz" },
  ]);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  // Physical & Freight Attributes
  const [weightGrams, setWeightGrams] = useState("250");
  const [dimLength, setDimLength] = useState("15");
  const [dimWidth, setDimWidth] = useState("10");
  const [dimHeight, setDimHeight] = useState("5");

  // Freight Modes Checklist
  const [airFreightAllowed, setAirFreightAllowed] = useState(true);
  const [surfaceFreightAllowed, setSurfaceFreightAllowed] = useState(true);
  const [localPickupAllowed, setLocalPickupAllowed] = useState(true);

  // Shipping Tags Classification
  const [shippingTag, setShippingTag] =
    useState<ShippingTagType>("Standard Product");
  const [isHazardousItem, setIsHazardousItem] = useState(false);
  const [isBatteryProduct, setIsBatteryProduct] = useState(false);
  const [isFragileItem, setIsFragileItem] = useState(false);
  const [isDangerousGoods, setIsDangerousGoods] = useState(false);

  // Form Fields - SEO & Search Optimization
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoSlug, setSeoSlug] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([
    "arduino",
    "robotics india",
    "stem hardware",
    "buy online",
  ]);
  const [keywordInput, setKeywordInput] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");
  const [seoIndexFollow, setSeoIndexFollow] = useState(true);
  const [seoStructuredType, setSeoStructuredType] = useState("Product");
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState("");
  const [serpPreviewDevice, setSerpPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate Real-time SEO Readiness Score (0-100)
  const seoScore = useMemo(() => {
    let score = 0;
    const effectiveTitle = (seoTitle || newName).trim();
    if (effectiveTitle.length >= 30 && effectiveTitle.length <= 65) score += 25;
    else if (effectiveTitle.length > 0) score += 12;

    const effectiveDesc = (seoDescription || newDescription).trim();
    if (effectiveDesc.length >= 80 && effectiveDesc.length <= 170) score += 25;
    else if (effectiveDesc.length > 0) score += 12;

    const effectiveSlug = (seoSlug || newName).trim();
    if (effectiveSlug && /^[a-z0-9-]+$/.test(effectiveSlug.toLowerCase())) score += 20;
    else if (effectiveSlug) score += 10;

    if (seoKeywords.length >= 3) score += 15;
    else if (seoKeywords.length > 0) score += 8;

    if (seoOgImage || mediaList.length > 0) score += 15;

    return Math.min(100, score);
  }, [seoTitle, newName, seoDescription, newDescription, seoSlug, seoKeywords, seoOgImage, mediaList]);

  // AI / Smart Auto-Generate SEO assistant
  const handleAutoGenerateSEO = () => {
    const brandStr = newBrand.trim() || "Prayog India";
    const nameStr = newName.trim() || "Robotics Hardware Component";
    const baseTitle = `${nameStr} - Buy Online at Best Price | ${brandStr}`;

    let generatedDesc = "";
    if (newDescription.trim()) {
      generatedDesc =
        newDescription.trim().length > 155
          ? newDescription.trim().slice(0, 152) + "..."
          : newDescription.trim();
    } else {
      generatedDesc = `Buy genuine ${nameStr} by ${brandStr} online in India. Best price with fast express delivery, official warranty & STEM project support.`;
    }

    const autoSlug = (newName.trim() || "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newKws: string[] = [
      "prayog india",
      brandStr.toLowerCase(),
      newCategory.toLowerCase(),
      "buy online india",
      "stem kit",
      "robotics components",
    ];

    if (newName.trim()) {
      newKws.unshift(newName.trim().toLowerCase());
    }
    if (newSubcategory.trim()) {
      newKws.push(newSubcategory.trim().toLowerCase());
    }

    const uniqueKws = Array.from(new Set(newKws.filter(Boolean))).slice(0, 8);

    setSeoTitle(baseTitle.slice(0, 65));
    setSeoDescription(generatedDesc);
    setSeoSlug(autoSlug);
    setSeoKeywords(uniqueKws);
    if (!seoOgImage && mediaList.length > 0) {
      setSeoOgImage(mediaList[0].url);
    }
    if (!seoCanonicalUrl) {
      setSeoCanonicalUrl(`https://www.prayogindia.com/products/${autoSlug}`);
    }
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !seoKeywords.includes(kw)) {
      setSeoKeywords([...seoKeywords, kw]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (idx: number) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== idx));
  };

  const refreshProductList = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products?limit=50");
      const json = await res.json();
      if (json.success && json.data?.items?.length > 0) {
        setProducts(json.data.items);
      }
    } catch {
      // Keep mock fallback
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      try {
        const res = await fetch("/api/admin/products?limit=50");
        const json = await res.json();
        if (!ignore && json.success && json.data?.items?.length > 0) {
          setProducts(json.data.items);
        }
      } catch {
        // Keep mock fallback
      }
    }
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const handleShippingTagChange = (tag: ShippingTagType) => {
    setShippingTag(tag);
    if (tag === "Battery Product") {
      setIsBatteryProduct(true);
      setAirFreightAllowed(false);
      setSurfaceFreightAllowed(true);
    } else if (tag === "Fragile Product") {
      setIsFragileItem(true);
    } else if (tag === "Heavy Product" || tag === "Oversized Product") {
      setSurfaceFreightAllowed(true);
    } else {
      setIsBatteryProduct(false);
      setIsHazardousItem(false);
      setIsDangerousGoods(false);
      setAirFreightAllowed(true);
    }
  };

  const handleBatteryToggle = (checked: boolean) => {
    setIsBatteryProduct(checked);
    if (checked) {
      setShippingTag("Battery Product");
      setAirFreightAllowed(false);
      setSurfaceFreightAllowed(true);
    } else {
      setShippingTag("Standard Product");
      setAirFreightAllowed(true);
    }
  };

  // Handle Multi-file upload to Cloudinary CDN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setUploadError("");

    try {
      const formData = new FormData();

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          // Pre-compress image client-side to save bandwidth & time
          const compression = await compressImageOnClient(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.82,
            preferredMimeType: "image/webp",
          });
          formData.append("files", compression.file);
        } else {
          formData.append("files", file);
        }
      }
      formData.append("folder", "products");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.message || "Failed to upload files to Cloudinary.",
        );
      }

      const rawItems = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.items)
          ? json.items
          : json.data
            ? [json.data]
            : [];

      const newMedia: UploadedMediaItem[] = (
        rawItems as (UploadedMediaItem & {
          originalBytes?: number;
          savingsPercentage?: number;
        })[]
      ).map((item) => ({
        name: item.name,
        type: item.type,
        url: item.url,
        publicId: item.publicId,
        bytes: item.bytes,
        originalBytes: item.originalBytes,
        savingsPercentage: item.savingsPercentage,
      }));

      setMediaList((prev) => [...prev, ...newMedia]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading files";
      setUploadError(msg);
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove uploaded media
  const handleRemoveMedia = (idx: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add Feature
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  // Add Application
  const handleAddApp = () => {
    if (appInput.trim()) {
      setApplicationsList([...applicationsList, appInput.trim()]);
      setAppInput("");
    }
  };

  // Add What's Included
  const handleAddIncluded = () => {
    if (includedInput.trim()) {
      setIncludedList([...includedList, includedInput.trim()]);
      setIncludedInput("");
    }
  };

  // Add Spec Row
  const handleAddSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecsRows([
        ...specsRows,
        { key: specKey.trim(), val: specVal.trim() },
      ]);
      setSpecKey("");
      setSpecVal("");
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingProduct(null);
    setNewName("");
    setNewSku("");
    setNewBrand("Prayog India");
    setNewCategory("Arduino & Microcontrollers");
    setNewSubcategory("Development Boards");
    setNewPrice("");
    setNewMrp("");
    setNewGstPercent("18");
    setNewStock("25");
    setNewDescription("");
    setMediaList([]);
    setVideoUrlInput("");
    setFeaturesList([
      "High-speed 32-bit core microcontroller",
      "Onboard USB-C interface & voltage regulators",
    ]);
    setApplicationsList(["Robotics", "STEM Education", "IoT Smart Devices"]);
    setIncludedList(["1x Hardware Board Module", "1x Quickstart Pinout Guide"]);
    setSpecsRows([
      { key: "Operating Voltage", val: "5V DC" },
      { key: "Input Voltage (Limits)", val: "6-20V" },
      { key: "Clock Speed", val: "16 MHz" },
    ]);
    setWeightGrams("250");
    setDimLength("15");
    setDimWidth("10");
    setDimHeight("5");
    setShippingTag("Standard Product");
    setIsBatteryProduct(false);
    setIsFragileItem(false);
    setIsHazardousItem(false);
    setIsDangerousGoods(false);
    setAirFreightAllowed(true);
    setSurfaceFreightAllowed(true);
    setLocalPickupAllowed(true);

    // Reset SEO Settings
    setSeoTitle("");
    setSeoDescription("");
    setSeoSlug("");
    setSeoKeywords(["arduino", "robotics india", "stem kit", "buy online"]);
    setKeywordInput("");
    setSeoOgImage("");
    setSeoIndexFollow(true);
    setSeoStructuredType("Product");
    setSeoCanonicalUrl("");
    setSerpPreviewDevice("desktop");

    setActiveTab("general");
    setShowCreateModal(true);
  };

  // Open Edit Modal with Pre-populated Product Data
  const handleOpenEdit = (p: ProductItemRow) => {
    setModalMode("edit");
    setEditingProduct(p);
    setNewName(p.name || "");
    setNewSku(p.sku || "");
    setNewBrand(p.brand || "Prayog India");

    const catName =
      typeof p.category === "object" && p.category !== null
        ? p.category.name
        : p.category || p.categoryName || "Arduino & Microcontrollers";
    setNewCategory(catName);
    setNewSubcategory(p.subcategory || "");
    setNewPrice(String(p.price ?? ""));
    setNewMrp(String(p.mrp ?? (p.price ? Math.round(p.price * 1.3) : "")));
    setNewGstPercent(String(p.gstPercent ?? "18"));
    setNewStock(String(p.stock ?? 25));
    setNewDescription(p.description || "");

    // Media
    const loadedMedia: UploadedMediaItem[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      p.images.forEach((img, idx) => {
        const url = typeof img === "string" ? img : img.imageUrl;
        if (url) {
          loadedMedia.push({
            name: `Image ${idx + 1}`,
            type: "image",
            url,
          });
        }
      });
    } else if (p.image) {
      loadedMedia.push({
        name: "Primary Image",
        type: "image",
        url: p.image,
      });
    }
    setMediaList(loadedMedia);
    setVideoUrlInput(p.videoUrl || "");

    // Features, applications, included
    setFeaturesList(p.features && p.features.length > 0 ? [...p.features] : []);
    setApplicationsList(
      p.applications && p.applications.length > 0 ? [...p.applications] : [],
    );
    setIncludedList(
      p.whatsIncluded && p.whatsIncluded.length > 0 ? [...p.whatsIncluded] : [],
    );

    // Specs
    const rawSpecs = p.specs && typeof p.specs === "object" ? p.specs : {};
    const rawSeo = (rawSpecs as Record<string, unknown>)._seo as Record<string, unknown> | undefined;

    if (rawSpecs && typeof rawSpecs === "object") {
      setSpecsRows(
        Object.entries(rawSpecs)
          .filter(([key]) => key !== "_seo")
          .map(([key, val]) => ({
            key,
            val: String(val),
          })),
      );
    } else {
      setSpecsRows([]);
    }

    // Weight & Dims
    setWeightGrams(String(p.weightGrams ?? 250));
    setDimLength(String(p.dimensionsCm?.length ?? 15));
    setDimWidth(String(p.dimensionsCm?.width ?? 10));
    setDimHeight(String(p.dimensionsCm?.height ?? 5));

    // Shipping tag
    const tag = (p.shippingTag as ShippingTagType) || "Standard Product";
    setShippingTag(tag);
    setIsBatteryProduct(
      tag === "Battery Product" || (tag as string) === "Battery",
    );
    setIsFragileItem(
      tag === "Fragile Product" || (tag as string) === "Fragile",
    );
    setIsHazardousItem(false);
    setIsDangerousGoods(false);
    setAirFreightAllowed(
      !(tag === "Battery Product" || (tag as string) === "Battery"),
    );
    setSurfaceFreightAllowed(true);
    setLocalPickupAllowed(true);

    // Pre-populate SEO Settings from Product or _seo json
    setSeoTitle(p.metaTitle || (rawSeo?.metaTitle as string) || "");
    setSeoDescription(p.metaDescription || (rawSeo?.metaDescription as string) || "");
    setSeoSlug(p.seoSlug || p.slug || "");
    setSeoKeywords(
      Array.isArray(p.metaKeywords) && p.metaKeywords.length > 0
        ? [...p.metaKeywords]
        : Array.isArray(rawSeo?.metaKeywords) && (rawSeo.metaKeywords as string[]).length > 0
          ? [...(rawSeo.metaKeywords as string[])]
          : ["prayog india", p.brand || "hardware", (p.name || "").toLowerCase().slice(0, 20)]
    );
    setKeywordInput("");
    setSeoOgImage(p.ogImage || (rawSeo?.ogImage as string) || (loadedMedia[0]?.url || ""));
    setSeoIndexFollow(
      typeof p.indexFollow === "boolean"
        ? p.indexFollow
        : typeof rawSeo?.indexFollow === "boolean"
          ? (rawSeo.indexFollow as boolean)
          : true
    );
    setSeoStructuredType(
      p.structuredDataType || (rawSeo?.structuredDataType as string) || "Product"
    );
    setSeoCanonicalUrl(
      p.canonicalUrl || (rawSeo?.canonicalUrl as string) || `https://www.prayogindia.com/products/${p.slug || ""}`
    );
    setSerpPreviewDevice("desktop");

    setActiveTab("general");
    setShowCreateModal(true);
  };

  // Submit Product (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newSku) {
      alert("Please fill in the Product Name, SKU, and Price.");
      return;
    }

    setIsSubmitting(true);

    const imageUrls = mediaList
      .filter((m) => m.type === "image")
      .map((m) => m.url);
    const uploadedVideo = mediaList.find((m) => m.type === "video")?.url;
    const finalVideoUrl = videoUrlInput.trim() || uploadedVideo || "";

    const specsObj: Record<string, string> = {};
    specsRows.forEach((r) => {
      if (r.key.trim()) specsObj[r.key.trim()] = r.val.trim();
    });

    const parsedPrice = parseFloat(newPrice);
    const parsedMrp = newMrp
      ? parseFloat(newMrp)
      : Math.round(parsedPrice * 1.3);
    const parsedStock = parseInt(newStock, 10) || 0;

    const finalSlug = (seoSlug.trim() || newName.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const payload = {
      name: newName.trim(),
      sku: newSku.toUpperCase().trim(),
      brand: newBrand.trim(),
      categoryName: newCategory,
      subcategory: newSubcategory.trim(),
      price: parsedPrice,
      mrp: parsedMrp,
      gstPercent: parseInt(newGstPercent, 10),
      stock: parsedStock,
      inStock: parsedStock > 0,
      description: newDescription.trim(),
      images: imageUrls,
      videoUrl: finalVideoUrl,
      features: featuresList,
      applications: applicationsList,
      whatsIncluded: includedList,
      specs: specsObj,
      weightGrams: parseInt(weightGrams, 10) || 250,
      dimensionsCm: {
        length: parseFloat(dimLength) || 15,
        width: parseFloat(dimWidth) || 10,
        height: parseFloat(dimHeight) || 5,
      },
      shippingTag,
      airFreightAllowed,
      surfaceFreightAllowed,
      localPickupAllowed,
      isHazardousItem,
      isBatteryProduct,
      isFragileItem,
      isDangerousGoods,
      // SEO & Structured Data fields
      metaTitle:
        seoTitle.trim() ||
        `${newName.trim()} - Buy Online at Best Price | ${newBrand.trim() || "Prayog India"}`,
      metaDescription:
        seoDescription.trim() || newDescription.trim().slice(0, 160),
      metaKeywords: seoKeywords,
      canonicalUrl:
        seoCanonicalUrl.trim() ||
        `https://www.prayogindia.com/products/${finalSlug}`,
      ogImage: seoOgImage.trim() || imageUrls[0] || "",
      indexFollow: seoIndexFollow,
      structuredDataType: seoStructuredType,
      seoSlug: finalSlug,
    };

    try {
      if (modalMode === "edit" && editingProduct) {
        const targetId =
          editingProduct.id || editingProduct.slug || editingProduct.sku;
        const res = await fetch(`/api/admin/products/${targetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to update product.");
        }

        // Update local state directly so table updates instantly
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id || item.sku === editingProduct.sku
              ? {
                  ...item,
                  ...payload,
                  category: newCategory,
                  image: imageUrls[0] || item.image,
                }
              : item,
          ),
        );

        alert(`✅ Product "${newName}" updated successfully with SEO settings!`);
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to create product.");
        }

        alert(
          `✅ Product "${newName}" published and SEO indexed successfully!`,
        );
        refreshProductList();
      }

      setShowCreateModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving product.";
      alert(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("ALL");

  const getProductCategory = (p: ProductItemRow): string => {
    if (typeof p.category === "object" && p.category?.name)
      return p.category.name;
    if (typeof p.category === "string" && p.category) return p.category;
    if (p.categoryName) return p.categoryName;
    return "Uncategorized";
  };

  const availableCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = getProductCategory(p);
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return Array.from(catMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [products]);

  const toggleSelectAll = () => {
    if (
      filteredProducts.length > 0 &&
      selectedProductIds.length === filteredProducts.length
    ) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pCat = getProductCategory(p);
      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        pCat.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        pCat.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
          ? p.inStock !== false && (p.stock === undefined || p.stock > 0)
          : statusFilter === "Drafts"
          ? !p.sku || p.name.toLowerCase().includes("draft")
          : p.inStock === false || p.stock === 0;

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedCategoryFilter, statusFilter]);

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300 bg-[#F9FAFB]/50 min-h-screen">
      {/* 1. Header (Image 1 Exact Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage inventory, pricing and availability across your store
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setImportFile(null);
              setImportParsedRows([]);
              setImportError("");
              setImportSummary(null);
              setImportProgress(0);
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportProducts}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Image 1 Exact Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PRODUCTS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL PRODUCTS
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
            {products.length > 50 ? products.length.toLocaleString() : "1,248"}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-1 border-t border-slate-50">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              +4.2%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">
              Last 7 days
            </span>
          </div>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL REVENUE
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
            ₹84,320
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-1 border-t border-slate-50">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.5%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">
              Last 7 days
            </span>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL ORDERS
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
            142
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-1 border-t border-slate-50">
            <span className="inline-flex items-center gap-0.5 text-rose-500 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              -1.4%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">
              Last 7 days
            </span>
          </div>
        </div>

        {/* CUSTOMERS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                CUSTOMERS
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
            3,240
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-1 border-t border-slate-50">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              +2.1%
            </span>
            <span className="text-slate-400 text-[11px] font-medium">
              Last 7 days
            </span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar (Image 1 Exact Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Search, Filter, View Toggles */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or ID"
              className="w-full bg-white border border-slate-200/90 pl-10 pr-8 py-2 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 pl-8 pr-7 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-[#2563EB] cursor-pointer shadow-2xs transition-all"
            >
              <option value="ALL">Filter</option>
              {availableCategories.map(([catName, count]) => (
                <option key={catName} value={catName}>
                  {catName} ({count})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-100 text-[#2563EB]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-slate-100 text-[#2563EB]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Status Tabs (All | Active | Drafts | Archived) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 shrink-0 self-start lg:self-auto">
          {(["All", "Active", "Drafts", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products Table matching Image 1 */}
      {viewMode === "list" ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] bg-white">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold">ID &amp; Create Date</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const imgUrl =
                    p.images && p.images.length > 0
                      ? typeof p.images[0] === "string"
                        ? p.images[0]
                        : p.images[0]?.imageUrl
                      : p.image ||
                        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=120&q=80";

                  const categoryName =
                    typeof p.category === "object"
                      ? p.category?.name
                      : p.category || "General";

                  const displayId = p.sku ? `#${p.sku}` : `#PRG-${p.id.slice(0, 8)}`;
                  const displayDate = "Jan 01, 2024";

                  const isOutOfStock = p.stock === 0;
                  const isInactive = p.inStock === false;
                  const isDraft = !p.sku || p.name.toLowerCase().includes("draft");

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F9F0] text-[#00A854] border border-[#B3F0D0]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A854]" />
                      Published
                    </span>
                  );

                  if (isOutOfStock) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF5E7] text-[#FA8C16] border border-[#FFE7BA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FA8C16]" />
                        out Stock
                      </span>
                    );
                  } else if (isInactive) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDECEC] text-[#E02020] border border-[#F9BDBD]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
                        Inactive
                      </span>
                    );
                  } else if (isDraft) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5F5F5] text-[#595959] border border-[#D9D9D9]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#595959]" />
                        Draft
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden relative shrink-0">
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-xs hover:text-[#2563EB] transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium truncate">
                              {categoryName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-slate-800 text-xs">
                          {displayId}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {displayDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          ₹{p.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Sell Price ₹{(p.mrp || p.price * 1.05).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700 text-xs">
                        {(p.stock ?? 25).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">{statusBadge}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-[#2563EB] hover:bg-blue-50/60 rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <a
                            href={`/products/${p.slug || p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                          >
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            const imgUrl =
              p.images && p.images.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : p.images[0]?.imageUrl
                : p.image ||
                  "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=120&q=80";

            const categoryName =
              typeof p.category === "object"
                ? p.category?.name
                : p.category || "General";

            return (
              <div
                key={p.id}
                className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
                  isSelected ? "border-[#2563EB] ring-1 ring-[#2563EB]" : "border-slate-200/90"
                }`}
              >
                <div>
                  <div className="w-full aspect-square rounded-xl bg-slate-100 overflow-hidden relative mb-3 border border-slate-100">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectProduct(p.id)}
                      className="absolute top-2.5 left-2.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {categoryName}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 mt-0.5">
                    {p.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {p.sku ? `#${p.sku}` : `#PRG-${p.id.slice(0, 6)}`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      ₹{p.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Stock: {(p.stock ?? 25).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`/products/${p.slug || p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Comprehensive Product Modal (Create & Edit) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-5">
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 sm:px-7 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                  {modalMode === "edit" ? (
                    <Edit3 className="w-5 h-5 text-[#00AEEF]" />
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                      {modalMode === "edit"
                        ? "Edit Product Details"
                        : "Add New Product"}
                    </h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                      {modalMode === "edit" && editingProduct
                        ? `SKU: ${editingProduct.sku}`
                        : "Catalog Master"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {modalMode === "edit"
                      ? "Update pricing, description, rich specifications, media assets, and shipping parameters."
                      : "Configure general details, media assets, specifications, and shipping configuration."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper / Segmented Navigation Tabs */}
            <div className="px-6 pt-3 pb-3 sm:px-7 bg-slate-50/70 border-b border-slate-200/70 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`py-2 px-3 text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "general"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeTab === "general"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    1
                  </span>
                  <span>General &amp; Price</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className={`py-2 px-3 text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "media"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeTab === "media"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    2
                  </span>
                  <span>Media ({mediaList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`py-2 px-3 text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "specs"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeTab === "specs"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    3
                  </span>
                  <span>Specs &amp; Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`py-2 px-3 text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "shipping"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeTab === "shipping"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    4
                  </span>
                  <span>Shipping &amp; Safety</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`py-2 px-3 text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "seo"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeTab === "seo"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    5
                  </span>
                  <span>SEO &amp; Search</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
                {/* TAB 1: GENERAL & CATEGORY */}
                {activeTab === "general" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    {/* Name & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Product Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Arduino UNO R4 WiFi Official Board (Renesas RA4M1)"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          SKU (Stock Keeping Unit){" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newSku}
                          onChange={(e) =>
                            setNewSku(e.target.value.toUpperCase())
                          }
                          placeholder="PRG-ARD-R4W"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Brand & Category Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          placeholder="e.g. Prayog India / Arduino"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => {
                            const selectedCat = e.target.value;
                            setNewCategory(selectedCat);
                            // Auto select first available subcategory when category changes
                            const cleanCat = selectedCat.trim().toLowerCase();
                            const hierarchyMatch = CATEGORIES_HIERARCHY.find(
                              (c) =>
                                c.name.toLowerCase() === cleanCat ||
                                c.slug.toLowerCase() === cleanCat ||
                                cleanCat.includes(c.name.toLowerCase()),
                            );
                            if (hierarchyMatch && hierarchyMatch.children && hierarchyMatch.children.length > 0) {
                              setNewSubcategory(hierarchyMatch.children[0].name);
                            } else {
                              const dataMatch = CATEGORIES_DATA.find(
                                (c) =>
                                  c.name.toLowerCase() === cleanCat ||
                                  c.slug.toLowerCase() === cleanCat ||
                                  cleanCat.includes(c.name.toLowerCase()) ||
                                  c.name.toLowerCase().includes(cleanCat),
                              );
                              if (dataMatch && dataMatch.subcategories && dataMatch.subcategories.length > 0) {
                                setNewSubcategory(dataMatch.subcategories[0].name);
                              }
                            }
                          }}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                          {flatCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {"\u00A0\u00A0".repeat(cat.level)}
                              {cat.level > 0 ? "↳ " : ""}
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Subcategory / Tag
                        </label>
                        <select
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                          {availableSubcategories.map((subName) => (
                            <option key={subName} value={subName}>
                              {subName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price, MRP, GST & Initial Stock */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Selling Price <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            required
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="2499"
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          MRP
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={newMrp}
                            onChange={(e) => setNewMrp(e.target.value)}
                            placeholder={
                              newPrice
                                ? String(Math.round(parseFloat(newPrice) * 1.3))
                                : "3299"
                            }
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          GST Rate
                        </label>
                        <select
                          value={newGstPercent}
                          onChange={(e) => setNewGstPercent(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                          <option value="18">18% (Electronics)</option>
                          <option value="12">12% (STEM Kits)</option>
                          <option value="5">5% (Components)</option>
                          <option value="28">28% (Luxury)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Initial Stock
                        </label>
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          placeholder="25"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Product Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Product Overview / Description{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Publicly visible on store page
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Comprehensive hardware description, primary use-cases, and unique selling points..."
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: MULTIPLE IMAGES & VIDEO */}
                {activeTab === "media" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 hover:border-blue-400 p-7 rounded-2xl text-center space-y-3 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          Upload Product Images &amp; Video
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          High-resolution PNG, JPG, WEBP or MP4 video (Max
                          25MB). Auto-optimized on Cloudinary CDN.
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="product-media-upload"
                      />

                      <div className="pt-1">
                        <label
                          htmlFor="product-media-upload"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow-sm active:scale-98 transition-all"
                        >
                          {isUploadingMedia ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Uploading to Cloudinary...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Select Media Files</span>
                            </>
                          )}
                        </label>
                      </div>

                      {uploadError && (
                        <p className="text-rose-600 font-medium text-xs pt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>

                    {/* Video URL Input */}
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>
                          Product Video URL (Cloudinary / YouTube / Direct MP4)
                        </span>
                      </label>
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://res.cloudinary.com/fyueflvh/video/upload/demo.mp4"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 p-2.5 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                      />
                    </div>

                    {/* Uploaded Media Gallery Previews */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 text-xs">
                          Media Gallery ({mediaList.length} items)
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          First image is used as primary card preview
                        </span>
                      </div>

                      {mediaList.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
                          <p className="text-slate-400 text-xs">
                            No media uploaded yet. You can still save and upload
                            images later.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {mediaList.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative group bg-slate-100 border border-slate-200 rounded-xl overflow-hidden aspect-square shadow-2xs"
                            >
                              {item.type === "video" ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-3 text-center">
                                  <Video className="w-8 h-8 text-blue-400 mb-1.5" />
                                  <span className="text-[10px] font-mono line-clamp-1">
                                    {item.name}
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {idx === 0 && item.type === "image" && (
                                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md shadow-xs">
                                  Primary
                                </span>
                              )}

                              {item.type === "image" && (
                                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                                  <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                    <span>⚡ WebP</span>
                                    {item.savingsPercentage ? (
                                      <span>-{item.savingsPercentage}%</span>
                                    ) : null}
                                  </span>
                                  {item.bytes ? (
                                    <span className="bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                                      {Math.round(item.bytes / 1024)} KB
                                    </span>
                                  ) : null}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(idx)}
                                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                aria-label="Remove media"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: FRONTEND SPECS & FEATURES */}
                {activeTab === "specs" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    {/* 1. Key Features List */}
                    <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-800">
                          Key Hardware Features
                        </label>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Shown as bullet points on product page
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddFeature())
                          }
                          placeholder="e.g. Dual-core Xtensa 32-bit LX7 CPU up to 240MHz"
                          className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add Feature
                        </button>
                      </div>

                      {featuresList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {featuresList.map((feat, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{feat}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFeaturesList(
                                    featuresList.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Target Applications */}
                    <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-800">
                          Target Applications
                        </label>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Domain use-cases &amp; project tags
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={appInput}
                          onChange={(e) => setAppInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddApp())
                          }
                          placeholder="e.g. Industrial Automation, Drone Telemetry, Robotics"
                          className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddApp}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add App
                        </button>
                      </div>

                      {applicationsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {applicationsList.map((app, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50/80 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
                            >
                              <span>{app}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setApplicationsList(
                                    applicationsList.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  )
                                }
                                className="text-blue-400 hover:text-rose-600 transition-colors ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. What's Included In Box */}
                    <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-800">
                          What&apos;s Included in Box
                        </label>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Package contents checklist
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={includedInput}
                          onChange={(e) => setIncludedInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddIncluded())
                          }
                          placeholder="e.g. 1x USB-C High Speed Cable (1 Meter)"
                          className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddIncluded}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add Box Item
                        </button>
                      </div>

                      {includedList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {includedList.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-2 shadow-2xs"
                            >
                              <span className="text-slate-400 font-mono text-[10px]">
                                {idx + 1}.
                              </span>
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setIncludedList(
                                    includedList.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4. Technical Specifications Table */}
                    <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-800">
                          Technical Specifications Table
                        </label>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Key-value parameter pairs
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <input
                          type="text"
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                          placeholder="Parameter (e.g. Clock Speed)"
                          className="col-span-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                        <input
                          type="text"
                          value={specVal}
                          onChange={(e) => setSpecVal(e.target.value)}
                          placeholder="Value (e.g. 48 MHz)"
                          className="col-span-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add Row
                        </button>
                      </div>

                      {specsRows.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                                <th className="py-2.5 px-3">Parameter</th>
                                <th className="py-2.5 px-3">Value</th>
                                <th className="py-2.5 px-3 text-right">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {specsRows.map((r, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 text-slate-700 font-medium">
                                    {r.key}
                                  </td>
                                  <td className="py-2 px-3 text-slate-900">
                                    {r.val}
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSpecsRows(
                                          specsRows.filter((_, i) => i !== idx),
                                        )
                                      }
                                      className="text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 ml-auto" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: SHIPPING & LOGISTICS */}
                {activeTab === "shipping" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                        <Boxes className="w-4 h-4 text-blue-600" />
                        <span>Physical Dimensions &amp; Volumetric Weight</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Weight (grams){" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            value={weightGrams}
                            onChange={(e) => setWeightGrams(e.target.value)}
                            placeholder="150"
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Length (cm)
                          </label>
                          <input
                            type="number"
                            value={dimLength}
                            onChange={(e) => setDimLength(e.target.value)}
                            placeholder="10"
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Width (cm)
                          </label>
                          <input
                            type="number"
                            value={dimWidth}
                            onChange={(e) => setDimWidth(e.target.value)}
                            placeholder="6"
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            value={dimHeight}
                            onChange={(e) => setDimHeight(e.target.value)}
                            placeholder="2"
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Shipping Tag */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Shipping Tag Classification
                        </label>
                        <select
                          value={shippingTag}
                          onChange={(e) =>
                            handleShippingTagChange(
                              e.target.value as ShippingTagType,
                            )
                          }
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl p-2.5 text-xs font-medium text-slate-800 shadow-2xs cursor-pointer"
                        >
                          <option value="Standard Product">
                            Standard Product (General Air &amp; Surface)
                          </option>
                          <option value="Battery Product">
                            Battery Product (DGCA Safety Restriction - Surface
                            Only)
                          </option>
                          <option value="Fragile Product">
                            Fragile Product (Bubble Packing Required)
                          </option>
                          <option value="Heavy Product">
                            Heavy Product (Pallet Freight)
                          </option>
                          <option value="Oversized Product">
                            Oversized Product (Surface Only)
                          </option>
                        </select>
                      </div>

                      {/* Freight Modes */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="block text-xs font-semibold text-slate-700 mb-2">
                          Allowed Freight Modes
                        </span>
                        <div className="flex flex-wrap items-center gap-5">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={airFreightAllowed}
                              onChange={(e) =>
                                setAirFreightAllowed(e.target.checked)
                              }
                              disabled={isBatteryProduct || isHazardousItem}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Air Freight</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={surfaceFreightAllowed}
                              onChange={(e) =>
                                setSurfaceFreightAllowed(e.target.checked)
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Surface Freight</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={localPickupAllowed}
                              onChange={(e) =>
                                setLocalPickupAllowed(e.target.checked)
                              }
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Local Store Pickup</span>
                          </label>
                        </div>
                      </div>

                      {/* Additional Dangerous Goods & Safety Flags */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="block text-xs font-semibold text-slate-700 mb-2">
                          Dangerous Goods &amp; Handling Flags
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isBatteryProduct}
                              onChange={(e) =>
                                handleBatteryToggle(e.target.checked)
                              }
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span>Battery Product</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isHazardousItem}
                              onChange={(e) =>
                                setIsHazardousItem(e.target.checked)
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>Hazardous Item</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isFragileItem}
                              onChange={(e) =>
                                setIsFragileItem(e.target.checked)
                              }
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Fragile Item</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isDangerousGoods}
                              onChange={(e) =>
                                setIsDangerousGoods(e.target.checked)
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>Dangerous Goods</span>
                          </label>
                        </div>
                      </div>

                      {isBatteryProduct && (
                        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200/70 p-3 rounded-xl flex items-center gap-2 font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            DGCA Safety Rule: Air cargo disabled automatically
                            for LiPo / battery packs.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: SEO & SEARCH ENGINE OPTIMIZATION */}
                {activeTab === "seo" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left Column: Form Settings (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* Meta Title */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                              <span>Meta Title (Search Heading)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-medium ${
                                  (seoTitle || newName).length >= 40 && (seoTitle || newName).length <= 60
                                    ? "bg-emerald-100 text-emerald-800"
                                    : (seoTitle || newName).length > 60
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {(seoTitle || newName).length} / 60 chars
                              </span>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            placeholder={newName ? `${newName} - Buy Online | Prayog India` : "e.g. Arduino UNO R4 WiFi Official Board - Buy Online in India | Prayog India"}
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-3 focus:ring-purple-500/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                          />
                          <p className="text-[11px] text-slate-500">
                            Recommended: 50-60 characters. Highlight brand, model, and &quot;Buy Online India&quot; for higher search CTR.
                          </p>
                        </div>

                        {/* Meta Description */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>Meta Description (SERP Snippet)</span>
                            </label>
                            <span
                              className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-medium ${
                                (seoDescription || newDescription).length >= 120 && (seoDescription || newDescription).length <= 160
                                  ? "bg-emerald-100 text-emerald-800"
                                  : (seoDescription || newDescription).length > 160
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {(seoDescription || newDescription).length} / 160 chars
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={seoDescription}
                            onChange={(e) => setSeoDescription(e.target.value)}
                            placeholder={newDescription ? newDescription.slice(0, 160) : "Comprehensive search summary mentioning product specs, express dispatch, and warranty..."}
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-3 focus:ring-purple-500/10 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 leading-relaxed transition-all shadow-2xs"
                          />
                          <p className="text-[11px] text-slate-500">
                            Recommended: 130-160 characters. Displayed beneath the clickable link on Google and Bing.
                          </p>
                        </div>

                        {/* Custom URL Slug / Permalink */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Product URL Slug / Permalink</span>
                          </label>
                          <div className="flex items-center rounded-xl bg-white border border-slate-200 focus-within:border-purple-500 focus-within:ring-3 focus-within:ring-purple-500/10 overflow-hidden shadow-2xs">
                            <span className="px-3 py-2 bg-slate-100 text-slate-500 font-mono text-[11px] border-r border-slate-200 select-none whitespace-nowrap">
                              prayogindia.com/products/
                            </span>
                            <input
                              type="text"
                              value={seoSlug}
                              onChange={(e) =>
                                setSeoSlug(
                                  e.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^a-z0-9-]/g, "")
                                )
                              }
                              placeholder={
                                newName
                                  ? newName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                                  : "arduino-uno-r4-wifi"
                              }
                              className="w-full bg-transparent px-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                            />
                            {seoSlug && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `https://www.prayogindia.com/products/${seoSlug}`
                                  );
                                  setCopiedLink(true);
                                  setTimeout(() => setCopiedLink(false), 2000);
                                }}
                                className="px-2.5 py-1.5 mr-1.5 text-[11px] text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Copy full URL"
                              >
                                {copiedLink ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Target Meta Keywords & Tags */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-blue-600" />
                              <span>Search Keywords &amp; Meta Tags ({seoKeywords.length})</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                              Press Enter or Add
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddKeyword();
                                }
                              }}
                              placeholder="e.g. iot board, wifi microcontroller, stem kits india"
                              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-3 focus:ring-purple-500/10 px-3 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={handleAddKeyword}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                            >
                              Add Tag
                            </button>
                          </div>

                          {/* Quick Keyword Suggestions */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                            {[
                              "arduino",
                              "robotics",
                              "microcontroller",
                              "stem education",
                              "diy kits",
                              "sensors",
                              "express shipping",
                            ]
                              .filter((s) => !seoKeywords.includes(s))
                              .map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => setSeoKeywords([...seoKeywords, suggestion])}
                                  className="text-[10px] bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-300 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                >
                                  + {suggestion}
                                </button>
                              ))}
                          </div>

                          {/* Active Keywords Chips */}
                          {seoKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {seoKeywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-50 border border-purple-200 text-purple-900 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                                >
                                  <span>#{kw}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveKeyword(idx)}
                                    className="text-purple-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* OpenGraph & Social Image */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Social Sharing Image URL (OpenGraph / Twitter Card)</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={seoOgImage}
                              onChange={(e) => setSeoOgImage(e.target.value)}
                              placeholder={mediaList[0]?.url || "https://res.cloudinary.com/..."}
                              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-3 focus:ring-purple-500/10 px-3 py-2 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 shadow-2xs"
                            />
                            {mediaList.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSeoOgImage(mediaList[0].url)}
                                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Use 1st Image
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Search Indexing & Schema Type Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                          <div>
                            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                              Schema.org Structured Type
                            </label>
                            <select
                              value={seoStructuredType}
                              onChange={(e) => setSeoStructuredType(e.target.value)}
                              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs cursor-pointer"
                            >
                              <option value="Product">Product (Standard E-Commerce)</option>
                              <option value="IndividualProduct">Individual Product (Single Item)</option>
                              <option value="STEMKit">STEM / Educational Resource</option>
                              <option value="ElectronicComponent">Hardware / Electronic Component</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                              Search Engine Robots Directives
                            </label>
                            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-800 transition-colors">
                              <input
                                type="checkbox"
                                checked={seoIndexFollow}
                                onChange={(e) => setSeoIndexFollow(e.target.checked)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span>Allow Indexing (index, follow)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Live Interactive Previews (5 cols) */}
                      <div className="lg:col-span-5 space-y-4">
                        {/* Google SERP Preview Card */}
                        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                G
                              </div>
                              <h5 className="text-xs font-bold text-slate-800">
                                Google Search Snippet Preview
                              </h5>
                            </div>

                            {/* Device Switcher */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-medium text-slate-600">
                              <button
                                type="button"
                                onClick={() => setSerpPreviewDevice("desktop")}
                                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                                  serpPreviewDevice === "desktop"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "hover:text-slate-900"
                                }`}
                              >
                                <Monitor className="w-3 h-3" />
                                <span>Desktop</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSerpPreviewDevice("mobile")}
                                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                                  serpPreviewDevice === "mobile"
                                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                                    : "hover:text-slate-900"
                                }`}
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>Mobile</span>
                              </button>
                            </div>
                          </div>

                          {/* SERP Mockup */}
                          <div
                            className={`p-3.5 rounded-xl border border-slate-100 bg-[#ffffff] space-y-1.5 transition-all ${
                              serpPreviewDevice === "mobile"
                                ? "max-w-[320px] mx-auto shadow-xs"
                                : "w-full"
                            }`}
                          >
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#202124]">
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black">
                                P
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="font-medium text-slate-800 text-[11px]">
                                  Prayog India
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono line-clamp-1">
                                  https://www.prayogindia.com › products › {seoSlug || (newName ? newName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "item")}
                                </span>
                              </div>
                            </div>

                            {/* Clickable Blue Title */}
                            <h4 className="text-[15px] leading-snug font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-2">
                              {seoTitle || (newName ? `${newName} - Buy Online | Prayog India` : "Product Name - Buy Online at Best Price | Prayog India")}
                            </h4>

                            {/* Rich Snippet Attributes (Price & Stock) */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                              <span className="text-amber-500">★★★★★</span>
                              <span className="text-slate-700 font-semibold">4.9</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-emerald-700 font-semibold">In stock</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-900 font-bold">₹{newPrice || "1,499"}</span>
                            </div>

                            {/* Description snippet */}
                            <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                              {seoDescription || (newDescription ? newDescription.slice(0, 155) : "Buy genuine STEM kits, robotics modules and development boards with superfast courier dispatch across India.")}
                            </p>
                          </div>
                        </div>

                        {/* Social Media Card Preview (OpenGraph) */}
                        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Share2 className="w-4 h-4 text-purple-600" />
                              <h5 className="text-xs font-bold text-slate-800">
                                Social Share Card Preview (WhatsApp / X / FB)
                              </h5>
                            </div>
                            <span className="text-[10px] text-purple-700 bg-purple-50 font-semibold px-2 py-0.5 rounded-md border border-purple-200">
                              OpenGraph
                            </span>
                          </div>

                          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                            {/* Card Image */}
                            <div className="aspect-video bg-slate-900 relative overflow-hidden flex items-center justify-center">
                              {seoOgImage || mediaList[0]?.url ? (
                                <img
                                  src={seoOgImage || mediaList[0]?.url}
                                  alt="Social Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <Package className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                                  <span className="text-[11px] text-slate-400">
                                    Upload an image in Tab 2 or enter URL above
                                  </span>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[9px] font-bold">
                                PRAYOG INDIA
                              </div>
                            </div>

                            {/* Card Text */}
                            <div className="p-3 bg-white space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                                PRAYOGINDIA.COM
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {seoTitle || newName || "Product Name | Prayog India"}
                              </h5>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                                {seoDescription || newDescription || "Genuine robotics & STEM hardware components."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* SEO Best Practice Audit Checklist */}
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>SEO Readiness Checklist</span>
                          </h5>
                          <ul className="space-y-1.5 text-xs">
                            <li className="flex items-center gap-2">
                              {(seoTitle || newName).trim().length >= 30 && (seoTitle || newName).trim().length <= 65 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-slate-700">Meta Title length (30-65 chars)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              {(seoDescription || newDescription).trim().length >= 80 && (seoDescription || newDescription).trim().length <= 170 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-slate-700">Meta Description length (80-170 chars)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              {(seoSlug || newName).trim().length > 0 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-slate-700">Clean, hyphenated URL slug configured</span>
                            </li>
                            <li className="flex items-center gap-2">
                              {seoKeywords.length >= 3 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-slate-700">Target search keyword tags (min 3)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              {seoOgImage || mediaList.length > 0 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-slate-700">High-resolution OpenGraph sharing image</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Bottom Navigation & Action Bar */}
              <div className="px-6 py-4 sm:px-7 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between shrink-0">
                <div>
                  {activeTab === "general" ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "seo") setActiveTab("shipping");
                        else if (activeTab === "shipping") setActiveTab("specs");
                        else if (activeTab === "specs") setActiveTab("media");
                        else if (activeTab === "media") setActiveTab("general");
                      }}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Next Step Button (when not on final SEO step) */}
                  {activeTab !== "seo" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "general") setActiveTab("media");
                        else if (activeTab === "media") setActiveTab("specs");
                        else if (activeTab === "specs")
                          setActiveTab("shipping");
                        else if (activeTab === "shipping")
                          setActiveTab("seo");
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}

                  {/* Primary Publish / Save Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingMedia}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-2 transition-all active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          {modalMode === "edit"
                            ? "Saving Changes..."
                            : "Publishing..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {modalMode === "edit"
                            ? "Save Changes"
                            : "Publish Product"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 5. CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB]">
                  <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Bulk Product Import
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a CSV file to create or update catalog products in bulk
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsvTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  title="Download pre-formatted sample CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sample Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {importSummary ? (
                /* Import Summary Screen */
                <div className="text-center py-6 space-y-5 animate-in fade-in">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Import Process Completed
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your catalog has been updated with the imported CSV data.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Processed
                      </div>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {importSummary.total}
                      </div>
                    </div>
                    <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                        Created
                      </div>
                      <div className="text-xl font-bold text-emerald-700 mt-1">
                        {importSummary.created}
                      </div>
                    </div>
                    <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB]">
                        Updated
                      </div>
                      <div className="text-xl font-bold text-[#2563EB] mt-1">
                        {importSummary.updated}
                      </div>
                    </div>
                  </div>

                  {importSummary.errors.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-left text-xs max-h-40 overflow-y-auto">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Skipped Rows ({importSummary.errors.length})</span>
                      </div>
                      <div className="space-y-1 text-amber-700 text-[11px]">
                        {importSummary.errors.map((err, idx) => (
                          <div key={idx}>
                            • Row {err.row} ({err.name}): {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Upload & Preview Step */
                <>
                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingCsv(true);
                    }}
                    onDragLeave={() => setIsDraggingCsv(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingCsv(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleCsvFileSelected(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => csvFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingCsv
                        ? "border-[#2563EB] bg-blue-50/10 scale-[0.99]"
                        : importFile
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-slate-200/90 hover:border-[#2563EB]/60 hover:bg-slate-50/60"
                    }`}
                  >
                    <input
                      ref={csvFileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCsvFileSelected(e.target.files[0]);
                        }
                      }}
                    />

                    {importFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-900">
                            {importFile.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {(importFile.size / 1024).toFixed(1)} KB • Click to
                            choose another file
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:text-[#2563EB] group-hover:bg-blue-50 transition-colors">
                          <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to upload or drag &amp; drop CSV file
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Standard CSV format with product name, SKU, price,
                            stock, images &amp; SEO
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Notification */}
                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* Parsed Preview Section */}
                  {importParsedRows.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Preview Products
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                            {importParsedRows.length} found
                          </span>
                        </div>

                        {/* Upsert Checkbox */}
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={importUpdateExisting}
                            onChange={(e) =>
                              setImportUpdateExisting(e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 cursor-pointer"
                          />
                          <span>Update existing products if SKU matches</span>
                        </label>
                      </div>

                      {/* Preview Table */}
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200/80">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Name</th>
                              <th className="py-2 px-3">SKU</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3 text-right">Price</th>
                              <th className="py-2 px-3 text-right">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {importParsedRows.slice(0, 5).map((row, idx) => {
                              const rName =
                                row.Name ||
                                row.name ||
                                row["Product Name"] ||
                                "Untitled";
                              const rSku =
                                row.SKU || row.sku || row.id || "Auto-gen";
                              const rCat =
                                row.Category ||
                                row.category ||
                                "Electronic Components";
                              const rPrice =
                                row["Price (INR)"] ||
                                row.Price ||
                                row.price ||
                                "0";
                              const rStock =
                                row.Stock || row.stock || row.quantity || "25";

                              return (
                                <tr
                                  key={idx}
                                  className="hover:bg-slate-50/60 transition-colors"
                                >
                                  <td className="py-2 px-3 text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2 px-3 font-semibold text-slate-800 max-w-[180px] truncate">
                                    {rName}
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-600">
                                    {rSku}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 max-w-[120px] truncate">
                                    {rCat}
                                  </td>
                                  <td className="py-2 px-3 text-right font-semibold text-slate-900">
                                    ₹{rPrice}
                                  </td>
                                  <td className="py-2 px-3 text-right text-slate-600">
                                    {rStock}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {importParsedRows.length > 5 && (
                        <p className="text-[11px] text-slate-400 text-center italic">
                          + {importParsedRows.length - 5} more products ready to
                          import
                        </p>
                      )}
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {isImporting && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-[#2563EB] animate-spin" />
                          <span>Importing catalog...</span>
                        </span>
                        <span>{importProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#2563EB] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              {importSummary ? (
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportSummary(null);
                      setImportFile(null);
                      setImportParsedRows([]);
                    }}
                    className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Done &amp; View Catalog
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsvTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download sample format</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => setShowImportModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isImporting || importParsedRows.length === 0}
                      onClick={handleConfirmImport}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>
                            Import {importParsedRows.length > 0 ? `(${importParsedRows.length})` : ""}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
