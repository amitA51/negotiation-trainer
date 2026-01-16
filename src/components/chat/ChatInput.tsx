"use client";

import { useState, useRef, KeyboardEvent, useId } from "react";
import { Send, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  allowAttachments?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "כתוב הודעה…",
  allowAttachments = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const handleSubmit = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon size={16} aria-hidden="true" />;
    }
    return <FileText size={16} aria-hidden="true" />;
  };

  return (
    <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3" role="list" aria-label="קבצים מצורפים">
          {attachments.map((file, index) => (
            <div
              key={index}
              role="listitem"
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-elevated)] rounded-full border border-[var(--border-subtle)]"
            >
              {getFileIcon(file)}
              <span className="text-sm text-[var(--text-secondary)] max-w-[150px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm"
                aria-label={`הסר קובץ ${file.name}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        {allowAttachments && (
          <>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="בחר קבצים לצירוף"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="צרף קובץ"
              className={cn(
                "p-3 rounded-[var(--radius-md)]",
                "transition-[background,color] duration-[var(--transition-fast)]",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Paperclip size={20} aria-hidden="true" />
            </button>
          </>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <label htmlFor="chat-message" className="sr-only">הודעה</label>
          <textarea
            id="chat-message"
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            aria-label="כתוב הודעה"
            className={cn(
              "w-full px-4 py-3 rounded-2xl resize-none",
              "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
              "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-subtle)]",
              "transition-[border-color,box-shadow] duration-[var(--transition-fast)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "max-h-[150px]"
            )}
          />
        </div>

        {/* Send Button */}
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="rounded-full w-12 h-12 p-0"
          aria-label="שלח הודעה"
        >
          <Send size={20} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
