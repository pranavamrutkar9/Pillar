"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import Link from 'next/link';

function getStatusGeometricIcon(statusName: string) {
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) {
    return { symbol: '●', color: '#D32F2F', label: 'COMPLETE' };
  }
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) {
    return { symbol: '▲', color: '#FBC02D', label: 'ACTIVE' };
  }
  if (name.includes('review') || name.includes('testing')) {
    return { symbol: '◆', color: '#1976D2', label: 'REVIEW' };
  }
  return { symbol: '■', color: '#1976D2', label: 'PLANNED' };
}

function PriorityIndicator({ priority }: { priority?: string }) {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-white bg-[#D32F2F] px-1.5 py-0.5 border border-[#121212]">
        <span>●</span>
        <span>URGENT</span>
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#121212] bg-[#FBC02D] px-1.5 py-0.5 border border-[#121212]">
        <span>▲</span>
        <span>HIGH</span>
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-white bg-[#1976D2] px-1.5 py-0.5 border border-[#121212]">
        <span>■</span>
        <span>MED</span>
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#121212] bg-[#FAF6EE] px-1.5 py-0.5 border border-[#121212]">
        <span>-</span>
        <span>LOW</span>
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
    opacity: isDragging ? 0.35 : 1
  };

  const p = (issue.priority || '').toUpperCase();
  const borderStripe = p === 'URGENT' ? 'border-l-4 border-l-[#D32F2F]' :
                       p === 'HIGH' ? 'border-l-4 border-l-[#FBC02D]' :
                       p === 'MEDIUM' ? 'border-l-4 border-l-[#1976D2]' : 'border-l-4 border-l-[#121212]';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`p-3.5 mb-2.5 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white shadow-[3px_3px_0px_#121212] dark:shadow-[3px_3px_0px_#FFF] hover:shadow-[1px_1px_0px_#121212] hover:translate-x-[1px] hover:translate-y-[1px] transition-all select-none group ${borderStripe} ${isViewer ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <Link 
          href={`/projects/${projectId}/issues/${issue.sequenceId}`} 
          className="text-[10px] font-mono font-black text-[#121212] dark:text-white bg-[#FAF6EE] dark:bg-[#222] px-1.5 py-0.5 border border-[#121212] dark:border-white hover:bg-[#FBC02D] transition-colors"
          onClick={(e) => isDragging && e.preventDefault()}
        >
          {projectSlug}-{issue.sequenceId}
        </Link>
        <PriorityIndicator priority={issue.priority} />
      </div>

      <Link 
        href={`/projects/${projectId}/issues/${issue.sequenceId}`}
        className="text-xs font-black uppercase tracking-tight text-[#121212] dark:text-white leading-snug hover:text-[#D32F2F] transition-colors block mb-2"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {issue.title}
      </Link>

      <div className="flex items-center justify-between pt-2 border-t border-[#121212]/20 dark:border-white/20 text-[10px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {issue.cycle && (
            <span className="font-mono font-bold uppercase text-[9px] px-1 bg-[#1976D2] text-white border border-[#121212]">
              {issue.cycle.name}
            </span>
          )}
          {issue.module && (
            <span className="font-mono font-bold uppercase text-[9px] px-1 bg-[#FBC02D] text-[#121212] border border-[#121212]">
              {issue.module.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {issue.estimate !== null && issue.estimate !== undefined && (
            <span className="font-mono font-black text-[9px] px-1 bg-[#FAF6EE] dark:bg-[#222] text-[#121212] dark:text-white border border-[#121212]">
              {issue.estimate}PT
            </span>
          )}
          {issue.assignee && (
            <div 
              className="w-4 h-4 bg-[#D32F2F] text-white border border-[#121212] flex items-center justify-center text-[9px] font-black uppercase" 
              title={issue.assignee.username || issue.assignee.email}
            >
              {(issue.assignee.username || issue.assignee.email)[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ status, issues, projectSlug, projectId }: { status: any, issues: any[], projectSlug: string, projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { type: 'Column', status }
  });

  const geo = getStatusGeometricIcon(status.name);

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col flex-shrink-0 w-80 max-h-full border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#111215] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] transition-colors ${
        isOver ? 'ring-2 ring-[#D32F2F]' : ''
      }`}
    >
      {/* Bauhaus Column Header */}
      <div className="p-3 border-b-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black" style={{ color: geo.color }}>{geo.symbol}</span>
          <h2 className="font-black text-xs uppercase tracking-wider text-[#121212] dark:text-white">
            {status.name}
          </h2>
        </div>
        <span className="text-[10px] font-mono font-black text-white bg-[#121212] dark:bg-white dark:text-[#121212] px-2 py-0.5">
          {issues.length}
        </span>
      </div>

      {/* Cards Scrollable Body */}
      <div className="p-2.5 flex-1 overflow-y-auto min-h-[140px]">
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(issue => (
            <SortableIssueCard 
              key={issue.id} 
              issue={issue} 
              projectSlug={projectSlug} 
              projectId={projectId} 
            />
          ))}
        </SortableContext>
        {issues.length === 0 && (
          <div className="h-20 border-2 border-dashed border-[#121212]/30 dark:border-white/30 flex items-center justify-center text-[10px] font-black uppercase text-neutral-400">
            EMPTY STAGE
          </div>
        )}
      </div>
    </div>
  );
}

export default function BoardView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition, isViewer } = useProjectStore();
  const [activeIssue, setActiveIssue] = React.useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    if (isViewer) return;
    const { active } = event;
    const issue = issues.find(i => i.id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isViewer) return;
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id as string;
    let targetStatusId: string | null = null;

    if (over.data.current?.type === 'Column') {
      targetStatusId = over.id as string;
    } else if (over.data.current?.type === 'Issue') {
      targetStatusId = over.data.current.issue.statusId;
    }

    if (targetStatusId) {
      const issue = issues.find(i => i.id === issueId);
      if (issue && issue.statusId !== targetStatusId) {
        updateIssueStatusAndPosition(issueId, targetStatusId, 0);
      }
    }
  };

  const statuses = project.issueStatuses || [];

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {statuses.map((status: any) => {
          const colIssues = issues.filter(i => i.statusId === status.id);
          return (
            <DroppableColumn 
              key={status.id} 
              status={status} 
              issues={colIssues} 
              projectSlug={project.slug} 
              projectId={project.id} 
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeIssue ? (
          <div className="p-3.5 bg-white dark:bg-[#181A20] border-3 border-[#D32F2F] shadow-[6px_6px_0px_#121212] w-72">
            <div className="text-[10px] font-mono font-black text-[#D32F2F] mb-1">
              {project.slug}-{activeIssue.sequenceId}
            </div>
            <div className="text-xs font-black uppercase text-[#121212] dark:text-white">
              {activeIssue.title}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
