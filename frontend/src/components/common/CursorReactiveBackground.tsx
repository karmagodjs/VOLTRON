"use client";

import React, { useEffect, useRef } from "react";

export default function CursorReactiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion or is on a touch device
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    let animationFrameId: number;

    // Target positions (from mouse event)
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let targetOpacity = 0;

    // Current interpolated positions
    let currentX = targetX;
    let currentY = targetY;
    let currentOpacity = 0;

    // Parallax targets
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetOpacity = 1;

      // Calculate subtle parallax offset (-4px to +4px)
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetParallaxX = ((e.clientX - centerX) / centerX) * -4;
      targetParallaxY = ((e.clientY - centerY) / centerY) * -4;
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
      targetParallaxX = 0;
      targetParallaxY = 0;
    };

    const handleMouseEnter = () => {
      targetOpacity = 1;
    };

    // Smooth 60 FPS animation loop with lerp (linear interpolation)
    const animate = () => {
      const lerpFactor = 0.08;

      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;
      currentOpacity += (targetOpacity - currentOpacity) * lerpFactor;

      currentParallaxX += (targetParallaxX - currentParallaxX) * lerpFactor;
      currentParallaxY += (targetParallaxY - currentParallaxY) * lerpFactor;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        glowRef.current.style.opacity = currentOpacity.toFixed(3);
      }

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${currentParallaxX.toFixed(2)}px, ${currentParallaxY.toFixed(2)}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Subtle Interactive Parallax Grid */}
      <div
        ref={gridRef}
        className="absolute -inset-4 grid-bg opacity-70 will-change-transform"
      />

      {/* 2. Soft Cursor-Reactive Volatility Glow (Follows Mouse with Physics Lerp) */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0 -ml-[250px] -mt-[250px] w-[500px] h-[500px] rounded-full blur-[90px] opacity-0 pointer-events-none will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--voltron-cyan-rgb) / 0.14) 0%, rgba(var(--voltron-cyan-rgb) / 0.05) 40%, transparent 70%)",
        }}
      />

      {/* 3. Faint Quantitative Volatility Wave Traces (Slow Moving Field) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.05] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100,450 C300,380 600,520 950,420 C1200,350 1400,480 1600,440"
          stroke="rgb(var(--voltron-cyan-rgb))"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          className="animate-pulse-slow"
        />
        <path
          d="M-100,520 C350,460 700,600 1050,490 C1300,410 1500,540 1650,500"
          stroke="rgb(var(--voltron-emerald-rgb))"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="animate-pulse-slow"
          style={{ animationDuration: "6s" }}
        />
        <path
          d="M-50,300 C400,220 800,360 1200,280 C1400,240 1550,320 1650,290"
          stroke="rgb(var(--voltron-cyan-rgb))"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
}
