"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Pause, StopCircle, Info, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, Spinner } from "@/components/ui";
import { MessageBubble, ChatInput, TypingIndicator } from "@/components/chat";
import { getSession, getMessages, addMessage, updateSession } from "@/lib/firebase/firestore";
import { getDifficultyInfo, cn } from "@/lib/utils";
import type { Session, Message } from "@/types";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function TrainingSessionPage({ params }: Props) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load session and messages
  useEffect(() => {
    async function loadSession() {
      if (!user) return;
      
      try {
        const sessionData = await getSession(sessionId);
        if (!sessionData || sessionData.userId !== user.uid) {
          router.push("/training");
          return;
        }
        
        setSession(sessionData);
        
        const messagesData = await getMessages(sessionId);
        setMessages(messagesData);
        
        // If no messages, initialize the conversation
        if (messagesData.length === 0 && !initialized) {
          setInitialized(true);
          await initializeConversation(sessionData);
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId, user, router, initialized]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize conversation with AI
  async function initializeConversation(sessionData: Session) {
    setSending(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "",
          history: [],
          mode: "training",
          scenario: sessionData.scenario,
          difficulty: sessionData.difficulty,
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        const aiMessage: Omit<Message, "id" | "timestamp"> = {
          role: "ai",
          content: data.message,
        };
        
        await addMessage(sessionId, aiMessage);
        setMessages([{ ...aiMessage, id: Date.now().toString(), timestamp: new Date() }]);
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
    } finally {
      setSending(false);
    }
  }

  // Send message
  async function handleSend(content: string) {
    if (!session) return;
    
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
      await addMessage(sessionId, { role: "user", content });

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
          mode: "training",
          scenario: session.scenario,
          difficulty: session.difficulty,
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
        
        await addMessage(sessionId, { role: "ai", content: data.message });
        setMessages((prev) => [...prev, aiMessage]);

        // Check if conversation should end
        if (data.isComplete) {
          await handleEnd();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  // Pause session
  async function handlePause() {
    await updateSession(sessionId, { status: "paused" });
    router.push("/dashboard");
  }

  // End session and analyze
  async function handleEnd() {
    await updateSession(sessionId, { 
      status: "completed", 
      completedAt: new Date() 
    });
    router.push(`/training/summary/${sessionId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">סשן לא נמצא</p>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(session.difficulty);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] -m-4 lg:-m-8">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-semibold text-[var(--text-primary)] text-sm md:text-base">
                {session.scenario.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="gold" size="sm">
                  רמה {session.difficulty}
                </Badge>
                <span className={cn("text-xs", difficultyInfo.color)}>
                  {difficultyInfo.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Info size={20} />
            </button>
            <Button variant="ghost" size="sm" onClick={handlePause}>
              <Pause size={18} />
              <span className="hidden md:inline">השהה</span>
            </Button>
            <Button variant="danger" size="sm" onClick={handleEnd}>
              <StopCircle size={18} />
              <span className="hidden md:inline">סיים</span>
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="max-w-4xl mx-auto mt-3 animate-fade-in">
            <Card variant="glass" padding="sm" hover={false}>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-muted)] mb-1">התפקיד שלך:</p>
                  <p className="text-[var(--text-primary)]">{session.scenario.userRole}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] mb-1">המטרה שלך:</p>
                  <p className="text-[var(--text-primary)]">{session.scenario.goal}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
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
            placeholder="כתוב את התשובה שלך..."
          />
        </div>
      </div>
    </div>
  );
}
