import { NextRequest } from 'next/server';
import { Server } from 'socket.io';
import { createServer } from 'http';

// Types for collaboration state
interface CollabComment {
  id: string;
  slideId: number;
  x: number;
  y: number;
  text: string;
  userId: string;
  userName?: string;
  timestamp: number;
}

interface CollabBlock {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  zIndex?: number;
  width?: number;
  height?: number;
  lastModified?: number;
  lastModifiedBy?: string;
}

interface CollabSlide {
  id: number;
  title: string;
  blocks: CollabBlock[];
  lastModified?: number;
  lastModifiedBy?: string;
}

interface CollabUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  activeSlide?: number;
  socketId?: string;
}

interface ProjectState {
  users: Map<string, CollabUser>;
  slides: Map<number, CollabSlide>;
  comments: CollabComment[];
  lastActivity: number;
}

// Store for active projects and users
const projects = new Map<string, ProjectState>();

// Clean up inactive projects every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [projectId, project] of projects.entries()) {
    if (now - project.lastActivity > fiveMinutes && project.users.size === 0) {
      projects.delete(projectId);
    }
  }
}, 5 * 60 * 1000);

let io: Server | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    // Create HTTP server for Socket.io
    const httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      path: '/api/collaboration'
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_project', ({ projectId, user }) => {
        // Get or create project
        if (!projects.has(projectId)) {
          projects.set(projectId, {
            users: new Map(),
            slides: new Map(),
            comments: [],
            lastActivity: Date.now(),
          });
        }

        const project = projects.get(projectId)!;
        project.users.set(user.id, { ...user, socketId: socket.id });
        project.lastActivity = Date.now();

        // Join socket room
        socket.join(projectId);

        // Notify other users
        socket.to(projectId).emit('user_joined', user);

        // Send current project state to new user
        socket.emit('project_state', {
          users: Array.from(project.users.values()),
          slides: Object.fromEntries(project.slides),
          comments: project.comments,
        });

        // Store project and user info on socket
        socket.data = { projectId, userId: user.id };
      });

      socket.on('leave_project', ({ projectId, userId }) => {
        const project = projects.get(projectId);
        if (project) {
          project.users.delete(userId);
          project.lastActivity = Date.now();
          socket.to(projectId).emit('user_left', userId);
        }
        socket.leave(projectId);
      });

      socket.on('slide_update', (data: { projectId: string; slideId: number; slide: CollabSlide; userId: string; timestamp: number }) => {
        const { projectId, slideId, slide, userId, timestamp } = data;
        const project = projects.get(projectId);
        
        if (project) {
          // Check for conflicts
          const existingSlide = project.slides.get(slideId);
          const isConflict = !!existingSlide && 
            (existingSlide.lastModified ?? 0) > timestamp - 1000 && 
            existingSlide.lastModifiedBy !== userId;

          if (isConflict) {
            socket.emit('conflict_detected', {
              resourceId: `slide_${slideId}`,
              resourceType: 'slide',
              conflictingUser: existingSlide.lastModifiedBy,
              timestamp,
            });
            return;
          }

          // Update slide
          project.slides.set(slideId, {
            ...slide,
            lastModified: timestamp,
            lastModifiedBy: userId,
          });
          
          project.lastActivity = Date.now();

          // Broadcast to other users
          socket.to(projectId).emit('slide_updated', {
            slideId,
            slide,
            userId,
            timestamp,
          });
        }
      });

      socket.on('block_update', (data: { projectId: string; slideId: number; blockId: number; block: CollabBlock; userId: string; timestamp: number }) => {
        const { projectId, slideId, blockId, block, userId, timestamp } = data;
        const project = projects.get(projectId);
        
        if (project) {
          // Check for conflicts
          const existingSlide = project.slides.get(slideId);
          const existingBlock = existingSlide?.blocks?.find((b: CollabBlock) => b.id === blockId);
          const isConflict = !!existingBlock && 
            (existingBlock.lastModified ?? 0) > timestamp - 500 && 
            existingBlock.lastModifiedBy !== userId;

          if (isConflict) {
            socket.emit('conflict_detected', {
              resourceId: `block_${blockId}`,
              resourceType: 'block',
              conflictingUser: existingBlock.lastModifiedBy,
              timestamp,
            });
            return;
          }

          // Update block in slide
          if (existingSlide) {
            const blockIndex = existingSlide.blocks?.findIndex((b: CollabBlock) => b.id === blockId) || -1;
            if (blockIndex >= 0) {
              existingSlide.blocks[blockIndex] = {
                ...block,
                lastModified: timestamp,
                lastModifiedBy: userId,
              };
            } else {
              existingSlide.blocks = existingSlide.blocks || [];
              existingSlide.blocks.push({
                ...block,
                lastModified: timestamp,
                lastModifiedBy: userId,
              });
            }
          }
          
          project.lastActivity = Date.now();

          // Broadcast to other users
          socket.to(projectId).emit('block_updated', {
            slideId,
            blockId,
            block,
            userId,
            timestamp,
          });
        }
      });

      socket.on('cursor_update', (data: { projectId: string; userId: string; cursor: { x: number; y: number } }) => {
        const { projectId, userId, cursor } = data;
        socket.to(projectId).emit('user_cursor_update', { userId, cursor });
      });

      socket.on('presence_update', (data: { projectId: string; userId: string; activeSlide: number }) => {
        const { projectId, userId, activeSlide } = data;
        const project = projects.get(projectId);
        
        if (project) {
          const user = project.users.get(userId);
          if (user) {
            user.activeSlide = activeSlide;
            socket.to(projectId).emit('user_presence_update', { userId, activeSlide });
          }
        }
      });

      socket.on('add_comment', (data: { projectId: string; comment: CollabComment }) => {
        const { projectId, comment } = data;
        const project = projects.get(projectId);
        
        if (project) {
          project.comments.push(comment);
          project.lastActivity = Date.now();
          
          // Broadcast to all users including sender
          io!.to(projectId).emit('comment_added', comment);
        }
      });

      socket.on('resolve_conflict', (data: { projectId: string; resourceId: string; resolution: 'accept' | 'reject'; userId: string }) => {
        const { projectId, resourceId, resolution, userId } = data;
        socket.to(projectId).emit('conflict_resolved', {
          resourceId,
          resolution,
          resolvedBy: userId,
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const { projectId, userId } = socket.data || {};
        if (projectId && userId) {
          const project = projects.get(projectId);
          if (project) {
            project.users.delete(userId);
            project.lastActivity = Date.now();
            socket.to(projectId).emit('user_left', userId);
          }
        }
      });
    });

    // Start the HTTP server for Socket.io
    const port = process.env.SOCKET_PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`Socket.io server running on port ${port}`);
    });
  }

  return new Response(JSON.stringify({ message: 'Socket.io server initialized' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Handle socket.io upgrade requests
export async function POST() {
  return new Response(JSON.stringify({ message: 'Use WebSocket connection for real-time features' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
