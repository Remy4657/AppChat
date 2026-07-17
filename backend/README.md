# ChatApp Backend: Real-Time Messaging API

## Overview

A robust, scalable backend service powering a real-time messaging application. Built with Node.js and Express, this API handles authentication, real-time communication, data persistence, and media management for a complete chat application experience.

## Key Features Implemented

### Authentication & Security

- **JWT Authentication System**: Secure access tokens with refresh token rotation
- **HTTP-only Cookie Storage**: Protected refresh tokens to prevent XSS attacks
- **Email OTP Verification**: Two-factor authentication for user registration
- **Google OAuth Integration**: Third-party authentication provider support
- **Role-based Access Control**: Protected endpoints with middleware authentication
- **Security Headers**: Helmet.js implementation for common web vulnerabilities
- **Rate Limiting**: API abuse prevention with express-rate-limit
- **Data Validation**: Comprehensive input validation and sanitization
- **Password Security**: Bcrypt hashing with salt rounds for secure storage

### Real-Time Communication

- **Socket.IO v4 Implementation**: Bidirectional, low-latency communication
- **Room-based Architecture**: Efficient message broadcasting to specific conversations
- **Presence Awareness**: Online/offline user status tracking
- **Read Receipts**: Real-time message seen/unseen status synchronization
- **Typing Indicators**: Live user activity feedback
- **Automatic Reconnection**: Network resilience with exponential backoff
- **Namespace Organization**: Separated concerns for different event types

### Social & Messaging Features

- **Friend Management System**: Request lifecycle (send, accept, reject, block)
- **Conversation Management**: One-to-one and group chat creation
- **Message Persistence**: MongoDB storage with efficient querying
- **Media Upload Handling**: File processing and Cloudinary storage integration
- **Message Types**: Text, image, and file attachments
- **Conversation Search**: Efficient lookup of conversations and users
- **Notifications**: Real-time alerts for friend requests and messages

### Data Management & Infrastructure

- **MongoDB Atlas**: Cloud-based NoSQL database with Mongoose ODM
- **Schema Design**: Optimized data models for relationships and queries
- **Redis Integration**: Caching layer for OTP verification and session storage
- **Horizontal Scoring**: Stateless architecture ready for load balancing
- **Connection Pooling**: Efficient database connection management
- **Indexing Strategy**: Optimized database queries for performance
- **Data Validation**: Mongoose schema validation at model level
- **Error Handling**: Centralized error handling with meaningful responses

### API Documentation & Developer Experience

- **Interactive Swagger UI**: Auto-generated API documentation at `/api-docs`
- **Comprehensive Endpoint Documentation**: Detailed request/response schemas
- **Authentication Documentation**: Clear guidance on protected routes
- **Error Response Standards**: Consistent error formats across all endpoints
- **Versioned API Structure**: Ready for future API iterations
- **Code Organization**: Modular structure separating concerns clearly

## Technical Architecture

### Backend Stack

- **Runtime**: Node.js (v18+) with modern JavaScript features
- **Framework**: Express.js for robust, middleware-based architecture
- **Real-time Engine**: Socket.IO v4 for WebSocket connections with fallbacks
- **Database**: MongoDB with Mongoose ODM for schema validation and relationships
- **Caching Layer**: Redis for OTP storage and pub/sub messaging
- **Authentication**:
  - JSON Web Tokens (jsonwebtoken) for access tokens
  - bcrypt for password hashing
  - nodemailer for email services
  - google-auth-library for OAuth verification
- **File Storage**: Cloudinary API for scalable media storage
- **Logging**: Winston for structured, transport-based logging
- **Environment**: dotenv for secure configuration management
- **Validation**: Express-validator for request sanitization
- **API Documentation**: swagger-ui-express for interactive docs
- **Development**: nodemon for hot-reloading during development

### Database Schema Design

- **User Model**: Profile information, authentication fields, timestamps
- **Conversation Model**: Participants, metadata, timestamps, group flags
- **Message Model**: Sender references, content, media URLs, timestamps, read status
- **Friend Request Model**: Requester, recipient, status, timestamps
- **Indexing Strategy**: Compound indexes on frequently queried fields
- **Relationships**: Proper references and virtual populate for efficient queries

### Real-Time Architecture

