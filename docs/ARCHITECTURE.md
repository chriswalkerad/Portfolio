# Architecture Overview

This document outlines the technical architecture of the Content Creator application, including system design, data flow, and key architectural decisions.

## System Architecture

### High-Level Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser Tab   │    │   Browser Tab   │    │   Browser Tab   │
│   (Client A)    │    │   (Client B)    │    │   (Client N)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     WebSocket Server      │
                    │     (Socket.io :3001)     │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Next.js Server        │
                    │     (HTTP :3000/3002)     │
                    └───────────────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 15.4.6**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type safety and development experience
- **Tailwind CSS 4.x**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **GSAP**: High-performance animations
- **Socket.io Client**: Real-time communication

#### Backend
- **Node.js**: JavaScript runtime
- **Socket.io Server**: WebSocket server for real-time features
- **Next.js API Routes**: RESTful endpoints (future use)

#### Development Tools
- **Turbopack**: Fast bundler (Next.js built-in)
- **ESLint**: Code linting and quality
- **Concurrently**: Run multiple development servers

## Application Architecture

### Component Hierarchy
```
App (page.tsx)
├── Header
│   ├── Title (editable)
│   ├── UserAvatars (collaboration)
│   ├── ActionButtons
│   └── CollaborationToggle
├── Main Layout
│   ├── Sidebar (slides)
│   │   ├── SlideList
│   │   └── UserAvatars (per slide)
│   ├── Canvas
│   │   ├── Slide Content
│   │   ├── UserCursors (collaboration)
│   │   └── Comments (collaboration)
│   └── Tools Panel (future)
├── Footer (private notes)
└── Collaboration Components
    ├── ConflictResolution
    └── UserAvatars
```

### State Management

#### Local State (React)
```typescript
// Main application state
const [slides, setSlides] = useState<Slide[]>([])
const [currentSlideId, setCurrentSlideId] = useState(1)
const [selectedIds, setSelectedIds] = useState<number[]>([])
const [editingId, setEditingId] = useState<number | null>(null)

// Collaboration state
const [collaborationReady, setCollaborationReady] = useState(false)
const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(true)

// UI state
const [gridView, setGridView] = useState(false)
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
```

#### Collaborative State (Socket.io)
```typescript
// Server-side project state
interface ProjectState {
  users: Map<string, User>
  slides: Map<number, Slide>
  comments: Comment[]
  lastActivity: number
}

// Client-side collaboration manager
class CollaborationManager {
  private socket: Socket
  private currentUser: User
  private projectId: string
  // ... real-time sync methods
}
```

### Data Flow

#### 1. User Action Flow
```
User Interaction
       ↓
Local State Update (optimistic)
       ↓
Broadcast to Socket.io
       ↓
Server Validation & Conflict Check
       ↓
Broadcast to Other Clients
       ↓
Remote State Updates
```

#### 2. Collaboration Event Flow
```
Client A: Edit Text Block
       ↓
updateBlockInSlide() → Local Update
       ↓
collaborationManager.broadcastBlockUpdate()
       ↓
Socket.io Server: Receive 'block_update'
       ↓
Conflict Detection & Validation
       ↓
Broadcast to Other Clients
       ↓
Client B: Receive 'block_updated' Event
       ↓
Update Local State (if not from self)
```

## Real-Time Collaboration

### WebSocket Architecture
```typescript
// Client Events (Outgoing)
socket.emit('join_project', { projectId, user })
socket.emit('slide_update', { slideId, slide, userId, timestamp })
socket.emit('block_update', { slideId, blockId, block, userId, timestamp })
socket.emit('cursor_update', { userId, cursor })
socket.emit('add_comment', { projectId, comment })

// Server Events (Incoming)
socket.on('user_joined', (user) => { /* handle new user */ })
socket.on('slide_updated', (data) => { /* sync slide changes */ })
socket.on('block_updated', (data) => { /* sync block changes */ })
socket.on('user_cursor_update', (data) => { /* show live cursors */ })
socket.on('conflict_detected', (data) => { /* resolve conflicts */ })
```

### Conflict Resolution
```
Timestamp-Based Detection:
┌─────────────────────────────────────────┐
│ User A edits at timestamp: 1000         │
│ User B edits at timestamp: 1100 (+100ms) │
│                                         │
│ If User B's edit arrives within 500ms   │
│ of User A's last modification:          │
│ → CONFLICT DETECTED                     │
│ → Show resolution UI                    │
└─────────────────────────────────────────┘
```

## Performance Optimizations

