"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CheckSquare, 
  Repeat, 
  Layers, 
  BookOpen, 
  FileText, 
  Settings,
} from "lucide-react";

interface ProjectNavProps {
  projectId: string;
  isViewer: boolean;
}

export default function ProjectNav({ projectId, isViewer }: ProjectNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "ISSUES", href: `/projects/${projectId}/issues`, icon: CheckSquare, dot: "bg-[#D32F2F]" },
    { label: "CYCLES", href: `/projects/${projectId}/cycles`, icon: Repeat, dot: "bg-[#1976D2]" },
    { label: "MODULES", href: `/projects/${projectId}/modules`, icon: Layers, dot: "bg-[#FBC02D]" },
    { label: "ADRS", href: `/projects/${projectId}/adrs`, icon: BookOpen, dot: "bg-[#D32F2F]" },
    { label: "RFCS", href: `/projects/${projectId}/rfcs`, icon: FileText, dot: "bg-[#1976D2]" },
  ];

  if (!isViewer) {
    navItems.push({ label: "SETTINGS", href: `/projects/${projectId}/settings`, icon: Settings, dot: "bg-[#FBC02D]" });
  }

  return (
    <nav className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 font-sans">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 border-2 text-xs font-black uppercase tracking-wider transition-all ${
              isActive
                ? "bg-[#121212] text-white dark:bg-white dark:text-[#121212] border-[#121212] dark:border-white shadow-[2px_2px_0px_#D32F2F]"
                : "border-[#121212]/30 dark:border-white/30 bg-white dark:bg-[#181A20] text-[#121212] dark:text-white hover:border-[#121212]"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${item.dot} inline-block`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
