# Content Creator

A professional-grade, browser-based content creation tool built with Next.js, TypeScript, and GSAP. Create interactive slide presentations with drag-and-drop text elements, **real-time collaboration**, and advanced layout controls.

## 📚 Documentation

Complete documentation is available in the [`docs/`](./docs/) folder:

- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup and development workflow
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Technical architecture and system design  
- **[Design Specification](./docs/DESIGN_SPEC.md)** - UI/UX guidelines and wireframes
- **[Collaboration Features](./docs/COLLABORATION.md)** - Real-time collaboration documentation

## 🚀 Real-Time Collaboration Features

✅ **Live Multi-User Editing**: Multiple users can edit simultaneously with instant synchronization
✅ **User Presence**: See who's online with avatars in header and on slides
✅ **Live Cursors**: Watch other users' mouse movements in real-time  
✅ **Comments System**: Add feedback with Cmd/Ctrl + double-click
✅ **Conflict Resolution**: Automatic detection and resolution of editing conflicts
✅ **Auto-Sync**: All changes propagate instantly to all collaborators

### Quick Start with Collaboration
```bash
npm run dev:full  # Starts both Next.js and Socket.io servers
```
Open multiple browser tabs to test real-time collaboration!

![Content Creator Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=Content+Creator+Interface)

## ✨ Features

### 🎨 **Visual Editor**
- **Drag & Drop**: Move text blocks around the canvas with smooth GSAP animations
- **Multi-Selection**: Select multiple blocks with Cmd/Ctrl+click or Shift+click
- **Resize Controls**: Precision resize handles for fine-tuning text block dimensions
- **Real-time Editing**: Double-click any text block to edit inline
- **Visual Feedback**: Live selection indicators and hover effects

### 📄 **Slide Management**
- **Multi-slide Support**: Create unlimited slides for your presentation
- **Slide Reordering**: Drag slides to reorder them in the sidebar
- **Grid View**: Overview all slides in a visual grid layout
- **Slide Operations**: Duplicate, delete, and navigate between slides
- **Slide Thumbnails**: Visual previews with block counts

### ✏️ **Text Formatting**
- **Text Variants**: Title, Headline, Subheadline, Normal, Small, Bullet Lists, Numbered Lists
- **Font Controls**: Adjustable font size, bold toggle, and color picker
- **Live Formatting**: Real-time text formatting toolbar when editing
- **Typography Presets**: Predefined styles for consistent design

### ⌨️ **Keyboard Shortcuts**
- `T` - Add text block (or edit selected block)
- `Cmd/Ctrl + N` - New slide
- `Cmd/Ctrl + D` - Duplicate selection
- `Cmd/Ctrl + C` - Copy selected blocks
- `Cmd/Ctrl + V` - Paste blocks
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + A` - Select all
- `Cmd/Ctrl + B` - Toggle bold
- `+/-` - Increase/decrease font size
- `Cmd/Ctrl + ]` - Bring to front
- `Cmd/Ctrl + [` - Send to back
- `Delete/Backspace` - Delete selection
- `Escape` - Clear selection
- `Cmd/Ctrl + 1-7` - Quick add text variants
- `Cmd/Ctrl + ←/→` - Navigate slides

### 💾 **Data Management**
- **Auto-save**: Automatically saves to localStorage every 300ms
- **Undo/Redo**: Full history management (50 states)
- **State Persistence**: Your work is saved across browser sessions
- **Real-time Status**: Visual save status indicator

### 🎯 **Advanced Features**
- **Marquee Selection**: Click and drag on canvas to select multiple blocks
- **Layer Management**: Z-index controls for element layering
- **Canvas Focus**: Click canvas to ensure keyboard shortcuts work
- **Responsive Design**: Works on different screen sizes
- **Error Handling**: Graceful error recovery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd portfolio-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

### First Time Usage

1. **Add your first text block:**
   - Click the "Text" dropdown in the header
   - Select any text variant (Title, Headline, etc.)
   - Click on the canvas to place it

2. **Edit text:**
   - Double-click any text block to edit
   - Press Enter to save, Escape to cancel

3. **Move and resize:**
   - Drag blocks around the canvas
   - Select a block to see resize handles
   - Drag handles to resize

4. **Add more slides:**
   - Click the "+" button in the sidebar
   - Or use `Cmd/Ctrl + Shift + N`

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Animations**: GSAP (GreenSock)
- **Icons**: Lucide React
- **Build Tool**: Turbopack (Next.js built-in)

## 📁 Project Structure

```
portfolio-web/
├── app/
│   ├── page.tsx              # Main content creator interface
│   ├── layout.tsx            # Root layout with fonts
│   └── help/
│       └── page.tsx          # Help documentation
├── components/
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── dropdown-menu.tsx
│       └── separator.tsx
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## 🎮 Usage Guide

### Creating Content

1. **Start with a slide**: Every project begins with one slide
2. **Add text blocks**: Use the Text dropdown or keyboard shortcuts
3. **Position elements**: Drag blocks to desired locations
4. **Format text**: Use the formatting toolbar or keyboard shortcuts
5. **Add more slides**: Create multi-slide presentations
6. **Save & Share**: Content auto-saves, use Publish when ready

### Advanced Workflows

**Multi-selection Editing:**
- Hold Cmd/Ctrl and click multiple blocks
- Apply formatting changes to all selected blocks
- Move multiple blocks together

**Keyboard-first Workflow:**
- Use `T` to quickly add text blocks
- Navigate with `Cmd + ←/→` between slides
- Format with `Cmd + B` for bold, `+/-` for sizing

**Grid View Management:**
- Toggle grid view with the bottom-right button
- Multi-select slides for batch operations
- Quickly navigate large presentations

## 🐛 Troubleshooting

### Common Issues

**Text not editable:**
- Make sure you double-click the text block
- Ensure the block is selected (blue outline)

**Keyboard shortcuts not working:**
- Click on the canvas to ensure focus
- Make sure you're not typing in an input field

**Performance with many blocks:**
- Use grid view for better overview
- Consider splitting content across multiple slides

**Save issues:**
- Check browser localStorage isn't full
- Clear cache if experiencing issues

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms

The app builds to static files and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

This project is for personal use. Please don't redistribute without permission.

---

**Built with ❤️ using Next.js and GSAP**

*Last updated: August 2024*