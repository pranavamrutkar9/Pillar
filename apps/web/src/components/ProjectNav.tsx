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
  GitPullRequest
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
    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all border-2 ${
              isActive
                ? "bg-[#FFE600] text-black border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5"
                : "bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5"
            }`}
          >
            <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
