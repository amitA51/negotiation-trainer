"use client";

import { cn } from "@/lib/utils";
import { SpotlightCard } from "./SpotlightCard";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    onClick,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
}) => {
    return (
        <SpotlightCard
            className={cn(
                "row-span-1 border-white/10 transition duration-200 hover:shadow-xl p-0 cursor-pointer group/bento justify-between flex flex-col space-y-4",
                className
            )}
            onClick={onClick}
        >
            <div className="h-full flex flex-col">
                {header}
                <div className="group-hover/bento:translate-x-2 transition duration-200 p-4">
                    {icon}
                    <div className="font-bold text-neutral-200 mb-2 mt-2">
                        {title}
                    </div>
                    <div className="font-normal text-neutral-400 text-xs">
                        {description}
                    </div>
                </div>
            </div>
        </SpotlightCard>
    );
};
