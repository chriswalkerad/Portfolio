# Content Creator - Design Specification

## Overview

This document outlines the design requirements, layout specifications, and UI guidelines for the Content Creator application based on the approved wireframe and user feedback.

## Layout Structure

### Header Layout
```
[Title + Edit Icon] ... [User Avatars] [Action Buttons] [X Close]
```

**Components:**
- **Title**: Editable episode title with pencil icon
- **User Avatars**: Stacked circular avatars showing online collaborators
- **Action Buttons**: 
  - "Add text" (dropdown)
  - "Add media" 
  - "Add a shape"
  - "Play" (circular button)
  - "Share" (circular button)
  - "Publish" (prominent button)
- **Close Button**: X in top-right corner

### Main Layout Structure
```
┌─────────────────── HEADER ────────────────────┐
├─[Sidebar]─┬────────── CANVAS ──────────┬─Tools─┤
│           │                            │      │
│ Slides    │    Selected Slide Here     │Tools │
│ List      │                            │go    │
│           │                            │here  │
│           │                            │      │
└───────────┴────────────────────────────┴──────┘
│                Private Notes                   │
└───────────────────────────────────────────────┘
```

### Sidebar (Left Panel)
- **Width**: ~200-300px depending on screen size
- **Content**: 
  - "Add slide" button at top
  - Vertical list of slide thumbnails
  - Text label: "your slides go here"
- **Slide Thumbnails**:
  - Rectangular preview of slide content
  - User avatars in top-right corner showing who's viewing
  - Selected slide has colored border (orange/red)

### Canvas (Center Panel)
- **Background**: White canvas area
- **Content**: Currently selected slide content
- **Placeholder**: "SELECTED SLIDE HERE" when no content
- **Aspect Ratio**: 16:9 (standard presentation format)
- **Features**:
  - Drag & drop text elements
  - Real-time collaboration cursors
  - Comment system overlay

### Tools Panel (Right Sidebar)
- **Width**: ~200-320px depending on screen size
- **Content**: "Tools go here" placeholder
- **Purpose**: Future feature expansion area

### Footer
- **Content**: "private notes" area
- **Height**: Minimal, expandable
- **Purpose**: Personal annotations that aren't shared

## User Avatar Design

### Header Avatars
- **Style**: Circular, overlapping stack
- **Size**: ~32px diameter
- **Content**: User initials on colored background
- **Features**:
  - Shows "X online" count
  - Max 5 visible, then "+X" indicator
  - Hover shows user name and current slide
  - Color-coded per user

### Slide Avatars
- **Style**: Smaller circular avatars
- **Size**: ~24px diameter
- **Position**: Top-right corner of slide thumbnails
- **Purpose**: Show which users are viewing specific slides
- **Features**:
  - Real-time presence updates
  - Same color scheme as header avatars
  - Max 3 visible per slide

## Color Scheme & Styling

### Primary Colors
- **Canvas Background**: Pure white (#FFFFFF)
- **Interface Background**: Light gray/off-white
- **Selected Elements**: Orange/red accent color
- **Text**: Dark gray/black for high contrast

### User Colors (for avatars and cursors)
- Blue (#3B82F6)
- Red (#EF4444)
- Green (#10B981)
- Orange (#F59E0B)
- Purple (#8B5CF6)
- Teal (#06B6D4)
- Lime (#84CC16)
- Additional colors as needed

### Interactive Elements
- **Buttons**: Consistent styling with hover states
- **Dropdowns**: Clean, accessible design
- **Form Elements**: Standard input styling
- **Focus States**: Clear visual indicators

## Collaboration Features

### Real-Time Elements
1. **User Cursors**: Live mouse positions with user names
2. **User Avatars**: Header and slide-specific presence
3. **Comments**: Cmd/Ctrl + double-click to add
4. **Conflict Resolution**: Modal overlays for editing conflicts
5. **Live Sync**: All changes propagate immediately

### Visual Feedback
- **Online Status**: Avatar visibility and count
- **Current Slide**: Highlighted in sidebar
- **Active Users**: Green pulse dots for same-slide users
- **Editing State**: Visual indicators for who's editing what

## Responsive Design

### Desktop (Primary)
- **Minimum Width**: 1200px recommended
- **Sidebar**: Full width with labels
- **Canvas**: Optimized for 16:9 aspect ratio
- **Tools Panel**: Visible and functional

### Tablet (Secondary)
- **Sidebar**: Collapsible or icons-only
- **Canvas**: Maintains aspect ratio
- **Tools Panel**: May collapse or overlay

### Mobile (Limited Support)
- **Focus on viewing/light editing**
- **Touch-optimized controls**
- **Single-panel focus mode**

## Accessibility

### Requirements
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear visual focus indicators
- **Alternative Text**: For all visual elements

## Technical Considerations

### Performance
- **Real-time Updates**: Throttled to 10 FPS for cursors
- **Collaboration**: WebSocket connection management
- **Rendering**: Optimized canvas rendering with GSAP
- **State Management**: Efficient React state updates

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **WebSocket Support**: Required for collaboration
- **Canvas Features**: Full HTML5 canvas support needed

## Future Enhancements

### Planned Features
1. **Permission System**: Role-based access control
2. **Version History**: Change tracking and rollback
3. **Advanced Tools Panel**: Media, shapes, advanced formatting
4. **Template System**: Pre-designed slide layouts
5. **Export Options**: PDF, PowerPoint, video formats

### UI Expansion Areas
- **Tools Panel**: Rich feature set for design tools
- **Asset Library**: Media and template management
- **Settings Panel**: User preferences and project settings
- **Analytics Dashboard**: Usage and collaboration metrics

## Design Principles

### Core Values
1. **Simplicity**: Clean, uncluttered interface
2. **Collaboration**: Seamless multi-user experience
3. **Performance**: Responsive, real-time interactions
4. **Accessibility**: Inclusive design for all users
5. **Scalability**: Flexible layout for feature growth

### User Experience Guidelines
- **Minimal Learning Curve**: Intuitive controls
- **Visual Feedback**: Clear state indicators
- **Error Prevention**: Conflict resolution and auto-save
- **Progressive Enhancement**: Core features work everywhere
- **Contextual Help**: Inline guidance and tooltips

---

## Wireframe Reference

The current implementation follows this approved wireframe layout:

```
Header: [Title] ... [Avatars] [Actions] [X]
Body:   [Slides] [Canvas] [Tools]
Footer: [Private Notes]
```

**Key Design Decisions:**
- Header-based collaboration indicators (not sidebar panels)
- Slide-specific user presence visualization
- Clean, minimal interface following wireframe
- Real-time collaboration without UI interference
- Scalable layout for future feature additions

This wireframe serves as the canonical reference for layout decisions and should be consulted for any major UI changes or new feature implementations.
