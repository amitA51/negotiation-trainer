"use client";

import { useInView, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    gradient?: boolean;
}

export const TextReveal = ({
    text,
    className,
    delay = 0,
    duration = 0.5,
    gradient = false,
}: TextRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const chars = text.split("");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
                duration: duration,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(8px)",
        },
    };

    return (
        <motion.span
            ref={ref}
            style={{ display: "inline-block" }}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={cn("inline-block", className)}
        >
            {chars.map((char, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className={cn(
                        "inline-block",
                        gradient && "text-gradient-gold"
                    )}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </motion.span>
    );
};
