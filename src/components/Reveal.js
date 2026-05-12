"use client";

import { useEffect, useRef } from "react";

const variants = {
  "fade-up": "reveal-fade-up",
  "fade-down": "reveal-fade-down",
  "fade-left": "reveal-fade-left",
  "fade-right": "reveal-fade-right",
  "scale-in": "reveal-scale-in",
  fade: "",
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const animClass = variants[variant] || variants["fade-up"];

  return (
    <div ref={ref} className={`reveal ${animClass} ${className}`}>
      {children}
    </div>
  );
}
