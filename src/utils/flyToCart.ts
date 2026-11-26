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
  // Curve arches high above the highest point between source and target, remaining inside viewport
  const distance = Math.hypot(endX - startX, endY - startY);
  const arcHeight = Math.min(260, Math.max(120, distance * 0.32));
  // Ensure apex stays visible on screen (at least 24px below viewport top)
  const apexY = Math.max(24, Math.min(startY, endY) - arcHeight);
  const apexX = startX + (endX - startX) * 0.42;

  // 4. Render Curvey Trajectory Line (SVG Overlay)
  let svgOverlay: SVGSVGElement | null = null;
  let tracePath: SVGPathElement | null = null;
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
      transition: "opacity 0.32s ease-out",
    });

    const uniqueId = `fly-arc-${Math.random().toString(36).slice(2, 9)}`;

    svgOverlay.innerHTML = `
      <defs>
        <linearGradient id="${uniqueId}-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00AEEF" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#00AEEF" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="1" />
        </linearGradient>
        <filter id="${uniqueId}-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <!-- Base subtle guide dotted curve line -->
      <path
        d="M ${startX} ${startY} Q ${apexX} ${apexY} ${endX} ${endY}"
        fill="none"
        stroke="#00AEEF"
        stroke-width="2"
        stroke-dasharray="5 5"
        stroke-opacity="0.3"
        stroke-linecap="round"
      />
      <!-- Illuminated glowing trajectory arc that draws with the particle -->
      <path
        id="${uniqueId}-trace"
        d="M ${startX} ${startY} Q ${apexX} ${apexY} ${endX} ${endY}"
        fill="none"
        stroke="url(#${uniqueId}-grad)"
        stroke-width="3"
        stroke-linecap="round"
        filter="url(#${uniqueId}-glow)"
      />
    `;

    document.body.appendChild(svgOverlay);

    tracePath = svgOverlay.querySelector<SVGPathElement>(`#${uniqueId}-trace`);
    if (tracePath && typeof tracePath.getTotalLength === "function") {
      try {
        pathTotalLength = tracePath.getTotalLength();
        tracePath.style.strokeDasharray = `${pathTotalLength} ${pathTotalLength}`;
        tracePath.style.strokeDashoffset = `${pathTotalLength}`;
      } catch {
        // Fallback if browser limits getTotalLength
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
  let lastParticleDrop = 0;

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth sinusoidal ease-in-out for ultra-silky acceleration and deceleration
    const t = 0.5 * (1 - Math.cos(Math.PI * progress));

    // Quadratic Bezier interpolation: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
    const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * apexX + t * t * endX;
    const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * apexY + t * t * endY;

    // Update glowing trajectory path draw length
    if (tracePath && pathTotalLength > 0) {
      const currentOffset = Math.max(0, pathTotalLength * (1 - progress));
      tracePath.style.strokeDashoffset = `${currentOffset}`;
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

    // Drop trailing light particle periodically during mid-flight
    if (progress > 0.12 && progress < 0.85 && now - lastParticleDrop > 60) {
      lastParticleDrop = now;
      dropTrailingParticle(currentX, currentY);
    }

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
        }, 340);
      }

      options.onComplete?.();
    }
  }

  requestAnimationFrame(step);
}

/**
 * Creates a subtle glowing trail particle behind the flying item
 */
function dropTrailingParticle(x: number, y: number) {
  const particle = document.createElement("div");
  particle.setAttribute("aria-hidden", "true");
  Object.assign(particle.style, {
    position: "fixed",
    left: `${x - 4}px`,
    top: `${y - 4}px`,
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#38BDF8",
    boxShadow: "0 0 8px #00AEEF",
    pointerEvents: "none",
    zIndex: "99998",
    opacity: "0.85",
    transition: "transform 0.35s ease-out, opacity 0.35s ease-out",
  });
  document.body.appendChild(particle);

  requestAnimationFrame(() => {
    particle.style.transform = "scale(0.2)";
    particle.style.opacity = "0";
  });

  setTimeout(() => {
    particle.remove();
  }, 380);
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
