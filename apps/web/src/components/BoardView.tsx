"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import Link from 'next/link';

function SortableIssueCard({ issue, projectSlug }: { issue: any, projectSlug: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: issue.id,
    data: { type: 'Issue', issue }
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="p-3 mb-2 bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-zinc-500">{projectSlug}-{issue.sequenceId}</span>
      </div>
      <h4 className="text-sm font-semibold mt-1 text-zinc-800 dark:text-zinc-200">{issue.title}</h4>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {issue.priority || 'No Priority'}
        </span>
      </div>
    </div>
  );
}

function StatusColumn({ status, issues, projectSlug }: { status: any, issues: any[], projectSlug: string }) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: { type: 'Column', status }
  });

  return (
    <div className="flex-shrink-0 w-72 bg-zinc-100/80 dark:bg-zinc-950/50 rounded-xl p-3 flex flex-col h-full max-h-full">
      <h3 className="font-semibold text-sm mb-3 flex items-center justify-between text-zinc-700 dark:text-zinc-300 px-1">
        {status.name}
        <span className="bg-zinc-200/50 dark:bg-zinc-800/50 text-xs px-2 py-0.5 rounded-full">{issues.length}</span>
      </h3>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] p-1">
        <SortableContext id={status.id} items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(issue => (
            <SortableIssueCard key={issue.id} issue={issue} projectSlug={projectSlug} />
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
    
    // If it's the same column, remove the dragged issue first before recalculating
    if (draggedIssue.statusId === newStatusId) {
      columnIssues = columnIssues.filter(i => i.id !== issueId);
    }

    let newPosition = 0;

    if (newStatusId === overId) {
      // Dropped on the column itself (append to end)
      newPosition = columnIssues.length > 0 ? (columnIssues[columnIssues.length - 1].position || 0) + 65536 : 65536;
    } else if (overIssue) {
      // Dropped on another item. We'll insert it after if dragged down, or before if dragged up.
      // A simple approximation is to use the active and over rects.
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
      <div className="flex space-x-4 overflow-x-auto pb-4 items-start" style={{ height: 'calc(100vh - 250px)' }}>
        {statuses.map((status: any) => (
          <div key={status.id} className="flex-shrink-0 w-72 bg-zinc-100/80 dark:bg-zinc-950/50 rounded-xl p-3 flex flex-col h-full max-h-full">
            <h3 className="font-semibold text-sm mb-3 flex items-center justify-between text-zinc-700 dark:text-zinc-300 px-1">
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
      <div className="flex space-x-4 overflow-x-auto pb-4 items-start" style={{ height: 'calc(100vh - 250px)' }}>
        {statuses.map((status: any) => (
          <StatusColumn 
            key={status.id} 
            status={status} 
            issues={issues.filter(i => i.statusId === status.id)} 
            projectSlug={project.slug} 
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
        {activeIssue ? (
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-300 dark:border-zinc-700 opacity-90 rotate-2">
            <span className="text-xs font-medium text-zinc-500">{project.slug}-{activeIssue.sequenceId}</span>
            <h4 className="text-sm font-semibold mt-1">{activeIssue.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
