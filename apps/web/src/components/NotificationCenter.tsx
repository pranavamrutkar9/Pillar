"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

export default function NotificationCenter({ sessionToken }: { sessionToken?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!sessionToken) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    
    const socket: Socket = io({
      path: '/socket.io',
      withCredentials: true,
    });

    socket.on('notification.created', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [sessionToken]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.readAt) {
      try {
        await fetch(`${apiUrl}/api/notifications/${n.id}/read`, {
          method: 'PATCH',
          headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
        });
        setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, readAt: new Date().toISOString() } : notif));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    setIsOpen(false);

    if (n.metadata?.projectId && n.metadata?.issueId) {
      router.push(`/projects/${n.metadata.projectId}/issues?issueId=${n.metadata.issueId}`);
    } else if (n.metadata?.projectId) {
      router.push(`/projects/${n.metadata.projectId}/issues`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/60 dark:bg-zinc-900/40">
            <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 flex flex-col items-center gap-1">
                <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mb-1" />
                <p className="font-medium text-zinc-700 dark:text-zinc-300">All caught up</p>
                <p>No new notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${!n.readAt ? 'bg-zinc-50/70 dark:bg-zinc-900/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{n.title}</span>
                    {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  <div className="text-zinc-500 text-[11px] leading-snug">{n.body}</div>
                  <div className="text-zinc-400 font-mono text-[10px] mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
