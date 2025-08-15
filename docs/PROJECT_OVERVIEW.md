# Project Overview: Collaborative Training Content Creator

Imported from `/Users/kwis/mcp/docs/collaborative-training-content-creator-guide.md`.

---

# Comprehensive Implementation Guide for Building a Collaborative Training Content Creator with Cursor AI

## Executive Summary

This guide provides a complete blueprint for using Cursor AI and similar AI coding assistants to build a sophisticated collaborative training content creator. Based on extensive research of best practices, common pitfalls, and successful implementation patterns, this document offers actionable strategies for leveraging AI effectively while maintaining code quality, security, and performance standards.

## Part 1: Cursor AI Configuration and Project Setup

### Migrating to the modern Project Rules system

Cursor has evolved from simple `.cursorrules` files to a more sophisticated **Project Rules** system. For your collaborative training platform, implement the following structure:

```
.cursor/rules/
├── core/
│   ├── nextjs-typescript.mdc      # Next.js 14 + TypeScript standards
│   ├── coding-standards.mdc       # General coding principles
│   └── security.mdc              # Security requirements
├── frameworks/
│   ├── supabase-auth.mdc         # Supabase integration patterns
│   ├── yjs-collaboration.mdc     # Real-time collaboration rules
│   ├── konva-canvas.mdc          # Canvas editor patterns
│   └── shadcn-ui.mdc             # UI component standards
└── features/
    ├── slide-editor.mdc          # Slide-based editor rules
    ├── quiz-builder.mdc          # Quiz functionality patterns
    └── anonymous-collab.mdc      # Anonymous user patterns
```

### Core configuration for Next.js 14 with TypeScript

Create `.cursor/rules/core/nextjs-typescript.mdc`:

```markdown
---
description: Next.js 14 TypeScript development standards for collaborative training platform
globs: "**/*.ts,**/*.tsx"
alwaysApply: true
---

You are an expert in TypeScript, Next.js 14 App Router, React, Supabase, Yjs, Konva.js, and shadcn/ui.

## Project Context
Building a collaborative training content creator with:
- Real-time collaboration using Yjs
- Canvas-based slide editor with Konva.js
- Anonymous collaboration with star-themed usernames
- Quiz functionality and interactive elements
- Supabase for backend and real-time features

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples
- Use functional components with TypeScript interfaces
- Prefer iteration and modularization over code duplication
- Use descriptive variable names (isLoading, hasError, canEdit)
- Structure: exported component, subcomponents, helpers, types

## TypeScript Requirements
- Use TypeScript strict mode for all code
- Prefer interfaces over types for object shapes
- Avoid enums; use const assertions or maps instead
- Define explicit return types for all functions
- Use generics for reusable components

## Performance Optimization
- Minimize 'use client' directives; favor React Server Components
- Implement code splitting for collaboration features
- Use dynamic imports for heavy libraries (Konva, Yjs)
- Optimize images with Next.js Image component
- Implement debouncing for real-time updates

## Error Handling
- Implement comprehensive error boundaries
- Add input validation for all user inputs
- Handle network failures gracefully
- Provide meaningful error messages to users
- Log errors to monitoring service

## Security Considerations
- Validate all inputs on both client and server
- Implement rate limiting for API endpoints
- Use Row Level Security in Supabase
- Sanitize user-generated content
- Implement CSRF protection
```

### Supabase integration rules

Create `.cursor/rules/frameworks/supabase-auth.mdc`:

```markdown
---
description: Supabase SSR implementation with security best practices
globs: "**/supabase/**/*.ts,**/auth/**/*.tsx"
alwaysApply: false
---

# CRITICAL: Supabase Auth SSR Rules

## 🚨 NEVER USE DEPRECATED PATTERNS
❌ NEVER: Individual cookie methods (get, set, remove)
❌ NEVER: @supabase/auth-helpers-nextjs package
✅ ALWAYS: @supabase/ssr package with getAll() and setAll()

## Correct Implementation Patterns

### Browser Client
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context - ignore
          }
        },
      },
    }
  )
}
```

## Database Schema Requirements
- Always enable Row Level Security
- Use UUID for primary keys
- Include created_at and updated_at timestamps
- Implement soft deletes where appropriate
- Use JSONB for flexible content storage
```

## Part 2: Project Management and Task Organization

[...truncated for brevity; full content preserved from source...]
