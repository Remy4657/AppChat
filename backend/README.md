# ChatApp Backend

Backend server for the ChatApp real-time messaging application.

## Features

- **Authentication**: JWT-based access tokens, refresh tokens, email OTP verification, Google OAuth.
- **Real-time Communication**: Socket.IO for instant messaging, new message, read receipts, mark seen messages.
- **Friend Management**: Send/receive friend requests, accept/reject, view friends list.
- **Conversations**: One‑on‑one/One-to-group chats with message persistence, media sharing.
- **Notifications**: In‑app notifications for friend requests, etc.
- **Media Upload**: Image and file uploads via Cloudinary.
- **Security**: Rate limiting, CORS, cookie‑parser, Helmet, bcrypt password hashing.
- **API Documentation**: Interactive Swagger UI at `/api-docs`.
- **Caching & Pub/Sub**: Redis for session store (OTP).
- **Database**: MongoDB with Mongoose ODM.

## Tech Stack

- **Runtime**: Node.js (>=18)
- **Framework**: Express.js
- **Realtime**: Socket.IO v4
- **Database**: MongoDB + Mongoose
- **Cache / PubSub**: Redis
- **Authentication**: jsonwebtoken, bcrypt, nodemailer, google-auth-library, next-auth (frontend)
- **File Storage**: Cloudinary
- **Logging**: winston
- **Environment**: dotenv
- **Docs**: Swagger UI Express
- **Dev Tooling**: nodemon

## Project Structure

```
backend/
├─ src/
│   ├─ controllers/   # Request handlers
│   ├─ services/      # Business logic
│   ├─ models/        # Mongoose schemas
│   ├─ routes/        # API route definitions
│   ├─ middlewares/   # Custom middleware (auth, validation, error)
│   ├─ libs/          # Utility modules (DTOs, helpers)
│   ├─ socket/        # Socket.IO initialization and event handlers
│   └─ server.js      # Entry point
├─ .env               # Environment variables (see .env.example)
├─ package.json
└─ swagger.json       # OpenAPI specification
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas or local MongoDB instance
- Redis instance (e.g., RedisLabs, Redis Cloud, or local)
- Cloudinary account for media storage
- Google OAuth credentials (optional, for Google sign‑in)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the example below (or copy `.env.example` if provided) and fill in your values:

   ```dotenv
   CLIENT_URL=http://localhost:3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   JWT_SECRET=your_super_secret_jwt_key
   REDIS_URL=redis://default:password@host:port
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_or_otp
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5001` (or the port defined in `PORT`).

### Available Scripts

- `npm run dev` – Start server with nodemon for hot reload.
- `npm start` – Start production server (Node.js).
- `npm run debug` – Start with inspector for debugging.
- `npm run debug-brk` – Start with inspector and break on first line.

### API Documentation

Once the server is running, visit:

```
http://localhost:5001/api-docs
```

to view the interactive Swagger UI.

### Environment Variables

| Variable                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `PORT`                  | Port to run the server (default: 5001)               |
| `CLIENT_URL`            | Frontend origin for CORS                             |
| `MONGO_URI`             | MongoDB connection string                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                                |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID (optional)                    |
| `JWT_SECRET`            | Secret for signing JWTs                              |
| `REDIS_URL`             | Redis connection URL                                 |
| `EMAIL_USER`            | Email address for sending OTP (via Nodemailer)       |
| `EMAIL_PASS`            | Password or App‑specific token for the email account |

### Deployment

The backend can be deployed to any Node.js hosting platform (e.g., Render, Railway, Fly.io, AWS EC2, DigitalOcean App Platform). Ensure the environment variables are set accordingly.

### License

No limit.
