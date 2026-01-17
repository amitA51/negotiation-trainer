"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import { TechniqueIndicator } from "@/components/ui/TechniqueIndicator";
import type { Message } from "@/types";
import type { DetectedTechnique } from "@/lib/techniques/detection";

interface MessageBubbleProps {
  message: Message;
  userName?: string;
  userAvatar?: string | null;
  detectedTechniques?: DetectedTechnique[];
}

export function MessageBubble({ message, userName, userAvatar, detectedTechniques }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up message-list-item",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          <Avatar src={userAvatar} name={userName} size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
            <span className="text-xs font-bold text-black">N</span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex flex-col">
        <div
          className={cn(
            "max-w-[80%] md:max-w-[70%] px-4 py-3",
            isUser
              ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-black rounded-2xl rounded-br-sm"
              : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        {/* Detected Techniques - only for user messages */}
        {isUser && detectedTechniques && detectedTechniques.length > 0 && (
          <div className="flex justify-end mt-1">
            <TechniqueIndicator techniques={detectedTechniques} />
          </div>
        )}
      </div>
    </div>
  );
}
