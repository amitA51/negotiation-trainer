"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundEffects = () => {
  // Mouse Torch Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the torch
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const gradient = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, rgba(201, 162, 39, 0.08), transparent 80%)`;

  useEffect(() => {
    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[var(--bg-primary)]">
      {/* Deep Ambient Aurora Layers */}
      <div className="absolute inset-0 opacity-40">
        {/* Top Left - Gold/Orange */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] mix-blend-screen"
          style={{ background: "radial-gradient(circle, var(--accent-dark), transparent 70%)" }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Bottom Right - Indigo/Purple (Contrast) */}
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] mix-blend-screen"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }}
          animate={{
            x: [0, -40, 0],
            y: [0, -60, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Center/Moving - Accent Light */}
        <motion.div
          className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[100px] mix-blend-screen"
          style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Mouse Torch Layer */}
      <motion.div
        className="absolute inset-0 z-10 opacity-100 mix-blend-screen"
        style={{ background: gradient }}
      />

      {/* Vignette for cinematic depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-primary)_120%)] opacity-80" />

      {/* Fine Noise Texture is handled in globals.css per design system */}
    </div>
  );
};
