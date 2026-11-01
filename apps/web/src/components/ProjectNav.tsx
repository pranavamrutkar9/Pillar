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
    { label: "Issues", href: `/projects/${projectId}/issues`, icon: CheckSquare },
    { label: "Cycles", href: `/projects/${projectId}/cycles`, icon: Repeat },
    { label: "Modules", href: `/projects/${projectId}/modules`, icon: Layers },
    { label: "ADRs", href: `/projects/${projectId}/adrs`, icon: BookOpen },
    { label: "RFCs", href: `/projects/${projectId}/rfcs`, icon: FileText },
  ];

  if (!isViewer) {
    navItems.push({ label: "Settings", href: `/projects/${projectId}/settings`, icon: Settings });
  }

  return (
    <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1 font-sans">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#818CF8]" : "text-zinc-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