- **Namespace Strategy**: Separate namespaces for different event types
- **Room Management**: Dynamic room creation/joining for conversations
- **Event Acknowledgement**: Guaranteed message delivery with callbacks
- **Broadcast Optimization**: Efficient emission to specific rooms/users
- **Presence Tracking**: Socket connection/disconnection handling for user status
- **Scalability Considerations**: Stateless adapters for horizontal scaling

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers and response formatting
│   ├── services/       # Business logic and external service interactions
│   ├── models/         # Mongoose schemas and database interactions
│   ├── routes/         # API route definitions and middleware attachment
│   ├── middlewares/    # Custom middleware (auth, validation, error handling)
│   ├── libs/           # Utility modules (DTOs, helpers, constants)
│   ├── socket/         # Socket.IO initialization and event handlers
│   └── server.js       # Application entry point and middleware setup
├── .env                # Environment variables (see .env.example)
├── .env.example        # Template for environment configuration
├── package.json        # Dependencies and scripts
└── swagger.json        # OpenAPI 3.0 specification for API documentation
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB Atlas account or local MongoDB instance
- Redis instance (RedisLabs, Redis Cloud, or local)
- Cloudinary account for media storage
- Google Developer Console project (optional, for Google OAuth)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration:
# PORT=5001
# CLIENT_URL=http://localhost:3000
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db?retryWrites=true&w=majority
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# GOOGLE_CLIENT_ID=your_google_client_id (optional)
# JWT_SECRET=your_32_char_secret_key
# REDIS_URL=redis://default:password@host:port
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password_or_otp

# Start development server
npm run dev
# Server runs on http://localhost:5001
# API docs available at http://localhost:5001/api-docs
```

### Available Scripts

- `npm run dev` - Start server with nodemon for hot reloading
- `npm start` - Start production server (Node.js)
- `npm run debug` - Start with inspector for debugging
- `npm run debug-brk` - Start with inspector and break on first line

### Environment Variables

| Variable                | Description                            | Example                                     |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| `PORT`                  | Server port (default: 5001)            | `5001`                                      |
| `CLIENT_URL`            | Frontend origin for CORS               | `http://localhost:3000`                     |
| `MONGO_URI`             | MongoDB connection string              | `mongodb+srv://...`                         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                  | `your_cloud_name`                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                     | `your_api_key`                              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                  | `your_api_secret`                           |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID (optional)      | `1234567890-xxx.apps.googleusercontent.com` |
| `JWT_SECRET`            | Secret for signing JWTs                | `your_super_secret_key`                     |
| `REDIS_URL`             | Redis connection URL                   | `redis://default:pass@host:port`            |
| `EMAIL_USER`            | Email for sending OTP (via Nodemailer) | `your_email@gmail.com`                      |
| `EMAIL_PASS`            | Password/App-specific token for email  | `your_app_password`                         |

## Deployment

The backend is designed for deployment on any Node.js hosting platform:

- **Render** - Easy deployment with automatic SSL
- **Railway** - Simple Git-connected deployment
- **Fly.io** - Global deployment with Docker
- **AWS EC2** - Full control with Elastic Beanstalk option
- **DigitalOcean App Platform** - Managed Node.js hosting
- **Heroku** - Traditional PaaS option
- **Docker** - Containerized deployment anywhere

## Key Learnings & Accomplishments

- **Full-stack Architecture**: Designed and implemented complete backend for real-time application
- **Real-time Systems**: Built scalable Socket.io architecture with room-based messaging
- **Authentication Systems**: Implemented secure JWT refresh token rotation with HTTP-only cookies
- **Database Design**: Created efficient MongoDB schema with proper indexing and relationships
- **Third-party Integrations**: Integrated Cloudinary (storage), Google Auth (OAuth), Nodemailer (email)
- **Caching Strategies**: Implemented Redis for OTP verification and session management
- **API Design**: RESTful API with consistent response patterns and comprehensive documentation
- **Security Hardening**: Implemented OWASP recommendations including Helmet, rate limiting, input validation
- **Performance Optimization**: Optimized database queries, implemented connection pooling, efficient event broadcasting
- **DevOps Practices**: Container-ready application with proper logging and environment management
- **Testing & Debugging**: Systematic approach to resolving real-time synchronization and scaling challenges

## API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:5001/api-docs
```

Features:

- Interactive endpoint testing
- Detailed request/response examples
- Authentication requirement indicators
- Error response schemas
- Code snippets for multiple languages
