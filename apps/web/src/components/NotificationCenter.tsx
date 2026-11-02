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
        className="p-1.5 rounded-md text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#5E6AD2] rounded-full shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#141519] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-white/[0.06] flex justify-between items-center bg-[#111215]">
            <h3 className="font-semibold text-xs text-[#EDEDED] tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-[11px] font-medium text-[#8A8F98] hover:text-[#5E6AD2] transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8A8F98] flex flex-col items-center gap-1.5">
                <Bell className="w-6 h-6 text-[#4D535E] mb-1" />
                <p className="font-medium text-[#EDEDED]">All caught up</p>
                <p className="text-[#8A8F98]">No new notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs cursor-pointer hover:bg-white/[0.04] transition-colors ${!n.readAt ? 'bg-[#5E6AD2]/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-[#EDEDED]">{n.title}</span>
                    {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] shrink-0" />}
                  </div>
                  <div className="text-[#8A8F98] text-[11px] leading-snug">{n.body}</div>
                  <div className="text-[#626773] font-mono text-[10px] mt-1.5">
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
