"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Spinner } from "@/components/ui";
import { MessageBubble, ChatInput, TypingIndicator } from "@/components/chat";
import { getConsultation, getConsultationMessages, addConsultationMessage } from "@/lib/firebase/firestore";
import type { Consultation, Message } from "@/types";

interface Props {
  params: Promise<{ consultationId: string }>;
}

export default function ConsultationChatPage({ params }: Props) {
  const { consultationId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load consultation and messages
  useEffect(() => {
    async function loadConsultation() {
      if (!user) return;
      
      try {
        const consultationData = await getConsultation(consultationId);
        if (!consultationData || consultationData.userId !== user.uid) {
          router.push("/consultation");
          return;
        }
        
        setConsultation(consultationData);
        
        const messagesData = await getConsultationMessages(consultationId);
        setMessages(messagesData);
        
        // If only one message (the initial situation), get AI response
        if (messagesData.length === 1 && !initialized) {
          setInitialized(true);
          await getInitialResponse(consultationData.situation);
        }
      } catch (error) {
        console.error("Error loading consultation:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConsultation();
  }, [consultationId, user, router, initialized]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get initial AI response
  async function getInitialResponse(situation: string) {
    setSending(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: situation,
          history: [],
          mode: "consultation",
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "ai",
          content: data.message,
          timestamp: new Date(),
        };
        
        await addConsultationMessage(consultationId, { role: "ai", content: data.message });
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error getting initial response:", error);
    } finally {
      setSending(false);
    }
  }

  // Send message
  async function handleSend(content: string) {
    if (!consultation) return;
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      // Save user message to Firestore
      await addConsultationMessage(consultationId, { role: "user", content });

      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode: "consultation",
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.message,
          timestamp: new Date(),
        };
        
        await addConsultationMessage(consultationId, { role: "ai", content: data.message });
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">ייעוץ לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] -m-4 lg:-m-8">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">ייעוץ אישי</h1>
              <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px] md:max-w-[400px]">
                {consultation.situation}
              </p>
            </div>
          </div>

          <Link href="/training">
            <Button variant="secondary" size="sm" icon={<Play size={18} />}>
              <span className="hidden md:inline">הרץ סימולציה</span>
              <span className="md:hidden">סימולציה</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              userName={user?.displayName || undefined}
              userAvatar={user?.photoURL}
            />
          ))}
          
          {sending && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSend}
            disabled={sending}
            placeholder="שאל שאלה או בקש עצה..."
            allowAttachments={true}
          />
        </div>
      </div>
    </div>
  );
}
