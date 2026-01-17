"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeValues = {
    sm: { class: "w-8 h-8 text-xs", pixels: 32 },
    md: { class: "w-10 h-10 text-sm", pixels: 40 },
    lg: { class: "w-12 h-12 text-base", pixels: 48 },
    xl: { class: "w-16 h-16 text-xl", pixels: 64 },
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeInfo = sizeValues[size];
  const altText = name ? `תמונת פרופיל של ${name}` : "תמונת פרופיל";

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden",
          "border-2 border-[var(--border-subtle)]",
          sizeInfo.class,
          className
        )}
      >
        <Image
          src={src}
          alt={altText}
          width={sizeInfo.pixels}
          height={sizeInfo.pixels}
          className="object-cover w-full h-full"
          unoptimized={src.startsWith("data:") || src.includes("googleusercontent.com")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full",
        "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)]",
        "flex items-center justify-center",
        "font-semibold text-black",
        sizeInfo.class,
        className
      )}
      role="img"
      aria-label={altText}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}
