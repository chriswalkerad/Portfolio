"use client";

import { useEffect, useState } from 'react';
import { getCollaborationManager, User } from '@/lib/collaboration';

interface UserPresenceProps {
  currentSlideId: number;
}

export function UserPresence({ currentSlideId }: UserPresenceProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();
    setCurrentUser(collaborationManager.getCurrentUser());

    const handleUserJoined = (user: User) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    };

    const handleUserLeft = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handlePresenceUpdate = (data: { userId: string; activeSlide: number }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, activeSlide: data.activeSlide }
          : user
      ));
    };

    collaborationManager.on('user_joined', handleUserJoined);
    collaborationManager.on('user_left', handleUserLeft);
    collaborationManager.on('user_presence_update', handlePresenceUpdate);

    // Broadcast current slide when it changes
    collaborationManager.broadcastUserPresence(currentSlideId);

    return () => {
      collaborationManager.off('user_joined', handleUserJoined);
      collaborationManager.off('user_left', handleUserLeft);
      collaborationManager.off('user_presence_update', handlePresenceUpdate);
    };
  }, [currentSlideId]);

  const activeUsers = users.filter(user => user.id !== currentUser?.id);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2">
      <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Collaborators ({activeUsers.length})
        </div>
        <div className="space-y-2">
          {activeUsers.map(user => (
            <div key={user.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.activeSlide === currentSlideId 
                    ? 'On this slide' 
                    : `On slide ${user.activeSlide || '?'}`
                  }
                </div>
              </div>
              {user.activeSlide === currentSlideId && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPresence;
