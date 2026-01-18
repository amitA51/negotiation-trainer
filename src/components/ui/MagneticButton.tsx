"use client";

import React, { useRef } from "react";
import { motion, useSpring, useTransform, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    strength?: number; // How strong the pull is (default 0.5)
    variant?: "primary" | "secondary" | "ghost" | "glass";
    size?: "sm" | "md" | "lg";
}

export const MagneticButton = ({
    children,
    className,
    strength = 0.5,
    variant = "primary",
    size = "md",
    ...props
}: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    // Motion values for position
    const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
    const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const moveX = (clientX - centerX) * strength;
        const moveY = (clientY - centerY) * strength;

        x.set(moveX);
        y.set(moveY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const variants = {
        primary: "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-black shadow-[0_0_0_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_var(--accent-glow)]",
        secondary: "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        glass: "glass-obsidian text-[var(--accent-light)] hover:border-[var(--accent)] hover:shadow-[0_0_15px_var(--accent-glow)]",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={cn(
                "relative inline-flex items-center justify-center font-medium rounded-xl cursor-pointer transition-colors duration-300",
                variants[variant],
                sizes[size],
                className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                {children}
            </span>

            {/* Internal Glow Effect */}
            {variant === 'primary' && (
                <motion.div
                    className="absolute inset-0 rounded-xl bg-white opacity-0 mix-blend-overlay transition-opacity duration-300 pointer-events-none"
                    style={{ opacity: useTransform(x, [-50, 0, 50], [0, 0.2, 0]) }}
                />
            )}
        </motion.button>
    );
};
