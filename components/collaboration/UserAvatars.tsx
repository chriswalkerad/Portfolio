"use client";

import { useEffect, useState } from 'react';
import { getCollaborationManager, User } from '@/lib/collaboration';

interface UserAvatarsProps {
  showSlideIndicator?: boolean;
  currentSlideId?: number;
  slideId?: number;
  position?: 'header' | 'slide';
}

export function UserAvatars({ 
  showSlideIndicator = false, 
  currentSlideId, 
  slideId,
  position = 'header' 
}: UserAvatarsProps) {
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

    return () => {
      collaborationManager.off('user_joined', handleUserJoined);
      collaborationManager.off('user_left', handleUserLeft);
      collaborationManager.off('user_presence_update', handlePresenceUpdate);
    };
  }, []);

  // Filter users based on position
  let displayUsers = users.filter(user => user.id !== currentUser?.id);
  
  if (position === 'slide' && slideId) {
    // Show only users viewing this specific slide
    displayUsers = displayUsers.filter(user => user.activeSlide === slideId);
  }

  if (displayUsers.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (position === 'header') {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-2">
          {displayUsers.length} online
        </span>
        <div className="flex -space-x-2">
          {displayUsers.slice(0, 5).map((user, index) => (
            <div
              key={user.id}
              className="relative"
              style={{ zIndex: displayUsers.length - index }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium text-white cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: user.color }}
                title={`${user.name}${showSlideIndicator && user.activeSlide ? ` - Slide ${user.activeSlide}` : ''}`}
              >
                {getInitials(user.name)}
              </div>
              {showSlideIndicator && user.activeSlide === currentSlideId && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full animate-pulse" />
              )}
            </div>
          ))}
          {displayUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
              +{displayUsers.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (position === 'slide') {
    return (
      <div className="absolute top-2 right-2 z-10">
        <div className="flex -space-x-1">
          {displayUsers.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className="relative"
              style={{ zIndex: displayUsers.length - index }}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: user.color }}
                title={`${user.name} is viewing this slide`}
              >
                {getInitials(user.name)}
              </div>
            </div>
          ))}
          {displayUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
              +{displayUsers.length - 3}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default UserAvatars;
