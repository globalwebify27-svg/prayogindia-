"use client";

import React from "react";

interface AnimatedPriceProps {
  amount: number;
  startDelay?: number;
  staggerMs?: number;
  className?: string;
  prefix?: string;
}

export function AnimatedPriceCharacters({
  amount,
  startDelay = 120,
  staggerMs = 75,
  className = "",
  prefix = "₹",
}: AnimatedPriceProps) {
  const formattedText = `${prefix}${amount.toLocaleString("en-IN")}`;
  const chars = formattedText.split("");

  let digitCount = 0;

  return (
    <span
      key={`slot-price-${amount}`}
      aria-label={formattedText}
      className={`inline-flex items-center tabular-nums leading-none select-none ${className}`}
    >
      {chars.map((char, index) => {
        const isDigit = /^[0-9]$/.test(char);

        if (isDigit) {
          const target = parseInt(char, 10);
          const currentDelay = startDelay + digitCount * staggerMs;
          digitCount++;

          // 8 numbers: 7 cyclic reel numbers, settling on target digit
          const reel = [
            (target + 3) % 10,
            (target + 7) % 10,
            (target + 1) % 10,
            (target + 5) % 10,
            (target + 8) % 10,
            (target + 2) % 10,
            (target + 9) % 10,
            target,
          ];

          return (
            <span
              key={`digit-${index}`}
              aria-hidden="true"
              className="inline-block relative overflow-hidden h-[1.25em]"
            >
              <span
                className="flex flex-col animate-slot-roll"
                style={{
                  animationDelay: `${currentDelay}ms`,
                  willChange: "transform, filter",
                }}
              >
                {reel.map((num, i) => (
                  <span
                    key={i}
                    className="flex items-center justify-center h-[1.25em]"
                  >
                    {num}
                  </span>
                ))}
              </span>
            </span>
          );
        }

        // Currency symbol or comma/separator
        return (
          <span
            key={`sep-${index}`}
            aria-hidden="true"
            className="inline-flex items-center justify-center h-[1.25em]"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
}

export default AnimatedPriceCharacters;
