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
        className="p-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all relative cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4 stroke-[2.5]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF6B6B] border border-black rounded-full flex items-center justify-center text-[8px] font-mono font-black text-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b-2 border-black dark:border-white flex justify-between items-center bg-[#FFE600] text-black">
            <h3 className="font-black text-xs uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-[11px] font-black hover:underline transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y-2 divide-black/10 dark:divide-white/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-bold flex flex-col items-center gap-1">
                <Bell className="w-8 h-8 text-black dark:text-white mb-1 stroke-[2]" />
                <p className="font-black text-black dark:text-white">ALL CAUGHT UP</p>
                <p className="text-zinc-500 font-medium">No new notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs cursor-pointer hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors ${!n.readAt ? 'bg-[#FEF08A]/40 dark:bg-zinc-800/80 font-bold' : ''}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-black dark:text-white">{n.title}</span>
                    {!n.readAt && <span className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-black shrink-0" />}
                  </div>
                  <div className="text-zinc-700 dark:text-zinc-300 text-[11px] font-medium leading-snug">{n.body}</div>
                  <div className="text-zinc-500 font-mono text-[10px] mt-1.5 font-bold">
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
