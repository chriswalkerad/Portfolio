const { createServer } = require('http');
const { Server } = require('socket.io');

// Store for active projects and users
const projects = new Map();

// Clean up inactive projects every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [projectId, project] of projects.entries()) {
    if (now - project.lastActivity > fiveMinutes && project.users.size === 0) {
      projects.delete(projectId);
      console.log(`Cleaned up inactive project: ${projectId}`);
    }
  }
}, 5 * 60 * 1000);

// Create HTTP server for Socket.io
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    // In dev, reflect the request origin so both localhost and LAN IPs work
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_project', ({ projectId, user }) => {
    console.log(`User ${user.name} (${user.id}) joining project ${projectId}`);
    
    // Get or create project
    if (!projects.has(projectId)) {
      projects.set(projectId, {
        users: new Map(),
        slides: new Map(),
        comments: [],
        lastActivity: Date.now(),
      });
    }

    const project = projects.get(projectId);
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
    console.log(`User ${userId} leaving project ${projectId}`);
    
    const project = projects.get(projectId);
    if (project) {
      project.users.delete(userId);
      project.lastActivity = Date.now();
      socket.to(projectId).emit('user_left', userId);
    }
    socket.leave(projectId);
  });

  socket.on('slide_update', (data) => {
    const { projectId, slideId, slide, userId, timestamp } = data;
    console.log(`Slide update from ${userId}: slide ${slideId}`);
    
    const project = projects.get(projectId);
    
    if (project) {
      // Check for conflicts
      const existingSlide = project.slides.get(slideId);
      const isConflict = existingSlide && 
        existingSlide.lastModified > timestamp - 1000 && 
        existingSlide.lastModifiedBy !== userId;

      if (isConflict) {
        console.log(`Conflict detected for slide ${slideId}`);
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

  socket.on('block_update', (data) => {
    const { projectId, slideId, blockId, block, userId, timestamp } = data;
    console.log(`Block update from ${userId}: block ${blockId} on slide ${slideId}`);
    
    const project = projects.get(projectId);
    
    if (project) {
      // Check for conflicts
      const existingSlide = project.slides.get(slideId);
      const existingBlock = existingSlide?.blocks?.find(b => b.id === blockId);
      const isConflict = existingBlock && 
        existingBlock.lastModified > timestamp - 500 && 
        existingBlock.lastModifiedBy !== userId;

      if (isConflict) {
        console.log(`Conflict detected for block ${blockId}`);
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
        const blockIndex = existingSlide.blocks?.findIndex(b => b.id === blockId) || -1;
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

  socket.on('cursor_update', (data) => {
    const { projectId, userId, cursor } = data;
    socket.to(projectId).emit('user_cursor_update', { userId, cursor });
  });

  socket.on('presence_update', (data) => {
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

  socket.on('add_comment', (data) => {
    const { projectId, comment } = data;
    console.log(`Comment added by ${comment.userId}: ${comment.text}`);
    
    const project = projects.get(projectId);
    
    if (project) {
      project.comments.push(comment);
      project.lastActivity = Date.now();
      
      // Broadcast to all users including sender
      io.to(projectId).emit('comment_added', comment);
    }
  });

  socket.on('resolve_conflict', (data) => {
    const { projectId, resourceId, resolution, userId } = data;
    console.log(`Conflict resolved by ${userId}: ${resourceId} -> ${resolution}`);
    
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
        console.log(`User ${userId} left project ${projectId}`);
      }
    }
  });
});

const port = process.env.SOCKET_PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
  console.log(`Active projects will be cleaned up after 5 minutes of inactivity`);
});
