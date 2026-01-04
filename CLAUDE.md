# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates the code which renders in real-time in an iframe preview.

## Commands

```bash
npm run dev          # Start development server (Next.js with Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run all tests (vitest)
npx vitest run path/to/file.test.ts  # Run a single test file
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database (destructive)
```

## Architecture

### Core Data Flow

1. User sends message via chat interface
2. `POST /api/chat` receives message + serialized virtual file system
3. Claude (or mock provider if no API key) generates code using tools
4. AI tools (`str_replace_editor`, `file_manager`) modify the virtual file system
5. Changes stream back to client, updating React context
6. `PreviewFrame` transforms JSX via Babel and renders in sandboxed iframe
7. If authenticated, messages + files persist to SQLite via Prisma

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature (chat/, editor/, preview/, auth/, ui/)
- `src/lib/` - Core logic: virtual file system, AI provider, auth, contexts, tools
- `src/actions/` - Server Actions for auth and project CRUD
- `prisma/` - Database schema

### Important Files

- `src/lib/file-system.ts` - Virtual file system class (in-memory, no disk writes)
- `src/lib/provider.ts` - AI model provider (Anthropic Claude or mock fallback)
- `src/lib/transform/jsx-transformer.ts` - Babel-based JSX transformation for preview
- `src/lib/contexts/file-system-context.tsx` - File system state management
- `src/lib/contexts/chat-context.tsx` - Chat state with AI SDK integration
- `src/app/api/chat/route.ts` - Main AI generation endpoint
- `src/lib/tools/str-replace.ts` - AI tool for creating/editing files
- `src/lib/tools/file-manager.ts` - AI tool for rename/delete operations

### Virtual File System & Preview

The app uses an in-memory `VirtualFileSystem` class that stores files as a tree structure. When files change:
1. `FileSystemContext` increments `refreshTrigger`
2. `PreviewFrame` detects the change and rebuilds the preview
3. JSX files are transpiled with Babel, external imports map to esm.sh CDN
4. Local imports become blob URLs
5. An ES module import map is generated and injected into the iframe

### Database

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database. Two models: `User` and `Project`. Projects store messages and file data as JSON strings.

### Authentication

JWT-based auth with tokens stored in HTTP-only cookies. Session verification happens in middleware and Server Actions. Anonymous users can use the app but their work isn't persisted to the database.

### AI Provider

Set `ANTHROPIC_API_KEY` in `.env` to use Claude. Without it, a `MockLanguageModel` provides static responses for testing the UI flow.

## Code Style

- Use comments sparingly. Only comment complex code.

## Tech Stack

- Next.js 15 with App Router and Turbopack
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma with SQLite
- Vercel AI SDK with Anthropic
- Monaco Editor for code editing
- Radix UI components (shadcn style)
