"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we are on a touch device. If so, disable the custom cursor for UX
    if (typeof window !== "undefined") {
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) return;
    }

    const outer = outerRef.current;
    const inner = innerRef.current;

    // Safety check: if refs are not bound, exit early
    if (!outer || !inner) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    // Set initial positions
    gsap.set([outer, inner], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Lerp animation loop for smooth trailing effect
    const tick = () => {
      // Linear interpolation (lerp)
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      // Inner dot follows mouse instantly
      gsap.set(inner, { x: mouseX, y: mouseY });
      // Outer ring trails behind smoothly
      gsap.set(outer, { x: currentX, y: currentY });

      requestAnimationFrame(tick);
    };

    const animFrame = requestAnimationFrame(tick);

    // Global magnetic event handler using event delegation
    const handleMouseOver = (e) => {
      const target = e.target.closest("a, button, [role='button'], .interactive-hover, .tilt-card-trigger");
      if (target) {
        // Scale up outer cursor ring and apply orange glowing style
        gsap.to(outer, {
          scale: 2.2,
          borderColor: "#FF7A00",
          backgroundColor: "rgba(255, 122, 0, 0.08)",
          boxShadow: "0 0 15px rgba(255, 122, 0, 0.4)",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(inner, {
          scale: 0.5,
          backgroundColor: "#FF7A00",
          duration: 0.2,
        });

        // Apply magnetic pull effect on the hovered element
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const onElementMove = (event) => {
          const xOffset = (event.clientX - centerX) * 0.35;
          const yOffset = (event.clientY - centerY) * 0.35;

          gsap.to(target, {
            x: xOffset,
            y: yOffset,
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const onElementLeave = () => {
          // Reset cursor styles
          gsap.to(outer, {
            scale: 1,
            borderColor: "rgba(255, 255, 255, 0.3)",
            backgroundColor: "transparent",
            boxShadow: "none",
            duration: 0.35,
            ease: "power2.out",
          });
          gsap.to(inner, {
            scale: 1,
            backgroundColor: "#FF7A00",
            duration: 0.2,
          });

          // Animate interactive target back to center with rubber-band elastic release
          gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1.2, 0.5)",
          });

          target.removeEventListener("mousemove", onElementMove);
          target.removeEventListener("mouseleave", onElementLeave);
        };

        target.addEventListener("mousemove", onElementMove);
        target.addEventListener("mouseleave", onElementLeave);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    // Hide custom cursor when mouse leaves screen viewport boundaries
    const handleMouseLeaveViewport = () => {
      setIsVisible(false);
    };
    const handleMouseEnterViewport = () => {
      setIsVisible(true);
    };

    document.addEventListener("mouseleave", handleMouseLeaveViewport);
    document.addEventListener("mouseenter", handleMouseEnterViewport);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeaveViewport);
      document.removeEventListener("mouseenter", handleMouseEnterViewport);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Outer trailing halo */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/30 pointer-events-none z-[9999] transition-opacity duration-300"
        style={{
          boxSizing: "border-box",
          transform: "translate(-50%, -50%)",
          opacity: isVisible ? 1 : 0,
        }}
      />
      {/* Inner precise dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#FF7A00] pointer-events-none z-[9999] transition-opacity duration-300"
        style={{
          boxSizing: "border-box",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 8px rgba(255, 122, 0, 0.6)",
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
