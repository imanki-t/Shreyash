"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  ThumbsUp,
  MessageSquare,
  Award,
  Shield,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  recipient: string;
  actor: {
    codename: string;
    image?: string;
  };
  type: "upvote" | "comment" | "reply" | "award" | "system" | "welcome";
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onCountUpdate?: (count: number) => void;
}

export default function NotificationPopover({
  isOpen,
  onClose,
  onCountUpdate,
}: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const list: NotificationItem[] = data.notifications || [];
        setNotifications(list);
        const unread = list.filter((n) => !n.isRead).length;
        if (onCountUpdate) onCountUpdate(unread);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onCountUpdate) onCountUpdate(0);
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
      if (onCountUpdate) onCountUpdate(0);
    } catch {}
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif._id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }
    onClose();
  };

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "upvote":
        return <ThumbsUp className="w-3.5 h-3.5 text-orange-500" />;
      case "comment":
      case "reply":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case "award":
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      case "system":
        return <Shield className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-green-500" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[460px] animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#343536] flex items-center justify-between bg-gray-50/70 dark:bg-[#272729]/70 shrink-0">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">
            Notifications
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {notifications.length > 0 && (
            <>
              <button
                onClick={handleMarkAllRead}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                Read
              </button>
              <button
                onClick={handleClearAll}
                className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#272729]">
        {loading && notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 space-y-2">
            <Bell className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              You have no notifications right now
            </p>
            <p className="text-[11px]">
              Replies, upvotes, and mentions will show up here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n._id}
              href={n.link || "/home"}
              onClick={() => handleItemClick(n)}
              className={`p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-[#272729] transition cursor-pointer ${
                !n.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-[#272729] shrink-0 mt-0.5">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {n.message}
                </p>
                <div className="text-[10px] text-gray-400 pt-0.5">
                  {new Date(n.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
