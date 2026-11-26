/**
 * Professional Parabolic Arc Fly-To-Cart Animation
 * Trajectory: Quadratic Bezier Curve from source element to the header cart button
 * Includes visible glowing curved trajectory line, smooth easing, and tactile landing bump
 */

export interface FlyToCartOptions {
  imageSrc?: string | null;
  duration?: number;
  showCurvedLine?: boolean;
  onComplete?: () => void;
}

export function triggerFlyToCart(
  source: HTMLElement | React.MouseEvent | { x: number; y: number } | null | undefined,
  imageSrcOrOptions?: string | null | FlyToCartOptions
) {
  if (typeof window === "undefined" || !source) return;

  // Respect user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bumpCartIcon();
    return;
  }

  const options: FlyToCartOptions =
    typeof imageSrcOrOptions === "string" || imageSrcOrOptions === null
      ? { imageSrc: imageSrcOrOptions }
      : imageSrcOrOptions || {};

  const imageSrc = options.imageSrc;
  // Slower, smoother pacing (~980ms) for high-end professional feel
  const duration = options.duration || 980;
  const showCurvedLine = options.showCurvedLine !== false;

  // 1. Calculate Start Coordinates (Center of the source button / event)
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if ("clientX" in source && "clientY" in source) {
    startX = source.clientX;
    startY = source.clientY;
  } else if ("getBoundingClientRect" in source) {
    const rect = source.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  } else if ("x" in source && "y" in source) {
    startX = source.x;
    startY = source.y;
  }

  // 2. Locate Destination Cart Button (Desktop header pill, mobile header icon, or bottom nav)
  const cartTarget = findVisibleCartTarget();

  let endX = window.innerWidth - 65;
  let endY = 40;

  if (cartTarget) {
    const destRect = cartTarget.getBoundingClientRect();
    endX = destRect.left + destRect.width / 2;
    endY = destRect.top + destRect.height / 2;
  }

  // 3. Construct Parabolic Bezier Control Point (Apex)
  // Natural elevation proportional to distance: graceful arc without hitting viewport ceiling
  const distance = Math.hypot(endX - startX, endY - startY);
  const arcLift = Math.min(180, Math.max(70, distance * 0.22));
  // Ensure apex stays visible on screen (at least 32px below viewport top)
  const apexY = Math.max(32, Math.min(startY, endY) - arcLift);
  const apexX = startX + (endX - startX) * 0.48;

  // 4. Render Curvey Trajectory Line (SVG Overlay)
  // Authentic, simple dashed trajectory line without heavy neon glow or multiple layers
  let svgOverlay: SVGSVGElement | null = null;
  let maskPath: SVGPathElement | null = null;
  let pathTotalLength = 0;

  if (showCurvedLine) {
    svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlay.setAttribute("aria-hidden", "true");
    svgOverlay.setAttribute("class", "fly-to-cart-path-overlay");
    Object.assign(svgOverlay.style, {
      position: "fixed",
      top: "0px",
      left: "0px",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: "99997",
      overflow: "visible",
      opacity: "1",
      transition: "opacity 0.25s ease-out",
    });

    const uniqueId = `fly-arc-${Math.random().toString(36).slice(2, 9)}`;

    svgOverlay.innerHTML = `
      <defs>
        <mask id="${uniqueId}-mask">
          <path
            id="${uniqueId}-mask-path"
            d="M ${startX} ${startY} Q ${apexX} ${apexY} ${endX} ${endY}"
            fill="none"
            stroke="#ffffff"
            stroke-width="8"
            stroke-linecap="round"
          />
        </mask>
      </defs>
      <!-- Single, clean, authentic dashed trajectory arc -->
      <path
        d="M ${startX} ${startY} Q ${apexX} ${apexY} ${endX} ${endY}"
        fill="none"
        stroke="#00AEEF"
        stroke-width="2"
        stroke-dasharray="6 5"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.75"
        mask="url(#${uniqueId}-mask)"
      />
    `;

    document.body.appendChild(svgOverlay);

    maskPath = svgOverlay.querySelector<SVGPathElement>(`#${uniqueId}-mask-path`);
    if (maskPath && typeof maskPath.getTotalLength === "function") {
      try {
        pathTotalLength = maskPath.getTotalLength();
        if (pathTotalLength > 0) {
          maskPath.style.strokeDasharray = `${pathTotalLength} ${pathTotalLength}`;
          maskPath.style.strokeDashoffset = `${pathTotalLength}`;
        }
      } catch {
        pathTotalLength = 0;
      }
    }
  }

  // 5. Create the Flying Clone Badge Element
  const badgeSize = 46;
  const flyingNode = document.createElement("div");
  flyingNode.setAttribute("aria-hidden", "true");
  flyingNode.className = "fly-to-cart-particle";

  Object.assign(flyingNode.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${badgeSize}px`,
    height: `${badgeSize}px`,
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px -4px rgba(37, 99, 235, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.15)",
    border: "2px solid #00AEEF",
    zIndex: "99999",
    pointerEvents: "none",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `translate3d(${startX - badgeSize / 2}px, ${startY - badgeSize / 2}px, 0px) scale(0.6)`,
    opacity: "1",
    willChange: "transform, opacity",
    contain: "layout style paint",
  });

  if (imageSrc) {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Cart preview";
    Object.assign(img.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: "4px",
      pointerEvents: "none",
      userSelect: "none",
    });
    flyingNode.appendChild(img);
  } else {
    // Elegant fallback icon
    flyingNode.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00AEEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    `;
  }

  document.body.appendChild(flyingNode);

  // 6. Parabolic Motion Frame Loop
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth sinusoidal ease-in-out for ultra-silky acceleration and deceleration
    const t = 0.5 * (1 - Math.cos(Math.PI * progress));

    // Quadratic Bezier interpolation: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
    const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * apexX + t * t * endX;
    const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * apexY + t * t * endY;

    // Smoothly reveal the clean dashed trajectory line behind the flying item
    if (maskPath && pathTotalLength > 0) {
      const currentOffset = Math.max(0, pathTotalLength * (1 - progress));
      maskPath.style.strokeDashoffset = `${currentOffset}`;
    }

    // Scale calculation:
    // 0 -> 0.15: Pops up from 0.65 to 1.15
    // 0.15 -> 0.72: Smoothly glides (1.15 -> 1.0)
    // 0.72 -> 1.0: Dives & shrinks into cart (1.0 -> 0.12)
    let scale = 1;
    if (progress < 0.15) {
      scale = 0.65 + (progress / 0.15) * 0.5;
    } else if (progress < 0.72) {
      scale = 1.15 - ((progress - 0.15) / 0.57) * 0.15;
    } else {
      scale = 1.0 - ((progress - 0.72) / 0.28) * 0.88;
    }

    // Gentle 360-degree rotation across the flight duration
    const rotate = progress * 360;

    // Fade out during the final 12% of the trajectory as it drops into the basket
    const opacity = progress > 0.88 ? 1 - (progress - 0.88) / 0.12 : 1;

    flyingNode.style.transform = `translate3d(${currentX - badgeSize / 2}px, ${currentY - badgeSize / 2}px, 0px) scale(${scale}) rotate(${rotate}deg)`;
    flyingNode.style.opacity = `${opacity}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Completed flight
      flyingNode.remove();
      bumpCartIcon(cartTarget);

      // Smoothly fade out the curved trajectory line
      if (svgOverlay) {
        svgOverlay.style.opacity = "0";
        setTimeout(() => {
          svgOverlay?.remove();
        }, 260);
      }

      options.onComplete?.();
    }
  }

  requestAnimationFrame(step);
}

/**
 * Searches the DOM for the most relevant visible cart target
 */
function findVisibleCartTarget(): HTMLElement | null {
  const candidates = [
    document.querySelector<HTMLElement>('[data-cart-target="true"]'),
    document.getElementById("header-cart-btn"),
    document.querySelector<HTMLElement>('header button[aria-label*="Cart"]'),
    document.querySelector<HTMLElement>('header a[href*="/cart"]'),
    document.querySelector<HTMLElement>('[aria-label="Shopping Cart"]'),
    document.querySelector<HTMLElement>('[data-tab="cart"]'),
  ];

  for (const el of candidates) {
    if (el && el.offsetParent !== null) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight) {
        return el;
      }
    }
  }

  // Fallback to the first found candidate even if partially offscreen
  return candidates.find(Boolean) || null;
}

/**
 * Triggers tactile bump / bounce on the cart button & count badge upon landing
 */
export function bumpCartIcon(target?: HTMLElement | null) {
  const el = target || findVisibleCartTarget();
  if (!el) return;

  el.classList.remove("cart-bounce-bump");
  // Force DOM reflow to re-trigger CSS animation cleanly
  void el.offsetWidth;
  el.classList.add("cart-bounce-bump");

  // Also animate the yellow count badge if found inside
  const badge = el.querySelector<HTMLElement>('[class*="bg-[#FFC20E]"], [class*="rounded-full"]');
  if (badge) {
    badge.classList.remove("cart-badge-pop");
    void badge.offsetWidth;
    badge.classList.add("cart-badge-pop");
  }
}
