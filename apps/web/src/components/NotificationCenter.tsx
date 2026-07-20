"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
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
    
    // Connect to Socket.io for real-time notifications
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
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
            <h3 className="font-medium text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p>You're all caught up!</p>
                <p className="text-xs text-zinc-400">No new notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-b border-zinc-100 dark:border-zinc-800/50 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!n.readAt ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{n.title}</div>
                  <div className="text-zinc-500 mt-1">{n.body}</div>
                  <div className="text-zinc-400 text-xs mt-2">
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
