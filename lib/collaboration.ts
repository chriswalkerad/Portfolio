import { io, Socket } from 'socket.io-client';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  activeSlide?: number;
}

export interface CollaborationEvent {
  type: 'slide_update' | 'block_update' | 'user_cursor' | 'user_presence' | 'comment_added';
  userId: string;
  timestamp: number;
  data: unknown;
}

export interface CollaborationState {
  users: Map<string, User>;
  activeUsers: Set<string>;
  conflicts: Map<string, { resourceId: string; resourceType: 'slide' | 'block'; conflictingUser: string; timestamp: number }>;
}

class CollaborationManager {
  private socket: Socket | null = null;
  private currentUser: User | null = null;
  private projectId: string | null = null;
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private state: CollaborationState = {
    users: new Map(),
    activeUsers: new Set(),
    conflicts: new Map(),
  };

  // User colors for collaboration
  private userColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (typeof window === 'undefined') return;
    
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const baseUrl = origin.replace(/:\d+$/, ':3001');
    this.socket = io(baseUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to collaboration server');
      this.emit('connection_established');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from collaboration server:', reason);
      this.emit('connection_lost');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Collaboration connection error:', error);
      this.emit('connection_error', error);
    });

    this.socket.on('user_joined', (user: User) => {
      this.state.users.set(user.id, user);
      this.state.activeUsers.add(user.id);
      this.emit('user_joined', user);
    });

    this.socket.on('user_left', (userId: string) => {
      this.state.users.delete(userId);
      this.state.activeUsers.delete(userId);
      this.emit('user_left', userId);
    });

    this.socket.on('user_cursor_update', (data: { userId: string; cursor: { x: number; y: number } }) => {
      const user = this.state.users.get(data.userId);
      if (user) {
        user.cursor = data.cursor;
        this.emit('user_cursor_update', data);
      }
    });

    this.socket.on('slide_updated', (data: { slideId: number; slide: unknown; userId: string; timestamp: number }) => {
      this.emit('slide_updated', data);
    });

    this.socket.on('block_updated', (data: { slideId: number; blockId: number; block: unknown; userId: string; timestamp: number }) => {
      this.emit('block_updated', data);
    });

    this.socket.on('conflict_detected', (data: { resourceId: string; resourceType: 'slide' | 'block'; conflictingUser: string; timestamp: number }) => {
      this.state.conflicts.set(data.resourceId, data);
      this.emit('conflict_detected', data);
    });

    this.socket.on('comment_added', (data: unknown) => {
      this.emit('comment_added', data);
    });
  }

  async joinProject(projectId: string, user: Partial<User>) {
    this.projectId = projectId;
    
    // Assign a color if not provided
    const assignedColor = user.color || this.getAvailableColor();
    
    this.currentUser = {
      id: user.id || `user_${Date.now()}`,
      name: user.name || 'Anonymous',
      email: user.email,
      avatar: user.avatar,
      color: assignedColor,
    };

    if (this.socket) {
      this.socket.connect();
      this.socket.emit('join_project', {
        projectId,
        user: this.currentUser,
      });
    }
  }

  leaveProject() {
    if (this.socket && this.projectId) {
      this.socket.emit('leave_project', {
        projectId: this.projectId,
        userId: this.currentUser?.id,
      });
      this.socket.disconnect();
    }
    this.projectId = null;
    this.currentUser = null;
    this.state.users.clear();
    this.state.activeUsers.clear();
    this.state.conflicts.clear();
  }

  // Real-time sync methods
  broadcastSlideUpdate(slideId: number, slide: unknown) {
    if (!this.socket || !this.projectId) return;
    
    this.socket.emit('slide_update', {
      projectId: this.projectId,
      slideId,
      slide,
      userId: this.currentUser?.id,
      timestamp: Date.now(),
    });
  }

  broadcastBlockUpdate(slideId: number, blockId: number, block: unknown) {
    if (!this.socket || !this.projectId) return;
    
    this.socket.emit('block_update', {
      projectId: this.projectId,
      slideId,
      blockId,
      block,
      userId: this.currentUser?.id,
      timestamp: Date.now(),
    });
  }

  broadcastCursorPosition(x: number, y: number) {
    if (!this.socket || !this.projectId) return;
    
    this.socket.emit('cursor_update', {
      projectId: this.projectId,
      userId: this.currentUser?.id,
      cursor: { x, y },
      timestamp: Date.now(),
    });
  }

  broadcastUserPresence(activeSlide: number) {
    if (!this.socket || !this.projectId) return;
    
    this.socket.emit('presence_update', {
      projectId: this.projectId,
      userId: this.currentUser?.id,
      activeSlide,
      timestamp: Date.now(),
    });
  }

  addComment(slideId: number, x: number, y: number, text: string) {
    if (!this.socket || !this.projectId || !this.currentUser) return;
    
    const comment = {
      id: `comment_${Date.now()}`,
      slideId,
      x,
      y,
      text,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      timestamp: Date.now(),
    };

    this.socket.emit('add_comment', {
      projectId: this.projectId,
      comment,
    });

    return comment;
  }

  // Event handling
  on<T = unknown>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    // Store callback as unknown-typed to avoid leaking generics into storage structure
    this.listeners.get(event)!.push(callback as unknown as (data: unknown) => void);
  }

  off<T = unknown>(event: string, callback: (data: T) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as unknown as (data: unknown) => void);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Utility methods
  private getAvailableColor(): string {
    const usedColors = Array.from(this.state.users.values()).map(u => u.color);
    const availableColors = this.userColors.filter(color => !usedColors.includes(color));
    return availableColors[0] || this.userColors[0];
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getActiveUsers(): User[] {
    return Array.from(this.state.activeUsers)
      .map(id => this.state.users.get(id))
      .filter(Boolean) as User[];
  }

  getConflicts(): Map<string, { resourceId: string; resourceType: 'slide' | 'block'; conflictingUser: string; timestamp: number }> {
    return this.state.conflicts;
  }

  resolveConflict(resourceId: string, resolution: 'accept' | 'reject') {
    this.state.conflicts.delete(resourceId);
    if (this.socket && this.projectId) {
      this.socket.emit('resolve_conflict', {
        projectId: this.projectId,
        resourceId,
        resolution,
        userId: this.currentUser?.id,
      });
    }
  }
}

// Singleton instance
let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager();
  }
  return collaborationManager;
}

export default CollaborationManager;
