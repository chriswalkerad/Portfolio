"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCollaborationManager } from '@/lib/collaboration';

interface UserSetupProps {
  onUserReady: () => void;
}

export function UserSetup({ onUserReady }: UserSetupProps) {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Try to get stored user info
    const storedName = localStorage.getItem('cc_user_name');
    const storedProject = localStorage.getItem('cc_project_id');
    
    if (storedName) setName(storedName);
    if (storedProject) setProjectId(storedProject);
  }, []);

  const joinProject = async () => {
    if (!name.trim() || !projectId.trim()) return;
    
    setIsJoining(true);
    
    try {
      const collaborationManager = getCollaborationManager();
      
      // Store for next time
      localStorage.setItem('cc_user_name', name);
      localStorage.setItem('cc_project_id', projectId);
      
      await collaborationManager.joinProject(projectId, {
        name: name.trim(),
        email: `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`, // Demo email
      });
      
      setIsConnected(true);
      onUserReady();
    } catch (error) {
      console.error('Failed to join project:', error);
      alert('Failed to join project. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const generateProjectId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setProjectId(`PROJECT-${randomId}`);
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Collaboration
          </h2>
          <p className="text-gray-600">
            Enter your details to start collaborating in real-time
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <div className="flex gap-2">
              <Input
                id="projectId"
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID or generate one"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateProjectId}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this ID with collaborators to work together
            </p>
          </div>

          <Button
            onClick={joinProject}
            disabled={!name.trim() || !projectId.trim() || isJoining}
            className="w-full"
          >
            {isJoining ? 'Joining...' : 'Join Project'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Collaboration Features:
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Real-time editing with other users</li>
            <li>• See live cursors and user presence</li>
            <li>• Add comments with Cmd/Ctrl + double-click</li>
            <li>• Automatic conflict detection and resolution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserSetup;
