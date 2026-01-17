"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    spotlightColor?: string;
    borderColor?: string;
}

export const SpotlightCard = ({
    children,
    className,
    spotlightColor = "rgba(201, 162, 39, 0.15)", // Gold tint
    borderColor = "rgba(201, 162, 39, 0.4)", // Stronger gold border
    ...props
}: SpotlightCardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden transition-all duration-300",
                className
            )}
            {...props}
        >
            {/* Spotlight Gradient Layer */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 40%)`,
                }}
            />

            {/* Content Wrapper */}
            <div className="relative h-full w-full bg-[var(--bg-elevated)] rounded-[inherit]">
                {/* Inner Content Spotlight (softer) */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 bg-[var(--bg-elevated)]"
                    style={{
                        opacity,
                        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                    }}
                />
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};
