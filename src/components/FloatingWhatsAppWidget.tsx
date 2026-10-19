"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, X } from "lucide-react";

export const FloatingWhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Customer-facing mobile pages have a bottom bar (sticky action bar or MobileBottomNav)
  const hasStickyBottomBar = true;

  // Mobile draggable position state (null = use default bottom/right classes)
  const [mobilePos, setMobilePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragInfo = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    elemX: 0,
    elemY: 0,
    hasMoved: false,
  });

  // Restore saved position on mount (if user previously dragged it during this session)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("prayog_wa_mobile_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          const iconSize = 48;
          const margin = 12;
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          const midX = parsed.x + iconSize / 2;
          const snappedX =
            midX < screenWidth / 2 ? margin : screenWidth - iconSize - margin;
          const topBound = margin + 55;
          const bottomBound = hasStickyBottomBar
            ? screenHeight - iconSize - 76 - margin
            : screenHeight - iconSize - margin;
          setMobilePos({
            x: snappedX,
            y: Math.max(topBound, Math.min(bottomBound, parsed.y)),
          });
        }
      }
    } catch {}
  }, [hasStickyBottomBar]);

  // Keep mobile icon snapped within screen bounds if window resizes or device rotates
  useEffect(() => {
    const handleResize = () => {
      setMobilePos((prev) => {
        if (!prev) return null;
        const iconSize = 48;
        const margin = 12;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const midX = prev.x + iconSize / 2;
        const snappedX =
          midX < screenWidth / 2 ? margin : screenWidth - iconSize - margin;
        const topBound = margin + 55;
        const bottomBound = hasStickyBottomBar
          ? screenHeight - iconSize - 76 - margin
          : screenHeight - iconSize - margin;
        return {
          x: snappedX,
          y: Math.max(topBound, Math.min(bottomBound, prev.y)),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasStickyBottomBar]);

  // Desktop click-outside to collapse popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const WHATSAPP_URL =
    "https://wa.me/918709789641?text=Hi%20Prayog%20India%2C%20I%20have%20an%20inquiry%20regarding%20products.";

  // Pointer event handlers for mobile dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: rect.left,
      elemY: rect.top,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    if (!dragInfo.current.hasMoved && Math.hypot(dx, dy) > 6) {
      dragInfo.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragInfo.current.hasMoved) {
      const iconSize = 48;
      const margin = 10;
      const maxX = window.innerWidth - iconSize - margin;
      const maxY = window.innerHeight - iconSize - margin;

      const newX = Math.max(margin, Math.min(maxX, dragInfo.current.elemX + dx));
      const newY = Math.max(margin, Math.min(maxY, dragInfo.current.elemY + dy));

      setMobilePos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (dragInfo.current.hasMoved) {
      setIsDragging(false);

      // Snap to nearest corner / edge (never stay floating in the middle of screen)
      setMobilePos((currentPos) => {
        if (!currentPos) return null;

        const iconSize = 48;
        const margin = 12;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Determine nearest horizontal edge: left or right corner
        const midX = currentPos.x + iconSize / 2;
        const snappedX =
          midX < screenWidth / 2 ? margin : screenWidth - iconSize - margin;

        // Keep vertically in safe zone (below header, above sticky bottom bar)
        const topBound = margin + 55;
        const bottomBound = hasStickyBottomBar
          ? screenHeight - iconSize - 76 - margin
          : screenHeight - iconSize - margin;
        const snappedY = Math.max(topBound, Math.min(bottomBound, currentPos.y));

        const snappedPos = { x: snappedX, y: snappedY };

        try {
          sessionStorage.setItem("prayog_wa_mobile_pos", JSON.stringify(snappedPos));
        } catch {}

        return snappedPos;
      });
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    // Snap to nearest edge on cancel
    setMobilePos((currentPos) => {
      if (!currentPos) return null;
      const iconSize = 48;
      const margin = 12;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const midX = currentPos.x + iconSize / 2;
      const snappedX = midX < screenWidth / 2 ? margin : screenWidth - iconSize - margin;
      const topBound = margin + 55;
      const bottomBound = hasStickyBottomBar
        ? screenHeight - iconSize - 76 - margin
        : screenHeight - iconSize - margin;
      return {
        x: snappedX,
        y: Math.max(topBound, Math.min(bottomBound, currentPos.y)),
      };
    });
  };

  const handleMobileClick = (e: React.MouseEvent) => {
    // If user dragged the icon, cancel click
    if (dragInfo.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragInfo.current.hasMoved = false;
      return;
    }
    // Pure tap -> open WhatsApp
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* ── MOBILE VIEW: Draggable WhatsApp Icon Snapping to Screen Corners/Edges ── */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleMobileClick}
        aria-label="Chat on WhatsApp (Draggable)"
        title="Drag to reposition, tap to chat"
        style={
          mobilePos
            ? { left: `${mobilePos.x}px`, top: `${mobilePos.y}px` }
            : undefined
        }
        className={`sm:hidden fixed z-50 w-12 h-12 rounded-full bg-[#25D366] active:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing touch-none select-none ${
          isDragging
            ? "scale-110 shadow-2xl opacity-90 ring-4 ring-[#25D366]/40 transition-none"
            : "transition-all duration-300 ease-out active:scale-95"
        } ${
          mobilePos
            ? ""
            : hasStickyBottomBar
            ? "bottom-[76px] right-3"
            : "bottom-4 right-3"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 pointer-events-none">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </button>

      {/* ── DESKTOP VIEW: Toggle Button (Down-arrow when open, Pill when closed) ── */}
      <div
        ref={widgetRef}
        className="hidden sm:flex fixed z-50 bottom-6 right-6 flex-col items-end pointer-events-auto select-none transition-all duration-300"
      >
        {/* Speech Bubble Popup Modal */}
        {isOpen && (
          <div className="relative bg-white rounded-[26px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-200/90 w-[300px] space-y-4 animate-in fade-in zoom-in-95 duration-200 mb-4 text-slate-800">
            {/* Top Row: Green Chat Icon Badge & Close Button */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-[#00D26A] border-2 border-slate-900 flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Friendly Greeting Header */}
            <div className="space-y-1">
              <h4 className="text-[19px] font-bold text-slate-900 tracking-tight leading-snug">
                Hi there!
              </h4>
              <p className="text-[15px] font-semibold text-slate-800 leading-snug">
                How can I help you?
              </p>
            </div>

            {/* Dark Action Button: Chat with us > */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#18181B] hover:bg-[#27272A] active:scale-[0.98] text-white rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-md transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white shrink-0"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="text-[15px] font-bold tracking-tight">Chat with us</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Pointer tail pointing down to the green circle */}
            <div className="absolute -bottom-2.5 right-6 w-5 h-5 bg-white border-b border-r border-slate-200 transform rotate-45 shadow-xs" />
          </div>
        )}

        {isOpen ? (
          /* Down-arrow circular green button when open */
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Collapse chat"
            className="w-13 h-13 rounded-full bg-[#00D26A] hover:bg-[#00be60] text-slate-900 border-2 border-slate-900 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronDown className="w-7 h-7 stroke-[3] text-slate-950" />
          </button>
        ) : (
          /* White Pill with Live Dot, "Chat with us" & Green WhatsApp Circle */
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Chat with us on WhatsApp"
            className="bg-white hover:bg-slate-50/90 border border-slate-200/90 rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer group"
          >
            {/* Pulsing Green Live Online Dot */}
            <span className="relative flex items-center justify-center w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-3 h-3 bg-[#00D26A]" />
            </span>

            {/* "Chat with us" text */}
            <span className="text-[15px] font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Chat with us
            </span>

            {/* WhatsApp Green Circle Icon Badge */}
            <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default FloatingWhatsAppWidget;
