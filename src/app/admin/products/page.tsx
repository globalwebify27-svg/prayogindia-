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
  BarChart2,
  Zap,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";
import { ShippingTagType } from "@/data/productShippingConfig";
import {
  CATEGORIES_HIERARCHY,
  flattenCategories,
} from "@/data/categoriesHierarchy";
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

  // Categories list from Hierarchy
  const flatCategories = React.useMemo(() => {
    return flattenCategories(CATEGORIES_HIERARCHY);
  }, []);

  // Form Fields - Basic
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newBrand, setNewBrand] = useState("Prayog India");
  const [newCategory, setNewCategory] = useState("Arduino & Microcontrollers");
  const [newSubcategory, setNewSubcategory] = useState("Development Boards");
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

      const newMedia: UploadedMediaItem[] = (
        json.data as (UploadedMediaItem & {
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
        pCat.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Enterprise Catalog &middot; Central Media Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Products &amp; Master Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Add and edit products with rich frontend specs (Key Features,
            In-Box, Technical Specs) and multi-image / video Cloudinary CDN
            uploads.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 2. Products List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product name, SKU..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-8 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative min-w-[210px]">
              <Filter className="w-3.5 h-3.5 text-[#00AEEF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-8 pr-8 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
              >
                <option value="ALL">All Categories ({products.length})</option>
                {availableCategories.map(([catName, count]) => (
                  <option key={catName} value={catName}>
                    {catName} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(selectedCategoryFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategoryFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset Filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={refreshProductList}
              className="text-xs font-bold text-slate-500 hover:text-[#00AEEF] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredProducts.length} of {products.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Media</th>
                <th className="pb-3 font-black">Product &amp; SKU</th>
                <th className="pb-3 font-black">Category</th>
                <th className="pb-3 font-black">Weight / Dims</th>
                <th className="pb-3 font-black">Shipping Tag</th>
                <th className="pb-3 font-black text-right">Price</th>
                <th className="pb-3 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isBattery =
                  p.shippingTag === "Battery Item" ||
                  p.shippingTag === "Battery Product" ||
                  p.name.toLowerCase().includes("battery") ||
                  p.name.toLowerCase().includes("lipo");

                const imgUrl =
                  p.images && p.images.length > 0
                    ? typeof p.images[0] === "string"
                      ? p.images[0]
                      : p.images[0]?.imageUrl
                    : p.image ||
                      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=120&q=80";

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900 line-clamp-1 max-w-xs">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono font-bold">
                        {p.sku} &middot;{" "}
                        <span className="text-slate-500 font-sans">
                          {p.brand || "Prayog India"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-semibold text-slate-600">
                      <div>
                        {typeof p.category === "object"
                          ? p.category?.name
                          : p.category}
                      </div>
                      {p.subcategory && (
                        <div className="text-[10px] text-slate-400">
                          {p.subcategory}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">
                        {p.weightGrams || 250}g
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.dimensionsCm
                          ? `${p.dimensionsCm.length}x${p.dimensionsCm.width}x${p.dimensionsCm.height} cm`
                          : "15x10x5 cm"}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isBattery
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : p.shippingTag === "Fragile" ||
                                p.shippingTag === "Fragile Product"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {p.shippingTag || "Standard"}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#00AEEF] bg-slate-100 hover:bg-sky-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200/80 hover:border-sky-200"
                          title="Edit Product Details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#00AEEF]" />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/products/${p.slug || p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AEEF] hover:underline px-2 py-1"
                          title="View on Live Store"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>SEO &amp; Search</span>
                  </span>
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
                          onChange={(e) => setNewCategory(e.target.value)}
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
                        <input
                          type="text"
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                          placeholder="e.g. Development Boards"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
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
                    {/* 1. AI SEO Assistant & Health Score Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-purple-800/40 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30">
                              <Sparkles className="w-4 h-4 text-purple-300" />
                            </span>
                            <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                              <span>AI Search &amp; Metadata Optimizer</span>
                              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-mono font-medium border border-purple-400/20">
                                Google Ready
                              </span>
                            </h4>
                          </div>
                          <p className="text-xs text-purple-200/80 max-w-xl leading-relaxed">
                            Auto-generate high-CTR meta titles, rich descriptions, and search keyword tags tailored for Indian STEM and hardware buyers.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-300 font-medium">SEO Health:</span>
                              <span
                                className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                                  seoScore >= 80
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                                    : seoScore >= 50
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                                }`}
                              >
                                {seoScore}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {seoScore >= 80 ? "Optimal Ranking" : seoScore >= 50 ? "Moderate" : "Needs Attention"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleAutoGenerateSEO}
                            className="bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-98 flex items-center gap-2 cursor-pointer shrink-0"
                          >
                            <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                            <span>Auto-Generate SEO</span>
                          </button>
                        </div>
                      </div>

                      {/* Score Progress Bar */}
                      <div className="mt-3.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            seoScore >= 80
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : seoScore >= 50
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                : "bg-gradient-to-r from-rose-500 to-red-400"
                          }`}
                          style={{ width: `${seoScore}%` }}
                        />
                      </div>
                    </div>

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
    </div>
  );
}
