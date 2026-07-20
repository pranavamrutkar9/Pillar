"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { updateIssueAction, moveIssueAction } from "../actions/issueActions";
import { io, Socket } from "socket.io-client";

type ProjectStoreContextType = {
  project: any;
  issues: any[];
  setIssues: React.Dispatch<React.SetStateAction<any[]>>;
  updateIssueStatusAndPosition: (issueId: string, newStatusId: string, position: number) => Promise<void>;
  activeUsers: any[];
  isViewer?: boolean;
};

const ProjectStoreContext = createContext<ProjectStoreContextType | null>(null);

export function ProjectStoreProvider({ 
  project, 
  initialIssues,
  currentUser,
  isViewer,
  children 
}: { 
  project: any, 
  initialIssues: any[],
  currentUser?: any,
  isViewer?: boolean,
  children: React.ReactNode 
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  useEffect(() => {
    // Connect to Socket.io server with credentials for JWT auth
    // Using an empty string makes it connect to the same origin (Next.js server)
    // which will then proxy it to the backend via next.config.ts rewrites.
    // This completely bypasses cross-origin cookie blocking in Incognito mode!
    const socket: Socket = io({
      path: '/socket.io',
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to realtime server');
      if (currentUser) {
        socket.emit('join-project', project.id, currentUser.id);
      }
    });

    socket.on('presence.updated', (data) => {
      setActiveUsers(current => {
        if (data.status === 'online') {
          if (!current.find(u => u.id === data.userId)) {
            return [...current, { id: data.userId }];
          }
        } else if (data.status === 'offline') {
          return current.filter(u => u.id !== data.userId);
        }
        return current;
      });
    });

    socket.on('presence.sync', (userIds: string[]) => {
      setActiveUsers(userIds.map(id => ({ id })));
    });

    // Listen for realtime events from BullMQ -> Socket.io
    socket.on('issue.updated', (data) => {
      console.log('Realtime issue update:', data);
      
      setIssues(current => 
        current.map(issue => {
          if (issue.id === data.issueId) {
            return {
              ...issue,
              ...data.changes,
              ...(data.changes.statusId ? { status: project.issueStatuses.find((s:any) => s.id === data.changes.statusId) } : {})
            };
          }
          return issue;
        })
      );
    });

    socket.on('issue.moved', (data) => {
      console.log('Realtime issue moved:', data);
      setIssues(current => 
        current.map(issue => {
          if (issue.id === data.issueId) {
            return {
              ...issue,
              ...data.changes,
              status: project.issueStatuses.find((s:any) => s.id === data.changes.statusId)
            };
          }
          return issue;
        }).sort((a, b) => (a.position || 0) - (b.position || 0))
      );
    });
    
    socket.on('issue.created', (data) => {
      console.log('Realtime issue created:', data);
      if (data.issue) {
        setIssues(current => {
          if (current.find(i => i.id === data.issue.id)) return current;
          return [
            {
              ...data.issue,
              status: project.issueStatuses?.find((s:any) => s.id === data.issue.statusId)
            },
            ...current
          ].sort((a, b) => (a.position || 0) - (b.position || 0));
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [project.id, project.issueStatuses, currentUser]);
  
  const updateIssueStatusAndPosition = useCallback(async (issueId: string, newStatusId: string, position: number) => {
    const previousIssues = [...issues];
    
    // Optimistic update
    setIssues(current => 
      current.map(issue => 
        issue.id === issueId ? { 
          ...issue, 
          statusId: newStatusId, 
          position,
          status: project.issueStatuses.find((s:any) => s.id === newStatusId) 
        } : issue
      ).sort((a, b) => (a.position || 0) - (b.position || 0)) // Sort by new position
    );

    try {
      await moveIssueAction(project.id, issueId, { statusId: newStatusId, position });
    } catch (error) {
      console.error("Failed to update issue status", error);
      // Revert on failure
      setIssues(previousIssues);
    }
  }, [issues, project.id, project.issueStatuses]);

  return (
    <ProjectStoreContext.Provider value={{
      project,
      issues,
      setIssues,
      updateIssueStatusAndPosition,
      activeUsers,
      isViewer
    }}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return context;
}