### Frontend Optimizations
1. **Throttled Updates**: Cursor positions limited to 10 FPS
2. **Debounced Text Changes**: 300ms delay for text editing
3. **Optimistic Updates**: Immediate UI feedback
4. **Selective Re-renders**: React.memo and useCallback usage
5. **GSAP Optimization**: Hardware-accelerated animations

### Backend Optimizations
1. **Event Filtering**: Only broadcast significant changes
2. **Memory Management**: Auto-cleanup of inactive projects
3. **Connection Pooling**: Efficient Socket.io room management
4. **Throttled Broadcasting**: Rate limiting for high-frequency events

### Data Structure Efficiency
```typescript
// Efficient slide storage
interface Slide {
  id: number
  title: string
  blocks: Block[]
  lastModified?: number
  lastModifiedBy?: string
}

// Optimized block updates
interface BlockUpdate {
  slideId: number
  blockId: number
  changes: Partial<Block>  // Only changed properties
  timestamp: number
  userId: string
}
```

## Security Considerations

### Current Implementation
- **Client-side validation** for immediate feedback
- **Server-side validation** for data integrity
- **Project ID-based isolation** (simple string matching)
- **No authentication** (demo/development mode)

### Future Security Enhancements
```typescript
// Planned authentication system
interface AuthenticatedUser {
  id: string
  email: string
  permissions: Permission[]
  projectRole: 'owner' | 'editor' | 'viewer'
}

// Role-based access control
interface Permission {
  resource: 'slide' | 'block' | 'comment'
  action: 'read' | 'write' | 'delete'
  scope: 'own' | 'project' | 'all'
}
```

## Scalability Considerations

### Current Limitations
- **Single server instance** (no horizontal scaling)
- **In-memory storage** (restarts clear data)
- **No persistence** (database integration needed)
- **Simple project isolation** (string-based IDs)

### Scaling Strategy
```
Phase 1: Database Integration
├── PostgreSQL for persistent storage
├── Redis for session management
└── User authentication system

Phase 2: Horizontal Scaling
├── Load balancer (nginx)
├── Multiple Node.js instances
├── Redis for shared session state
└── Database connection pooling

Phase 3: Advanced Features
├── Real-time database (Supabase)
├── CDN for static assets
├── WebRTC for peer-to-peer features
└── Microservices architecture
```

## Error Handling

### Client-Side Error Handling
```typescript
// Collaboration connection errors
collaborationManager.on('connection_lost', () => {
  // Show offline indicator
  // Queue changes for retry
  // Attempt reconnection
})

// Conflict resolution
collaborationManager.on('conflict_detected', (data) => {
  // Show conflict resolution UI
  // Allow user to choose resolution
  // Apply resolution and continue
})
```

### Server-Side Error Handling
```javascript
// Socket connection errors
io.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error('Socket error:', error)
    // Log error details
    // Notify monitoring system
  })
  
  socket.on('disconnect', (reason) => {
    // Clean up user state
    // Notify other users
    // Log disconnection reason
  })
})
```

## Future Architecture Improvements

### Short-term (Next 3 months)
1. **Database Integration**: PostgreSQL + Prisma ORM
2. **Authentication**: NextAuth.js integration
3. **File Upload**: Media handling system
4. **API Documentation**: OpenAPI/Swagger specs

### Medium-term (6 months)
1. **Real-time Database**: Supabase integration
2. **Advanced Permissions**: Role-based access control
3. **Version History**: Change tracking system
4. **Export System**: PDF/PowerPoint generation

### Long-term (1 year)
1. **Microservices**: Separate concerns into services
2. **WebRTC Integration**: Peer-to-peer communication
3. **Mobile Apps**: React Native clients
4. **AI Features**: Smart content suggestions

## Development Patterns

### Component Design Patterns
- **Composition over inheritance**
- **Custom hooks for shared logic**
- **Props drilling avoidance with context**
- **Memoization for performance**

### State Management Patterns
- **Local state for UI-only concerns**
- **Lifted state for shared concerns**
- **Custom hooks for complex state logic**
- **Event-driven updates for collaboration**

### Code Organization
```
lib/
├── collaboration.ts    # Collaboration manager
├── utils.ts           # Utility functions
└── types.ts          # Shared TypeScript types

components/
├── ui/               # Reusable UI components
├── collaboration/    # Collaboration-specific components
└── layout/          # Layout components

hooks/
├── useCollaboration.ts  # Collaboration logic
├── useSlides.ts        # Slide management
└── useKeyboardShortcuts.ts  # Keyboard handling
```

This architecture provides a solid foundation for the current features while being flexible enough to support future enhancements and scaling requirements.
