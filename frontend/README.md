## Accounts login default

- username: remy1@gmail.com
- password: 123456

- username: remy2@gmail.com
- password: 123456

- username: remy3@gmail.com
- password: 123456

# ChatApp Frontend

Frontend for the ChatApp real‑time messaging application, built with **Next.js 13+ (App Router)**, **React**, **Tailwind CSS**, and **Socket.io‑client**.

## Features

- **Authentication**: Email/password with JWT, OTP email verification, Google OAuth via NextAuth.
- **Real‑time Chat**: Instant messaging, read receipts, presence indicators using Socket.io.
- **Friends**: Send / accept / reject friend requests, view friends list.
- **Conversations**: One‑on‑one/One-to-group chat view with message history, media preview, emoji picker.
- **Notifications**: In‑app toast/notifications for friend requests, etc.
- **Media Sharing**: Upload images/files (via backend Cloudinary) and preview in chat.
- **Responsive Design**: Mobile‑first layout with Tailwind CSS, works on desktop, tablet, and phone.
- **State Management**: Zustand for auth state, user info, and global UI state.
- **TypeScript**: Full type safety.
- **Linting**: ESLint with Next.js recommended rules.
- **Refresh Token**: Refresh token mechanism for handling token expiration and ensuring a seamless user experience.
- **Appearance**: Dark/light mode.

## Tech Stack

- **Framework**: Next.js 13+ (App Router) with React 18
- **Styling**: Tailwind CSS
- **UI Components**: ShadnUI, `@emoji-mart/react` for emoji picker, `@base-ui/react`
- **State**: Zustand
- **Data Fetching**: Axios (or fetch) with interceptors for auth token
- **Realtime**: socket.io-client
- **Authentication**: NextAuth.js (JWT strategy)
- **Icons**: lucide-react
- **Form Handling**: React Hook Form + Zod
- **Linting**: ESLint
- **Build**: Next.js built‑in optimizer, webpack

## Project Structure

```
frontend/
├─ src/
│   ├─ app/               # Next.js App Router (pages, layouts, route groups)
│   ├─ components/        # Reusable UI components (buttons, inputs, modals, etc.)
│   ├─ lib/               # Utilities, API clients, socket helpers, constants
│   ├─ hooks/             # Custom React hooks
│   ├─ contexts/          # React context providers (Auth, Socket, etc.)
│   └─ types/             # TypeScript type definitions
├─ public/                # Static assets (images, icons, favicon)
├─ .env.local             # Environment variables (not committed)
├─ .env.example           # Example env file
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, Yarn, pnpm, or Bun
- Running backend server (see [Backend README](../backend/README.md)) accessible at `http://localhost:5001`
  (adjust URLs in environment variables if your backend runs elsewhere)

### Installation

1. Clone the repository (if you haven't already) and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or yarn, pnpm, bun
   ```

3. Create a `.env.local` file (copy from `.env.example` if present) and fill in the values:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=random_string_used_to_encrypt_jwt
   NEXTAUTH_URL=http://localhost:3000
   ```

   > **Note**:
   >
   > - `NEXT_PUBLIC_API_URL` – base URL of the backend API (the `/api` prefix is included in the backend routes).
   > - `NEXT_PUBLIC_SOCKET_URL` – base URL for the Socket.IO connection (same host as API, without `/api`).
   > - `NEXTAUTH_URL` must match the URL where the app is served (including protocol and port). In production, set it to your domain (e.g., `https://chatapp.example.com`).

4. Start the development server:

   ```bash
   npm run dev
   # or yarn dev, pnpm dev, bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script          | Description                                              |
| --------------- | -------------------------------------------------------- |
| `npm run dev`   | Start Next.js in development mode with hot reloading.    |
| `npm run build` | Build the application for production (optimized bundle). |
| `npm start`     | Run the built application in production mode.            |
| `npm run lint`  | Run ESLint to check code quality.                        |

### Environment Variables

| Variable                 | Description                                                          | Example                                                               |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Base URL of the backend API (must be public‑facing for the browser). | `http://localhost:5001/api`                                           |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL for Socket.io-client.                           | `http://localhost:5001`                                               |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID (for sign‑in).                                | `1234567890-xxx.apps.googleusercontent.com`                           |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret.                                          | `GOCSPX-xxxxx`                                                        |
| `NEXTAUTH_SECRET`        | Secret used by NextAuth to encrypt JWT and hash tokens.              | `a3b4c5d6e7f8...` (at least 32 chars)                                 |
| `NEXTAUTH_URL`           | The URL where the application is hosted (used for callbacks).        | `http://localhost:3000` (dev) or `https://chatapp.example.com` (prod) |

### Deployment

The frontend is optimized for deployment on **Vercel** (the platform created by the makers of Next.js). Simply push your repository to a Git provider and import the project into Vercel; the platform will automatically detect the Next.js build and set up the serverless functions.

You can also deploy to any Node.js hosting that supports Next.js output (e.g., Netlify, AWS Amplify, Azure Static Web Apps, Docker). Remember to set the environment variables in the hosting provider’s dashboard.

### Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -m 'Add awesome feature'`).
4. Push to the branch (`git push origin feature/awesome-feature`).
5. Open a Pull Request.

Please follow the existing code style and ensure your changes pass the linter.

### License

No limit to use it
