"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 24,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [contentSize, setContentSize] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const measure = () => {
      const firstSet = el.firstElementChild as HTMLElement;
      if (firstSet) {
        const measured =
          direction === "horizontal"
            ? firstSet.offsetWidth + gap
            : firstSet.offsetHeight + gap;
        if (measured > 0) {
          setContentSize(measured);
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [direction, gap, children]);

  useEffect(() => {
    if (contentSize === 0) return;

    const from = reverse ? -contentSize : 0;
    const to = reverse ? 0 : -contentSize;

    let controls: { stop: () => void } | undefined;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((k) => k + 1);
        },
      });
    } else {
      translation.set(from);
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: currentDuration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return () => controls?.stop();
  }, [key, translation, currentDuration, contentSize, reverse, isTransitioning]);

  const hoverProps = durationOnHover
    ? {
        onMouseEnter: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onMouseLeave: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div
      className={cn(
        "overflow-hidden select-none w-full",
        direction === "horizontal" ? "w-full" : "h-full",
        className
      )}
    >
      <motion.div
        ref={containerRef}
        className={cn(
          "flex",
          direction === "horizontal" ? "w-max flex-row" : "h-max flex-col"
        )}
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
        }}
        {...hoverProps}
      >
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
