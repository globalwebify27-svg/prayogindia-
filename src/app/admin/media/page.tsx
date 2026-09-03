"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  UploadCloud,
  Search,
  Filter,
  Image as ImageIcon,
  FileText,
  Box,
  Video,
  Copy,
  Check,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  HardDrive,
  Plus,
  Grid,
  List,
  Tag,
  Info,
  Calendar,
  FileType,
} from "lucide-react";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "cad" | "video";
  mimeType: string;
  sizeKb: number;
  folder: "Products" | "Banners" | "Services" | "Datasheets" | "3D Models";
  associatedSku?: string;
  altText: string;
  dimensions?: string;
  uploadedAt: string;
}

const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: "med-1",
    name: "arduino_uno_r4_wifi_top.webp",
    url: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 142,
    folder: "Products",
    associatedSku: "ARD-UNO-R4-WIFI",
    altText:
      "Arduino Uno R4 WiFi with LED Matrix and Renesas RA4M1 Microcontroller",
    dimensions: "1200 x 900 px",
    uploadedAt: "2026-08-25",
  },
  {
    id: "med-2",
    name: "raspberry_pi_5_8gb_board.webp",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 284,
    folder: "Products",
    associatedSku: "RPI-5-8GB-DEV",
    altText:
      "Raspberry Pi 5 8GB RAM Single Board Computer with BCM2712 Quad Core",
    dimensions: "1600 x 1200 px",
    uploadedAt: "2026-08-24",
  },
  {
    id: "med-3",
    name: "pixhawk_6c_autopilot_flight.webp",
    url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 318,
    folder: "Products",
    associatedSku: "UAV-PIX-6C-AUTO",
    altText:
      "Holybro Pixhawk 6C Autopilot Flight Controller for Quadcopter Drones",
    dimensions: "1920 x 1080 px",
    uploadedAt: "2026-08-22",
  },
  {
    id: "med-4",
    name: "nvidia_jetson_orin_nano_kit.webp",
    url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 412,
    folder: "Products",
    associatedSku: "JET-ORIN-NANO-8G",
    altText:
      "NVIDIA Jetson Orin Nano 8GB Developer Kit for Edge AI Computer Vision",
    dimensions: "1800 x 1350 px",
    uploadedAt: "2026-08-20",
  },
  {
    id: "med-5",
    name: "atl_stem_tinkering_mega_lab_banner.webp",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 520,
    folder: "Banners",
    associatedSku: "KIT-ATL-PRO-V2",
    altText:
      "Prayog India Atal Tinkering Lab Setup Hardware Benches with Microcontroller Kits",
    dimensions: "2400 x 1200 px",
    uploadedAt: "2026-08-18",
  },
  {
    id: "med-6",
    name: "lipo_4s_2200mah_safety_manual.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    type: "pdf",
    mimeType: "application/pdf",
    sizeKb: 890,
    folder: "Datasheets",
    associatedSku: "BAT-LIPO-4S-2200",
    altText:
      "LiPo Battery Safe Charging, Surface Freight Transportation & Storage Protocol PDF",
    uploadedAt: "2026-08-15",
  },
  {
    id: "med-7",
    name: "stm32_nucleo_f401re_pinout_datasheet.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    type: "pdf",
    mimeType: "application/pdf",
    sizeKb: 1450,
    folder: "Datasheets",
    associatedSku: "STM-NUCLEO-F401",
    altText:
      "STMicroelectronics STM32F401RE Pinout Architecture & Schematic Datasheet",
    uploadedAt: "2026-08-12",
  },
  {
    id: "med-8",
    name: "mecanum_wheel_rover_chassis_cad.stl",
    url: "https://example.com/models/mecanum_rover.stl",
    type: "cad",
    mimeType: "model/stl",
    sizeKb: 2340,
    folder: "3D Models",
    associatedSku: "ROB-MECANUM-V1",
    altText:
      "3D CAD Printable STL Chassis for 4WD Omni-Directional Mecanum Robot",
    uploadedAt: "2026-08-10",
  },
  {
    id: "med-9",
    name: "robotics_lab_manipulator_arm_service.webp",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    type: "image",
    mimeType: "image/webp",
    sizeKb: 340,
    folder: "Services",
    altText:
      "6-Axis Industrial Robotics Manipulator Lab Installation by Prayog India Engineers",
    dimensions: "1200 x 800 px",
    uploadedAt: "2026-08-08",
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Quick Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Asset Detail Modal
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);

  // Upload Asset Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileType, setNewFileType] = useState<
    "image" | "pdf" | "cad" | "video"
  >("image");
  const [newFolder, setNewFolder] = useState<
    "Products" | "Banners" | "Services" | "Datasheets" | "3D Models"
  >("Products");
  const [newAssociatedSku, setNewAssociatedSku] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // Filter Logic
  const filteredAssets = assets.filter((item) => {
    const matchesFolder =
      selectedFolder === "ALL" || item.folder === selectedFolder;
    const matchesType = selectedType === "ALL" || item.type === selectedType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.associatedSku &&
        item.associatedSku.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFolder && matchesType && matchesSearch;
  });

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Delete this media asset from Prayog Media CDN storage?")) {
      setAssets(assets.filter((a) => a.id !== id));
      if (activeAsset?.id === id) setActiveAsset(null);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileUrl.trim()) return;

    const newAsset: MediaAsset = {
      id: `med-${Date.now()}`,
      name: newFileName.trim(),
      url: newFileUrl.trim(),
      type: newFileType,
      mimeType:
        newFileType === "image"
          ? "image/webp"
          : newFileType === "pdf"
            ? "application/pdf"
            : newFileType === "cad"
              ? "model/stl"
              : "video/mp4",
      sizeKb: Math.floor(Math.random() * 400) + 120,
      folder: newFolder,
      associatedSku: newAssociatedSku.trim() || undefined,
      altText: newAltText.trim() || newFileName.trim(),
      dimensions: newFileType === "image" ? "1920 x 1080 px" : undefined,
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    setAssets([newAsset, ...assets]);
    setIsUploadOpen(false);
    setUploadSuccessAlert(true);
    setTimeout(() => setUploadSuccessAlert(false), 3000);

    // Reset Form
    setNewFileName("");
    setNewFileUrl("");
    setNewAltText("");
    setNewAssociatedSku("");
  };

  const totalStorageKb = assets.reduce((acc, curr) => acc + curr.sizeKb, 0);
  const totalStorageMb = (totalStorageKb / 1024).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              PRAYOG MEDIA CDN &amp; ASSETS
            </span>
            <span className="text-xs text-slate-400 font-bold">
              Cloudinary / AWS S3 Production Storage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Media Library Management
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Centralized repository for hardware photography, component
            schematics, PDF datasheets, and 3D CAD models with direct SKU
            attribution and CDN links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-[#00AEEF]/20 transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            New media asset uploaded and published to Prayog CDN cache!
          </span>
        </div>
      )}

      {/* Storage & Asset Breakdown Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Total Assets</span>
            <HardDrive className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {assets.length} Files
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Across all hardware categories
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Storage Used</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalStorageMb} MB
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            of 5.0 GB CDN Quota (8.5%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Product Photos</span>
            <ImageIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {
              assets.filter(
                (a) => a.folder === "Products" || a.type === "image",
              ).length
            }
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Optimized WebP Format
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Datasheets &amp; CAD</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">
            {assets.filter((a) => a.type === "pdf" || a.type === "cad").length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            PDFs, STLs &amp; STEP models
          </div>
        </div>
      </div>

      {/* Main Filter, Search & View Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by file name, alt text, or SKU (e.g. arduino, pixhawk, BAT-LIPO)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 focus:outline-none focus:border-[#00AEEF]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
            {["ALL", "image", "pdf", "cad"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer capitalize ${
                  selectedType === t
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {t === "ALL"
                  ? "All Formats"
                  : t === "image"
                    ? "Photos"
                    : t === "pdf"
                      ? "Datasheets"
                      : "3D CAD"}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white shadow-xs text-[#00AEEF]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white shadow-xs text-[#00AEEF]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folder Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">
            Folder:
          </span>
          {[
            "ALL",
            "Products",
            "Banners",
            "Services",
            "Datasheets",
            "3D Models",
          ].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedFolder === folder
                  ? "bg-[#E0F7FC] text-[#00AEEF] border border-[#00AEEF]/40"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {folder} (
              {folder === "ALL"
                ? assets.length
                : assets.filter((a) => a.folder === folder).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Media Assets Display: Grid or Table */}
      {/* ======================================================== */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#00AEEF]/50 transition-all flex flex-col justify-between group"
            >
              {/* Asset Preview Thumbnail */}
              <div
                onClick={() => setActiveAsset(asset)}
                className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:opacity-95"
              >
                {asset.type === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : asset.type === "pdf" ? (
                  <div className="flex flex-col items-center gap-2 text-amber-700 p-4 text-center">
                    <FileText className="w-12 h-12" />
                    <span className="text-xs font-mono font-bold">
                      PDF Document
                    </span>
                  </div>
                ) : asset.type === "cad" ? (
                  <div className="flex flex-col items-center gap-2 text-blue-700 p-4 text-center">
                    <Box className="w-12 h-12" />
                    <span className="text-xs font-mono font-bold">
                      3D STL CAD Model
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-purple-700 p-4 text-center">
                    <Video className="w-12 h-12" />
                    <span className="text-xs font-mono font-bold">
                      Video File
                    </span>
                  </div>
                )}

                {/* Folder Badge Overlay */}
                <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {asset.folder}
                </span>

                {/* SKU Badge Overlay */}
                {asset.associatedSku && (
                  <span className="absolute bottom-2 left-2 bg-[#00AEEF]/90 text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {asset.associatedSku}
                  </span>
                )}
              </div>

              {/* Asset Metadata & Action Bar */}
              <div className="p-3.5 space-y-2 text-xs">
                <div>
                  <h4
                    className="font-bold text-slate-900 truncate"
                    title={asset.name}
                  >
                    {asset.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>
                      {asset.sizeKb} KB • {asset.mimeType}
                    </span>
                    <span>{asset.uploadedAt}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="text-[11px] font-extrabold text-slate-600 hover:text-[#00AEEF] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CDN URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveAsset(asset)}
                      className="p-1.5 text-slate-400 hover:text-[#00AEEF] hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed List / Table View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Asset</th>
                  <th className="p-3.5">Folder</th>
                  <th className="p-3.5">Associated SKU</th>
                  <th className="p-3.5">File Size</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {asset.type === "image" ? (
                            <img
                              src={asset.url}
                              alt={asset.altText}
                              className="w-full h-full object-cover"
                            />
                          ) : asset.type === "pdf" ? (
                            <FileText className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Box className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {asset.name}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {asset.altText}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {asset.folder}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-bold text-[#00AEEF]">
                      {asset.associatedSku || "—"}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      {asset.sizeKb} KB
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-500">
                      {asset.uploadedAt}
                    </td>
                    <td className="p-3.5 pr-5 text-right space-x-2">
                      <button
                        onClick={() => handleCopyUrl(asset)}
                        className="text-[11px] font-bold text-slate-600 hover:text-[#00AEEF] cursor-pointer"
                      >
                        {copiedId === asset.id ? "Copied!" : "Copy URL"}
                      </button>
                      <button
                        onClick={() => setActiveAsset(asset)}
                        className="text-[11px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal: Asset Detail & SEO Alt Text Manager */}
      {/* ======================================================== */}
      {activeAsset && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF]">
                  MEDIA ASSET INSPECTOR
                </span>
                <h3 className="text-base font-black text-white truncate max-w-md">
                  {activeAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveAsset(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Media Preview Box */}
              <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                {activeAsset.type === "image" ? (
                  <img
                    src={activeAsset.url}
                    alt={activeAsset.altText}
                    className="w-full h-full object-contain"
                  />
                ) : activeAsset.type === "pdf" ? (
                  <div className="flex flex-col items-center gap-3 text-amber-700">
                    <FileText className="w-16 h-16" />
                    <span className="font-mono font-bold">
                      PDF Document Ready
                    </span>
                    <a
                      href={activeAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>Open PDF in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-blue-700">
                    <Box className="w-16 h-16" />
                    <span className="font-mono font-bold">
                      3D STL / STEP Model Asset
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Folder
                  </span>
                  <div className="font-bold text-slate-900">
                    {activeAsset.folder}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Associated SKU
                  </span>
                  <div className="font-mono font-bold text-[#00AEEF]">
                    {activeAsset.associatedSku || "None"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    File Size
                  </span>
                  <div className="font-mono font-bold text-slate-900">
                    {activeAsset.sizeKb} KB
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    MIME Type
                  </span>
                  <div className="font-mono text-slate-700">
                    {activeAsset.mimeType}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Dimensions
                  </span>
                  <div className="text-slate-700">
                    {activeAsset.dimensions || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Uploaded On
                  </span>
                  <div className="text-slate-700">{activeAsset.uploadedAt}</div>
                </div>
              </div>

              {/* CDN URL Direct Copy */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Public CDN URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeAsset.url}
                    className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopyUrl(activeAsset)}
                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#00AEEF] transition-colors cursor-pointer"
                  >
                    {copiedId === activeAsset.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Alt Text for SEO */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  SEO Image Alt Text
                </label>
                <input
                  type="text"
                  value={activeAsset.altText}
                  onChange={(e) => {
                    const updated = { ...activeAsset, altText: e.target.value };
                    setActiveAsset(updated);
                    setAssets(
                      assets.map((a) =>
                        a.id === activeAsset.id ? updated : a,
                      ),
                    );
                  }}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => handleDeleteAsset(activeAsset.id)}
                  className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Asset
                </button>
                <button
                  onClick={() => setActiveAsset(null)}
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal: Upload New Media Asset */}
      {/* ======================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl overflow-hidden shadow-2xl space-y-0 my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF]">
                  UPLOAD TO PRAYOG CLOUD STORAGE
                </span>
                <h3 className="text-base font-black text-white">
                  Add New Hardware Asset
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUploadSubmit}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Asset Name / Filename
                </label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. holybro_m8n_gps_module.webp"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Direct CDN URL / Source Link
                </label>
                <input
                  type="url"
                  required
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or S3 link"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Format Type
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800"
                  >
                    <option value="image">Image (WebP/JPG/PNG)</option>
                    <option value="pdf">Datasheet PDF</option>
                    <option value="cad">3D CAD (STL/STEP)</option>
                    <option value="video">Product Video (MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Folder Category
                  </label>
                  <select
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Products">Products</option>
                    <option value="Banners">Banners</option>
                    <option value="Services">Services</option>
                    <option value="Datasheets">Datasheets</option>
                    <option value="3D Models">3D Models</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Associated Hardware SKU (Optional)
                </label>
                <input
                  type="text"
                  value={newAssociatedSku}
                  onChange={(e) => setNewAssociatedSku(e.target.value)}
                  placeholder="e.g. UAV-PIX-6C-AUTO"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  SEO Alt Text / Description
                </label>
                <input
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="e.g. Holybro M8N GPS Receiver with Compass for Pixhawk 6C"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md shadow-[#00AEEF]/20 cursor-pointer"
                >
                  Publish Asset to CDN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
