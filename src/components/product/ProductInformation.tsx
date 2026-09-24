"use client";

import React from "react";
import {
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  MessageSquare,
  ShoppingBag,
  Heart,
  Plane,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Boxes,
  X,
  Share2,
} from "lucide-react";
import { Product, ProductVariant } from "@/data/mockData";

// Official WhatsApp Vector SVG Icon
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="WhatsApp"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductInformation: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant
    ? selectedVariant.inStock
    : product.inStock;
  const stockCount = React.useMemo(() => {
    // Generate a realistic low stock count (e.g., 3-8 items) for urgency indicator
    const code = product.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (code % 6) + 3;
  }, [product.id]);

  // Pincode Delivery Checker State
  const [pincode, setPincode] = React.useState("");
  const [pincodeStatus, setPincodeStatus] = React.useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [deliveryDate, setDeliveryDate] = React.useState("");

  // Price Match Modal State
  const [showPriceMatchModal, setShowPriceMatchModal] = React.useState(false);
  const [priceMatchForm, setPriceMatchForm] = React.useState({
    competitorUrl: "",
    competitorPrice: "",
    contact: "",
    submitted: false,
  });

  // Calculate estimated delivery date (3 days ahead)
  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(
      d.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  const handleCheckPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (/^\d{6}$/.test(cleanPin)) {
      setPincodeStatus("valid");
    } else {
      setPincodeStatus("invalid");
    }
  };

  const handlePriceMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (priceMatchForm.competitorPrice && priceMatchForm.contact) {
      setPriceMatchForm((prev) => ({ ...prev, submitted: true }));
      setTimeout(() => {
        setShowPriceMatchModal(false);
        setPriceMatchForm({
          competitorUrl: "",
          competitorPrice: "",
          contact: "",
          submitted: false,
        });
      }, 2500);
    }
  };

  const discountPercentage = Math.round(
    ((currentMrp - currentPrice) / currentMrp) * 100,
  );

  // Generate comprehensive WhatsApp link with product image, details, and inquiry message
  const getOutOfStockWhatsAppUrl = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://prayogindia.in";
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://prayogindia.in/products/${product.slug || product.id}`;

    // Absolute product image URL (WhatsApp automatically parses and displays link previews)
    const imageUrl = product.image
      ? product.image.startsWith("http")
        ? product.image
        : `${origin}${product.image}`
      : "";

    const lines = [
      `🛍️ *OUT OF STOCK INQUIRY — PRAYOG INDIA*`,
      `----------------------------------------`,
      `Hello Prayog India Team, I want to purchase this item which is currently *Out of Stock* on your online store:`,
      ``,
      `📌 *Product:* ${product.name}`,
      `🏷️ *SKU:* ${currentSku}`,
      `💰 *Price:* ₹${currentPrice.toLocaleString("en-IN")}.00 (Incl. GST)`,
      `📦 *Category:* ${product.category}`,
      product.brand ? `🏢 *Brand:* ${product.brand}` : "",
      selectedVariant ? `⚙️ *Selected Variant:* ${selectedVariant.name}` : "",
      ``,
      `🖼️ *Product Image:*`,
      imageUrl,
      ``,
      `🔗 *Product Link:*`,
      currentUrl,
      `----------------------------------------`,
      `💬 *My Query:*`,
      `Hi, please let me know when this product will be back in stock or if I can place an advance order for priority dispatch. Thank you!`,
    ].filter(Boolean);

    return `https://wa.me/919876543210?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Brand, Badges & Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {product.brand && (
            <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-slate-200">
              {product.brand}
            </span>
          )}
          {product.badge && (
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
              {product.badge}
            </span>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-400">
            SKU: {currentSku}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {product.name}
        </h1>

        {/* Short Product Summary */}
        {product.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 pt-0.5">
            {product.description}
          </p>
        )}

        {/* Rating & Share Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-400 gap-1 text-xs font-black">
              <Star className="w-4 h-4 fill-current" />
              <span>{product.rating}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-500">
              {product.reviews} Verified Customer Reviews
            </span>
          </div>

          {/* Native Share Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator
                  .share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  })
                  .catch(() => {});
              } else if (
                typeof navigator !== "undefined" &&
                navigator.clipboard
              ) {
                navigator.clipboard.writeText(window.location.href);
                alert("Product link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#00AEEF] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            title="Share Product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Price & GST Hierarchy + Urgency Stock Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900">
            ₹{currentPrice.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400 line-through font-bold">
            ₹{currentMrp.toLocaleString()}
          </span>
          <span className="bg-[#FF3B30] text-white text-xs font-black px-2 py-0.5 rounded-md uppercase">
            {discountPercentage}% OFF
          </span>
          <span className="ml-auto text-xs font-bold text-slate-500">
            Save ₹{(currentMrp - currentPrice).toLocaleString()}
          </span>
        </div>

        {/* Incl. GST & Found a better price */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70">
          <span className="text-slate-500 font-medium">
            Incl. GST (No Hidden Charges)
          </span>
          <button
            type="button"
            onClick={() => setShowPriceMatchModal(true)}
            className="font-bold text-slate-900 underline hover:text-[#00AEEF] transition-colors cursor-pointer"
          >
            Found a better price?
          </button>
        </div>

        {/* Please hurry! Only X left in stock */}
        {currentStock && (
          <div className="pt-1.5 space-y-1.5">
            <p className="text-xs font-bold text-[#E05344]">
              Please hurry! Only {stockCount} left in stock
            </p>
            <div className="w-full bg-slate-200/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E05344] via-amber-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(20, (stockCount / 10) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stock Availability Indicator & Freight Tag */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-slate-500">Availability:</span>
        {currentStock ? (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full font-black">
            ✓ In Stock (Ready for Dispatch)
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-black">
              ✕ Out of Stock
            </span>
            <a
              href={getOutOfStockWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/40 px-3 py-1 rounded-full font-black text-xs transition-all active:scale-95 shadow-2xs hover:shadow-sm"
              title="Inquire about stock on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Section 5.1 Freight Mode & Shipping Tag Badge */}
        {(() => {
          const tag =
            product.shippingTag ||
            (product.name.toLowerCase().includes("battery") ||
            product.name.toLowerCase().includes("lipo")
              ? "Battery Item"
              : "Standard");
          const isAirAllowed =
            product.airFreightAllowed !== false && tag !== "Battery Item";

          return (
            <div className="flex items-center gap-1.5 ml-auto">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  tag === "Battery Item"
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : tag === "Fragile"
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {tag}
              </span>

              {isAirAllowed ? (
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ✈️ Air Freight OK
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚠️ Surface Freight Only
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Pincode Delivery Availability Checker (Screenshot 2) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 border-l-4 border-l-[#FF7A00] shadow-sm space-y-2">
        <form onSubmit={handleCheckPincode} className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPincode(val);
              if (pincodeStatus !== "idle") setPincodeStatus("idle");
            }}
            placeholder="Enter Pincode to Check Delivery"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
          >
            Check
          </button>
        </form>

        {pincodeStatus === "valid" && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Delivery available for {pincode}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              ⚡ Estimated Delivery by{" "}
              <strong className="text-slate-900">{deliveryDate}</strong> • Fast
              24-hr Dispatch
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">
              ✓ Free Shipping on prepaid orders above ₹999
            </p>
          </div>
        )}

        {pincodeStatus === "invalid" && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1 pt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Please enter a
            valid 6-digit PIN code.
          </p>
        )}
      </div>

      {/* Variant Selector (if product variants exist) */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
            Select Product Variant:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedVariant?.id === variant.id
                    ? "border-[#00AEEF] bg-[#E0F7FC] text-[#00AEEF] ring-2 ring-[#00AEEF]/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                {variant.name} — ₹{variant.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 27: Air & Surface Freight Shipping Rules Card */}
      {(() => {
        const isBattery =
          product.shippingTag === "Battery Item" ||
          product.shippingTag === "Hazardous" ||
          product.name.toLowerCase().includes("battery") ||
          product.name.toLowerCase().includes("lipo");
        const weight = product.weightGrams || (isBattery ? 250 : 50);
        const airAllowed = !isBattery && product.airFreightAllowed !== false;
        const surfaceAllowed = true;

        return (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5 truncate">
                <Boxes className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                <span className="truncate">Freight Shipping Rules</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {weight} gm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Air Freight Indicator */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  airAllowed
                    ? "bg-blue-50/60 border-blue-200 text-blue-900"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Plane className="w-3.5 h-3.5 shrink-0" />
                  <span>Air Freight</span>
                </div>
                <div className="flex items-center gap-1 font-extrabold text-[11px] shrink-0">
                  {airAllowed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700">Allowed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="text-red-700">Restricted</span>
                    </>
                  )}
                </div>
              </div>

              {/* Surface Freight Indicator */}
              <div className="p-2.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>Surface Freight</span>
                </div>
                <div className="flex items-center gap-1 font-extrabold text-[11px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">Allowed</span>
                </div>
              </div>
            </div>

            {!airAllowed && (
              <p className="text-[10px] text-amber-800 bg-amber-100/70 p-2 rounded-lg font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>
                  DGCA Safety Regulation: Lithium/Battery hardware cannot be
                  transported via air freight. Dispatched via surface logistics.
                </span>
              </p>
            )}
          </div>
        );
      })()}

      {/* Customer Purchase Action Buttons */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        {currentStock ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 px-3.5">
              <span className="text-xs font-bold text-slate-700">
                Quantity:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-sm cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-black text-slate-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    disabled={quantity >= 50}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-sm cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-extrabold text-[#00AEEF]">
                  ₹{(currentPrice * quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() =>
                  onBuyNow
                    ? onBuyNow(product, quantity)
                    : onAddToCart(product, quantity)
                }
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-red-50/50 border border-red-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-red-900">
                  Currently Out of Stock
                </h4>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  This item is momentarily sold out. Chat with our engineers on
                  WhatsApp to receive restock alerts, lead times, or reserve
                  priority dispatch.
                </p>
              </div>
            </div>

            <a
              href={getOutOfStockWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
              <span>Inquire & Order via WhatsApp</span>
            </a>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium text-center">
              <span>Includes product photo, SKU details & instant support</span>
            </div>
          </div>
        )}

        {/* Wishlist Trigger */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-colors border flex items-center justify-center gap-2 cursor-pointer ${
            isWishlisted
              ? "bg-red-50 text-[#FF3B30] border-red-200"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[10px] font-bold text-slate-500">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <Truck className="w-4 h-4 text-[#00AEEF] mx-auto" />
          <span>Pan-India Dispatch</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <ShieldCheck className="w-4 h-4 text-[#FFC20E] mx-auto" />
          <span>100% Genuine</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <Headphones className="w-4 h-4 text-[#00AEEF] mx-auto" />
          <span>Tech Support</span>
        </div>
      </div>

      {/* Found a Better Price / Price Match Modal */}
      {showPriceMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-scaleUp">
            <button
              onClick={() => setShowPriceMatchModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-[#00AEEF]/10 flex items-center justify-center text-[#00AEEF]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Found a better price?
                </h3>
                <p className="text-xs text-slate-500">
                  We guarantee competitive hardware pricing!
                </p>
              </div>
            </div>

            {priceMatchForm.submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Price Match Request Submitted!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our team will verify the competitor URL and send you an
                  instant discount coupon via WhatsApp / Email within 2 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handlePriceMatchSubmit}
                className="space-y-3.5 mt-4"
              >
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-extrabold text-slate-900 block truncate">
                    {product.name}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Our Price:{" "}
                    <strong className="text-slate-900">
                      ₹{currentPrice.toLocaleString()}
                    </strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Competitor Store Link / Website
                  </label>
                  <input
                    type="url"
                    required
                    value={priceMatchForm.competitorUrl}
                    onChange={(e) =>
                      setPriceMatchForm((prev) => ({
                        ...prev,
                        competitorUrl: e.target.value,
                      }))
                    }
                    placeholder="e.g. https://store.com/product"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Price You Found (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={priceMatchForm.competitorPrice}
                    onChange={(e) =>
                      setPriceMatchForm((prev) => ({
                        ...prev,
                        competitorPrice: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Your Phone (WhatsApp) or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={priceMatchForm.contact}
                    onChange={(e) =>
                      setPriceMatchForm((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    placeholder="e.g. 9876543210 or name@email.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0A1128] hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                >
                  Submit Price Match Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
