"use client";

import { useEffect, useState, useRef } from 'react';
import { getCollaborationManager, User } from '@/lib/collaboration';

interface CursorData {
  userId: string;
  user: User;
  x: number;
  y: number;
  lastUpdate: number;
}

interface UserCursorsProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function UserCursors({ canvasRef }: UserCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const lastBroadcast = useRef<number>(0);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();
    setCurrentUser(collaborationManager.getCurrentUser());

    const handleCursorUpdate = (data: { userId: string; cursor: { x: number; y: number } }) => {
      const users = collaborationManager.getActiveUsers();
      const user = users.find(u => u.id === data.userId);
      
      if (user && data.userId !== currentUser?.id) {
        setCursors(prev => new Map(prev.set(data.userId, {
          userId: data.userId,
          user,
          x: data.cursor.x,
          y: data.cursor.y,
          lastUpdate: Date.now(),
        })));
      }
    };

    const handleUserLeft = (userId: string) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
    };

    collaborationManager.on('user_cursor_update', handleCursorUpdate);
    collaborationManager.on('user_left', handleUserLeft);

    // Clean up old cursors every 5 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const newCursors = new Map();
        for (const [userId, cursor] of prev.entries()) {
          if (now - cursor.lastUpdate < 10000) { // Keep for 10 seconds
            newCursors.set(userId, cursor);
          }
        }
        return newCursors;
      });
    }, 5000);

    // Mouse move handler for broadcasting cursor position
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const now = Date.now();
      if (now - lastBroadcast.current < 100) return; // Throttle to 10 FPS
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only broadcast if cursor is within canvas bounds
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        collaborationManager.broadcastCursorPosition(x, y);
        lastBroadcast.current = now;
      }
    };

    // Add mouse move listener to the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      collaborationManager.off('user_cursor_update', handleCursorUpdate);
      collaborationManager.off('user_left', handleUserLeft);
      clearInterval(cleanupInterval);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [canvasRef, currentUser?.id]);

  return (
    <>
      {Array.from(cursors.values()).map(cursor => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none z-50 transition-all duration-75"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor pointer */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="drop-shadow-sm"
          >
            <path
              d="M2 2L8.5 8.5M8.5 8.5L5.5 12L8 14.5L11.5 8.5M8.5 8.5L18 2L12 18L8.5 8.5Z"
              fill={cursor.user.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          
          {/* User name label */}
          <div
            className="ml-3 -mt-1 px-2 py-1 text-xs font-medium text-white rounded-md whitespace-nowrap shadow-sm"
            style={{ backgroundColor: cursor.user.color }}
          >
            {cursor.user.name}
          </div>
        </div>
      ))}
    </>
  );
}

export default UserCursors;
