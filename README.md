# AI Chat Assistant

An AI chat application built with Next.js, MongoDB, Auth.js, and Google Gemini. The app supports image chat, chat history, automatic chat titles, and Gemini tool routing so each prompt can use the most relevant tool.

## Features

- ChatGPT-style conversation UI with light and dark themes.
- Google authentication via Auth.js (NextAuth).
- Streaming Gemini responses from a server-side route handler.
- Image uploads for multimodal chat.
- MongoDB-backed chat history, message history, and user records.
- Automatic chat naming from the first conversation.
- Gemini tool routing that selects one best tool per prompt.
- Support for current/public info via Google Search.
- Support for URL context, code execution, Google Maps, weather, and file search.
- Markdown rendering with GitHub-flavored markdown and syntax highlighting.

## Current Gemini Flow

The chat route now follows this flow:

1. A router prompt classifies the user message.
2. The router returns exactly one best tool.
3. The app calls Gemini with that single tool.
4. If the selected tool request is rate-limited, the app retries without tools so the chat still responds.

Tool selection is handled on the server in [`src/app/api/chat/route.ts`](./src/app/api/chat/route.ts).

### Tool Routing Rules

- `google_search` is used for current or time-sensitive prompts such as:
    - today’s date
    - current time
    - latest news
    - recent events
    - live/current facts
- `url_context` is used when the user provides a URL and asks about that page.
- `code_execution` is used for calculations, transforms, scripts, code, math, and structured analysis.
- `google_maps` is used for places, directions, nearby search, restaurants, hotels, and route planning.
- `file_search` is used for internal docs, notes, handbooks, or uploaded content when configured.
- `weather` is used for explicit weather questions.
- `none` is used for pure chit-chat or prompts that do not need a tool.

## Tech Stack

**Frontend**

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MUI
- React Hook Form
- Zod
- TanStack Query
- Zustand
- next-themes

**Backend**

- Next.js route handlers
- MongoDB Atlas
- Mongoose 9
- `@google/genai`

**Auth**

- Auth.js / NextAuth v4

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── chat/route.ts
│   │   ├── chats/route.ts
│   │   └── chats/[chatId]/
│   ├── chat/
│   ├── login/
│   ├── settings/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── chat/
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   └── layout/
│       └── Sidebar.tsx
├── features/
│   ├── auth/
│   ├── chat/
│   └── theme/
├── lib/
│   ├── auth.ts
│   ├── mongodb.ts
│   └── gemini/
│       ├── conversation.ts
│       ├── errors.ts
│       ├── models.ts
│       ├── tools.ts
│       └── weather.ts
├── models/
│   ├── Chat.ts
│   ├── Message.ts
│   └── User.ts
├── store/
└── types/
```

## API Endpoints

| Endpoint                       | Method   | Description                                     |
| ------------------------------ | -------- | ----------------------------------------------- |
| `/api/auth/[...nextauth]`      | GET/POST | Google OAuth authentication                     |
| `/api/chat`                    | POST     | Send a prompt to Gemini and stream the response |
| `/api/chats`                   | GET      | List chats for the current user                 |
| `/api/chats`                   | POST     | Create a new chat                               |
| `/api/chats/[chatId]`          | PATCH    | Rename a chat                                   |
| `/api/chats/[chatId]`          | DELETE   | Delete a chat                                   |
| `/api/chats/[chatId]/messages` | GET      | Fetch chat messages                             |
| `/api/chats/[chatId]/messages` | DELETE   | Delete a message for regeneration               |
| `/api/chats/[chatId]/messages` | PATCH    | Edit a message and resend                       |

<!-- ## Environment Variables

Create a `.env.local` file with the values required by your setup.

```env
GOOGLE_API_KEY=your_gemini_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
MONGODB_URI=your_mongodb_connection_string

# Optional: enable Gemini file search
GEMINI_FILE_SEARCH_STORE_NAMES=store-1,store-2
# or
GEMINI_FILE_SEARCH_STORE_NAME=store-1
``` -->

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB Atlas account or another MongoDB instance
- Google Cloud project for OAuth
- Gemini API key

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build and Lint

```bash
npm run build
npm run lint
```

## Development Notes

### Message Storage

Messages are stored in MongoDB and reloaded per chat. The UI uses optimistic updates while the server request is in flight.

### Tool Routing

The app asks Gemini which single tool is best for the prompt, then uses that tool for the real request. This helps keep answers current without sending a large tool bundle every time.

### Weather

Weather requests use a custom Gemini function that looks up the location, fetches weather data from Open-Meteo, and returns the result back to Gemini.

### File Search

File search is only enabled when `GEMINI_FILE_SEARCH_STORE_NAMES` or `GEMINI_FILE_SEARCH_STORE_NAME` is configured.

### Auto-Naming

The first message in a chat triggers a short title-generation call, and the resulting title is saved to the chat record.

## Deployment

This app is suitable for Vercel or any Node.js hosting platform that supports Next.js route handlers and MongoDB access.

Before deploying, make sure your environment variables are configured in the target platform.

## License

Open source.
