"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCollaborationManager } from '@/lib/collaboration';

interface Conflict {
  resourceId: string;
  resourceType: 'slide' | 'block';
  conflictingUser: string;
  timestamp: number;
}

export function ConflictResolution() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();

    const handleConflictDetected = (conflict: Conflict) => {
      setConflicts(prev => [...prev.filter(c => c.resourceId !== conflict.resourceId), conflict]);
    };

    const handleConflictResolved = (data: { resourceId: string }) => {
      setConflicts(prev => prev.filter(c => c.resourceId !== data.resourceId));
    };

    collaborationManager.on('conflict_detected', handleConflictDetected);
    collaborationManager.on('conflict_resolved', handleConflictResolved);

    return () => {
      collaborationManager.off('conflict_detected', handleConflictDetected);
      collaborationManager.off('conflict_resolved', handleConflictResolved);
    };
  }, []);

  const resolveConflict = (resourceId: string, resolution: 'accept' | 'reject') => {
    const collaborationManager = getCollaborationManager();
    collaborationManager.resolveConflict(resourceId, resolution);
    setConflicts(prev => prev.filter(c => c.resourceId !== resourceId));
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      {conflicts.map(conflict => (
        <div
          key={conflict.resourceId}
          className="bg-white border-2 border-red-500 rounded-lg shadow-xl p-6 max-w-md mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-white"
              >
                <path
                  d="M8 1L15 15H1L8 1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="13" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Editing Conflict Detected</h3>
              <p className="text-sm text-red-600">
                Another user was editing this {conflict.resourceType} at the same time.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>{conflict.conflictingUser}</strong> made changes to this {conflict.resourceType} 
              at the same time as you. Choose how to resolve this conflict:
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => resolveConflict(conflict.resourceId, 'accept')}
              className="flex-1"
              variant="outline"
            >
              Keep Their Changes
            </Button>
            <Button
              onClick={() => resolveConflict(conflict.resourceId, 'reject')}
              className="flex-1"
              variant="default"
            >
              Keep My Changes
            </Button>
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Conflict occurred at {new Date(conflict.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConflictResolution;
