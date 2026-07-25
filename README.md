# AI Chat Assistant

An AI-powered chat application built with modern web technologies. This project showcases clean architecture and modern development practices while providing a ChatGPT-like experience.

## Features

- **Modern UI/UX:** ChatGPT-inspired, responsive interface with light and dark modes.
- **Google Authentication:** Secure login with Google OAuth via Auth.js (NextAuth).
- **AI Chat:** Real-time, streaming conversations with Google Gemini.
- **Image Support:** Ask questions about uploaded images using Gemini Vision.
- **Chat Management:** Create, rename, delete, and search for chats.
- **Auto-Named Chats:** Chats are automatically named based on the first conversation.
- **Markdown & Syntax Highlighting:** Full support for markdown rendering, including code blocks with syntax highlighting.
- **State Management:** Client-side state with Zustand, server-side state with TanStack Query.
- **Database:** MongoDB Atlas for storing user profiles, chats, and messages.

## Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- React Hook Form & Zod
- TanStack Query (React Query 5)
- Zustand 5
- MUI (Material-UI)
- lucide-react

**Backend:**

- Next.js Route Handlers (Server Actions)
- MongoDB Atlas & Mongoose 9
- Google Gemini SDK (@google/genai)

**Authentication:**

- Auth.js (NextAuth) v4

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Route Handlers
│   │   ├── auth/[...nextauth]/  # Authentication routes
│   │   ├── chat/route.ts  # Main chat API (streaming)
│   │   ├── chats/route.ts # Chat CRUD operations
│   │   └── chats/[chatId]/ # Chat-specific routes
│   ├── chat/              # Chat page components
│   ├── login/             # Login page
│   └── settings/          # Settings page
├── components/            # Reusable UI components
│   ├── chat/              # Chat-specific components
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   ├── layout/            # Layout components
│   │   └── Sidebar.tsx
│   └── ui/                # Generic UI components
├── features/              # Feature-specific components
│   ├── auth/              # Authentication context
│   ├── chat/              # Query provider
│   └── theme/             # Theme providers
├── lib/                   # Utility libraries
│   ├── auth.ts            # Auth configuration
│   └── mongodb.ts         # Database connection
├── models/                # Mongoose models
│   ├── Chat.ts
│   ├── Message.ts
│   └── User.ts
├── services/              # API service layer
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## API Endpoints

| Endpoint                       | Method   | Description                             |
| ------------------------------ | -------- | --------------------------------------- |
| `/api/auth/[...nextauth]`      | GET/POST | Google OAuth authentication             |
| `/api/chat`                    | POST     | Send message to AI (streaming response) |
| `/api/chats`                   | GET      | List all user chats                     |
| `/api/chats`                   | POST     | Create new chat                         |
| `/api/chats/[chatId]`          | PATCH    | Rename chat                             |
| `/api/chats/[chatId]`          | DELETE   | Delete chat                             |
| `/api/chats/[chatId]/messages` | GET      | Get chat messages                       |
| `/api/chats/[chatId]/messages` | DELETE   | Delete a message (for regeneration)     |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas account
- Google Cloud account for OAuth credentials
- Google AI Studio account for Gemini API key

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Lint

```bash
# Build for production
npm run build

# Run linter
npm run lint
```

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

### Vercel Deployment

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2.  Import the repository on Vercel
3.  Configure environment variables in Vercel project settings:
    - Copy all values from your `.env.local` file
    - Ensure `NEXTAUTH_URL` is set to your Vercel domain
4.  Deploy!

### Environment Variables for Production

```env
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Development Notes

### Database Models

**User:** Stores user profile information linked to Google OAuth account.

**Chat:** Contains chat metadata (title, user reference, timestamps).

**Message:** Stores individual messages with role (user/assistant), content, and optional image data.

### Streaming Response

The AI chat uses Server-Sent Events (SSE) for streaming responses. The response is streamed chunk by chunk from the Google Gemini API to provide a real-time typing experience.

### Auto-Naming Feature

When a new chat receives its first message:

1. The AI responds with the answer
2. After the response completes, Gemini generates a concise title (max 5 words)
3. The title is saved to the chat document
4. The sidebar automatically refreshes to show the new title

## Future Improvements

- Implement server-side search for chats with text indexing
- Add toast notifications for user feedback
- Improve image upload with drag-and-drop and better validation
- Add support for more OAuth providers (GitHub, Apple, etc.)
- Implement pagination for chat history
- Add chat export functionality (Markdown/JSON)
- Implement rate limiting for API calls
- Add offline support with service workers

## License

This project is open source.
