"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import Link from 'next/link';

function getStatusDotColor(statusName: string, customColor?: string) {
  if (customColor) return customColor;
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '#10b981'; // emerald
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '#f59e0b'; // amber
  if (name.includes('review') || name.includes('testing')) return '#a855f7'; // purple
  if (name.includes('todo') || name.includes('ready') || name.includes('unstarted')) return '#0ea5e9'; // sky
  return '#71717a'; // zinc-500
}

function PriorityIndicator({ priority }: { priority?: string }) {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FF6B6B] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        URGENT
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FB923C] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        HIGH
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FFE600] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        MED
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#38BDF8] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        LOW
      </span>
    );
  }
  return null;
}

function SortableIssueCard({ issue, projectSlug, projectId }: { issue: any, projectSlug: string, projectId: string }) {
  const { isViewer } = useProjectStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: issue.id,
    data: { type: 'Issue', issue },
    disabled: isViewer
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`p-3.5 mb-3 bg-white dark:bg-zinc-950 rounded-xl shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] border-2 border-black dark:border-white hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:hover:shadow-[5px_5px_0px_0px_#fff] transition-all select-none group ${isViewer ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <Link 
          href={`/projects/${projectId}/issues/${issue.sequenceId}`} 
          className="text-[11px] font-mono font-black text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-black dark:border-white hover:bg-[#FFE600] hover:text-black transition-colors"
          onClick={(e) => isDragging && e.preventDefault()}
        >
          {projectSlug}-{issue.sequenceId}
        </Link>
        <PriorityIndicator priority={issue.priority} />
      </div>

      <Link 
        href={`/projects/${projectId}/issues/${issue.sequenceId}`}
        className="text-xs font-bold text-black dark:text-white leading-snug hover:underline transition-colors block mb-2"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {issue.title}
      </Link>

      <div className="flex items-center justify-between pt-1.5 border-t border-black/10 dark:border-white/20 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {issue.cycle && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FEF08A] text-black border border-black truncate max-w-[110px]" title={issue.cycle.name}>
              {issue.cycle.name}
            </span>
          )}
          {issue.module && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#BAE6FD] text-black border border-black truncate max-w-[110px]" title={issue.module.name}>
              {issue.module.name}
            </span>
          )}
        </div>

        {issue.estimate !== null && issue.estimate !== undefined && (
          <span className="text-[10px] font-mono font-black text-black bg-[#FFE600] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
            {issue.estimate}P
          </span>
        )}
      </div>
    </div>
  );
}

function StatusColumn({ status, issues, projectSlug, projectId }: { status: any, issues: any[], projectSlug: string, projectId: string }) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: { type: 'Column', status }
  });

  const dotColor = getStatusDotColor(status.name, status.color);

  return (
    <div className="shrink-0 w-80 bg-[#FFFDF8] dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-3.5 flex flex-col h-full max-h-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
      <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b-2 border-black dark:border-white">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0 border border-black" style={{ backgroundColor: dotColor }} />
          <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-wider">
            {status.name}
          </h3>
        </div>
        <span className="text-xs font-mono font-black text-black bg-[#FFE600] px-2 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
          {issues.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[180px] p-0.5">
        <SortableContext id={status.id} items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(issue => (
            <SortableIssueCard key={issue.id} issue={issue} projectSlug={projectSlug} projectId={projectId} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function BoardView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];
  const [activeIssue, setActiveIssue] = React.useState<any | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'Issue') {
      setActiveIssue(active.data.current.issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id as string;
    const overId = over.id as string;
    const draggedIssue = issues.find(i => i.id === issueId);
    if (!draggedIssue) return;

    let newStatusId = statuses.find((s:any) => s.id === overId)?.id;
    let overIssue = issues.find(i => i.id === overId);

    if (!newStatusId && overIssue) {
      newStatusId = overIssue.statusId;
    }

    if (!newStatusId) return;

    let columnIssues = issues.filter(i => i.statusId === newStatusId).sort((a,b) => (a.position||0) - (b.position||0));
    
    if (draggedIssue.statusId === newStatusId) {
      columnIssues = columnIssues.filter(i => i.id !== issueId);
    }

    let newPosition = 0;

    if (newStatusId === overId) {
      newPosition = columnIssues.length > 0 ? (columnIssues[columnIssues.length - 1].position || 0) + 65536 : 65536;
    } else if (overIssue) {
      const isBelow = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
      
      const overIndex = columnIssues.findIndex(i => i.id === overId);
      const insertIndex = isBelow ? overIndex + 1 : overIndex;

      const prevIssue = columnIssues[insertIndex - 1];
      const nextIssue = columnIssues[insertIndex];

      if (prevIssue && nextIssue) {
        newPosition = (prevIssue.position + nextIssue.position) / 2;
      } else if (prevIssue) {
        newPosition = prevIssue.position + 65536;
      } else if (nextIssue) {
        newPosition = nextIssue.position / 2;
      } else {
        newPosition = 65536;
      }
    }

    if (draggedIssue.statusId !== newStatusId || draggedIssue.position !== newPosition) {
      updateIssueStatusAndPosition(issueId, newStatusId, newPosition);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4 items-start" style={{ height: 'calc(100vh - 220px)' }}>
        {statuses.map((status: any) => (
          <div key={status.id} className="shrink-0 w-80 bg-[#FFFDF8] dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-3.5 flex flex-col h-full max-h-full shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-wider px-1">
              {status.name}
            </h3>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4 items-start" style={{ height: 'calc(100vh - 220px)' }}>
        {statuses.map((status: any) => (
          <StatusColumn 
            key={status.id} 
            status={status} 
            issues={issues.filter(i => i.statusId === status.id)} 
            projectSlug={project.slug} 
            projectId={project.id}
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
        {activeIssue ? (
          <div className="p-3.5 bg-[#FFE600] text-black rounded-xl shadow-[8px_8px_0px_0px_#000] border-3 border-black rotate-2 scale-105">
            <span className="text-xs font-mono font-black">{project.slug}-{activeIssue.sequenceId}</span>
            <h4 className="text-xs font-black mt-1 leading-snug">{activeIssue.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
