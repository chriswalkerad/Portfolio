# Real-Time Collaboration Features

## Overview

The Content Creator now supports real-time collaboration allowing multiple users to work together on the same project simultaneously.

## Features Implemented

### ✅ Real-Time Synchronization
- **Slide Updates**: All slide changes are synchronized in real-time
- **Block Updates**: Text block modifications, positioning, and styling are shared instantly
- **Conflict Detection**: Automatic detection when multiple users edit the same element
- **Conflict Resolution**: UI prompts to resolve editing conflicts

### ✅ User Presence
- **Online Users**: See who else is currently working on the project
- **Active Slide Indicators**: Know which slide each collaborator is viewing
- **Color-Coded Users**: Each user has a unique color for identification

### ✅ Live Cursors
- **Real-Time Cursors**: See other users' mouse cursors moving on the canvas
- **User Labels**: Cursors show the user's name
- **Throttled Updates**: Optimized for performance (10 FPS)

### ✅ Commenting System
- **Add Comments**: Cmd/Ctrl + double-click to add comments anywhere on slides
- **Real-Time Comments**: Comments appear instantly for all users
- **Comment Resolution**: Mark comments as resolved when addressed
- **Visual Indicators**: Blue dots show comment locations

### ✅ Collaboration UI
- **User Setup**: Simple project ID system for joining collaboration sessions
- **Presence Panel**: Shows all active collaborators and their current slide
- **Collaboration Toggle**: Enable/disable collaboration mode
- **Conflict Notifications**: Clear UI for resolving editing conflicts

## Getting Started

### 1. Start the Development Servers
```bash
npm run dev:full
```
This starts both the Next.js dev server (port 3000) and Socket.io server (port 3001).

### 2. Enable Collaboration
- Click the "Collaboration Off" button in the header to enable collaboration
- Enter your name and either generate a new project ID or enter an existing one
- Share the project ID with collaborators

### 3. Invite Collaborators
- Share the project ID with team members
- They can join by entering the same project ID
- Up to 8 users can collaborate simultaneously (color-coded)

## Usage

### Real-Time Editing
- All text edits, block movements, and slide changes sync automatically
- Changes appear within 100-500ms for optimal performance
- Conflicts are detected and resolved through UI prompts

### Adding Comments
- Hold **Cmd/Ctrl** and **double-click** anywhere on a slide
- Type your comment and press Enter or click "Add Comment"
- Comments are visible to all collaborators immediately
- Click comment dots to view/resolve comments

### User Presence
- See collaborators in the presence panel (top-right)
- Green dots indicate users on the same slide
- User cursors show real-time mouse movements

### Conflict Resolution
- When conflicts occur, a modal appears with options:
  - "Keep Their Changes" - Accept the other user's version
  - "Keep My Changes" - Keep your version
- Conflicts are rare but handled gracefully

## Technical Implementation

### Architecture
- **Frontend**: React components with custom hooks for collaboration
- **Backend**: Socket.io server for real-time communication
- **State Management**: Local state synchronized via WebSocket events
- **Conflict Detection**: Timestamp-based conflict detection (500ms-1s threshold)

### Performance Optimizations
- **Throttled Cursor Updates**: 10 FPS to reduce bandwidth
- **Debounced Text Updates**: 300ms delay for text editing
- **Selective Broadcasting**: Only broadcast significant changes
- **Memory Management**: Automatic cleanup of inactive projects

### Data Flow
1. User makes change → Local state update
2. Change broadcast via Socket.io → Other users receive update
3. Conflict detection → Resolution if needed
4. State synchronization → All users see final state

## Remaining Features

### 🔄 Permission System (Pending)
- Role-based access (View/Edit/Admin)
- Granular permissions for slides and blocks
- Project ownership and sharing controls

### 🔄 Version History (Pending)
- Complete change tracking
- Rollback to previous versions
- Diff visualization
- Blame/attribution for changes

## File Structure

```
lib/
  collaboration.ts          # Core collaboration manager
components/collaboration/
  UserPresence.tsx         # User presence panel
  UserCursors.tsx          # Real-time cursor display
  Comments.tsx             # Commenting system
  ConflictResolution.tsx   # Conflict resolution UI
  UserSetup.tsx            # Project joining interface
server/
  socket.js                # Socket.io server
```

## Environment Variables

```env
SOCKET_PORT=3001  # Socket.io server port (optional, defaults to 3001)
```

## Known Limitations

1. **Project IDs**: Currently use simple string IDs (not authenticated)
2. **Persistence**: Projects only persist in memory (restart clears data)
3. **Scalability**: Single server instance (no clustering)
4. **Security**: No authentication or authorization yet

## Future Enhancements

- Authentication integration (Auth0/NextAuth)
- Database persistence (Supabase/PostgreSQL)
- Real-time voice/video chat integration
- Advanced permission system
- Project templates and sharing
- Mobile collaboration support
