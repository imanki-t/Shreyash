"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Hash,
  Users,
  Shield,
  Smile,
} from "lucide-react";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  _id: string;
  sender: {
    name: string;
    codename: string;
    image?: string;
  };
  channelId: string;
  recipientCodename?: string;
  text: string;
  createdAt: string;
}

const CHANNELS = [
  { id: "general", name: "general", desc: "General community chatter" },
  { id: "gaming", name: "gaming", desc: "Clips, setups & high scores" },
  { id: "memes", name: "memes", desc: "Shitposts and reaction threads" },
];

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const { data: session } = useSession();
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Poll / Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?channelId=${activeChannel}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMessages().then(() => {
      setLoading(false);
      scrollToBottom();
    });

    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [isOpen, activeChannel]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages.length, isOpen, isMinimized]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      sender: {
        name: session?.user?.name || "Operative",
        codename: (session?.user as any)?.codename || session?.user?.name || "User",
        image: session?.user?.image || undefined,
      },
      channelId: activeChannel,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          channelId: activeChannel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? data.message : m))
          );
        }
      }
    } catch {
      // Keep optimistic message or retry
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white dark:bg-[#1a1a1b] border border-gray-300 dark:border-[#343536] rounded-t-xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
        isMinimized ? "h-12" : "h-[480px]"
      }`}
    >
      {/* Top Header */}
      <div className="bg-gray-100 dark:bg-[#272729] px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-[#343536] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-xs text-gray-900 dark:text-white">
            Community Chat
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
            #{activeChannel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Channel Bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#121417] border-b border-gray-200 dark:border-[#272729] overflow-x-auto text-[11px] shrink-0 scrollbar-none">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                  activeChannel === ch.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#272729]"
                }`}
              >
                <Hash className="w-3 h-3" />
                {ch.name}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white dark:bg-[#1a1a1b] text-xs">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#272729] flex items-center justify-center text-blue-500">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Welcome to #{activeChannel}!
                  </p>
                  <p className="text-[11px]">Be the first to start the conversation.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf =
                  session?.user &&
                  ((session.user as any).codename === msg.sender?.codename ||
                    session.user.name === msg.sender?.name);

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        u/{msg.sender?.codename || "Anonymous"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words ${
                        isSelf
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-gray-100 dark:bg-[#272729] text-gray-900 dark:text-gray-100 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-gray-50 dark:bg-[#272729] border-t border-gray-200 dark:border-[#343536] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 px-3 py-2 bg-white dark:bg-[#1a1a1b] border border-gray-300 dark:border-gray-700 rounded-full text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition cursor-pointer shrink-0"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
