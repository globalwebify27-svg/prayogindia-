"use client";

import React, { useState } from "react";
import "./OrderTruckButton.css";

interface Props {
  defaultText?: string;
  successText?: string;
  onClick?: () => void;
  onAnimationComplete?: () => void;
  disabled?: boolean;
  className?: string;
  autoAnimate?: boolean;
}

export function OrderTruckButton({
  defaultText = "Complete Order",
  successText = "Order Placed",
  onClick,
  onAnimationComplete,
  disabled = false,
  className = "",
  autoAnimate = false,
}: Props) {
  const [animating, setAnimating] = useState(autoAnimate);

  const handleClick = () => {
    if (disabled || animating) return;
    setAnimating(true);
    onClick?.();

    // Call onAnimationComplete when truck has delivered and text shows
    if (onAnimationComplete) {
      setTimeout(() => {
        onAnimationComplete();
      }, 7200);
    }
  };

  return (
    <button
      type="button"
      className={`order ${animating ? "animate" : ""} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="default">{defaultText}</span>
      <span className="success">
        {successText}
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>
      <div className="box" />
      <div className="truck">
        <div className="back" />
        <div className="front">
          <div className="window" />
        </div>
        <div className="light top" />
        <div className="light bottom" />
      </div>
      <div className="lines" />
    </button>
  );
}
