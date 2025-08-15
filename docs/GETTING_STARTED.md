# Getting Started

This guide will help you set up the Content Creator development environment and start contributing to the project.

## Prerequisites

- **Node.js** 18+ (recommended: use latest LTS)
- **npm** 8+ or **yarn** 1.22+
- **Git** for version control
- Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd content-creator
```

### 2. Install Dependencies
```bash
npm install
```

This installs all required packages including:
- Next.js 15.4.6 with Turbopack
- React 19 and TypeScript
- Tailwind CSS and Radix UI
- Socket.io for real-time collaboration
- GSAP for animations

### 3. Start Development Servers
```bash
# Start both Next.js and Socket.io servers
npm run dev:full
```

This command runs:
- **Next.js dev server** on port 3000 (or next available)
- **Socket.io server** on port 3001

### 4. Open the Application
Navigate to the URL shown in the terminal (typically `http://localhost:3000` or `http://localhost:3002`)

## Development Workflow

### Available Commands

```bash
# Development
npm run dev          # Next.js only
npm run dev:full     # Next.js + Socket.io
npm run socket       # Socket.io server only

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### File Structure
```
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main application page
│   ├── layout.tsx      # Root layout
│   └── api/            # API routes
├── components/
│   ├── ui/             # Reusable UI components
│   └── collaboration/  # Collaboration features
├── lib/                # Utilities and helpers
├── server/             # Backend services
├── docs/               # Documentation
└── public/             # Static assets
```

## Key Features to Understand

### 1. Real-Time Collaboration
- **Socket.io** handles WebSocket connections
- **Collaboration Manager** (`lib/collaboration.ts`) manages state
- **User presence** shows who's online and where
- **Live cursors** and **comments** for real-time interaction

### 2. Content Creation
- **Slide management** with drag-and-drop reordering
- **Text blocks** with various formatting options
- **GSAP animations** for smooth interactions
- **Auto-save** to localStorage with undo/redo

### 3. UI Components
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **Custom components** in `components/ui/`
- **Collaboration components** in `components/collaboration/`

## Testing Collaboration Features

### Single Machine Testing
1. Start the development servers: `npm run dev:full`
2. Open multiple browser tabs to `http://localhost:3002`
3. Each tab will auto-join as a different user
4. Test real-time editing, cursors, and comments

### Multi-Machine Testing
1. Start servers on one machine
2. Find the network IP in the terminal output
3. Other machines can connect to `http://[IP]:3002`
4. All machines will collaborate in real-time

## Common Development Tasks

### Adding a New UI Component
1. Create component in `components/ui/`
2. Follow Radix UI patterns for accessibility
3. Use Tailwind classes for styling
4. Export from component file

### Adding Collaboration Features
1. Extend `CollaborationManager` in `lib/collaboration.ts`
2. Add WebSocket events in `server/socket.js`
3. Create React components in `components/collaboration/`
4. Integrate into main `app/page.tsx`

### Styling Guidelines
- Use Tailwind utility classes
- Follow design system in `docs/DESIGN_SPEC.md`
- Maintain responsive design principles
- Ensure accessibility standards

## Environment Variables

Create a `.env.local` file for local development:
```env
# Socket.io server port (optional)
SOCKET_PORT=3001

# Next.js configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Troubleshooting

### Port Conflicts
If port 3000 is in use, Next.js will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the correct URL.

### Socket.io Connection Issues
- Ensure both servers are running with `npm run dev:full`
- Check that port 3001 is available
- Verify firewall settings for local network testing

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Hot Reload Issues
- Turbopack should handle most hot reload scenarios
- For collaboration components, you may need to refresh browsers
- Check terminal for compilation errors

## Code Quality

### TypeScript
- All code should be properly typed
- Use strict TypeScript configuration
- Avoid `any` types when possible

### ESLint
- Run `npm run lint` before committing
- Follow Next.js and React best practices
- Use consistent formatting

### Git Workflow
1. Create feature branches from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Test thoroughly before pushing

## Next Steps

After getting the development environment running:

1. **Read the documentation**: Familiarize yourself with the design spec and architecture
2. **Explore the codebase**: Understand how components interact
3. **Test collaboration**: Try all real-time features
4. **Make small changes**: Start with minor improvements
5. **Contribute**: Follow the contributing guidelines in `docs/CONTRIBUTING.md`

## Getting Help

- Check the documentation in the `docs/` folder
- Review existing code for patterns and examples
- Test thoroughly in multiple browser tabs
- Refer to the troubleshooting section above

Welcome to the Content Creator project! 🚀
