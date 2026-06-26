# ⚡ DevPlatform — AI-Powered Developer Productivity Platform

DevPlatform is a next-generation workspace that unites artificial intelligence, real-time team collaboration, repository analytics, and productivity tracking under a single, unified interface. 

With a modern dark aesthetic, high-fidelity metrics, and real-time synchronizations, DevPlatform accelerates delivery velocity and simplifies project coordination for modern engineering teams.

---

## 🚀 Key Features

*   **🔍 Repository Health Analyzer**: Connect Git repositories to automatically audit build complexity, dependency security, tech stacks, and general repo health scores.
*   **🤖 AI Code Explainer & Fixer**: Powered by Google Gemini AI. Analyze complex code blocks, decipher legacy systems, inspect memory overhead, and apply auto-fixes for syntax bugs.
*   **📋 Real-Time Kanban Board**: Coordinate task statuses with a drag-and-drop web socket-synchronized board. Assign owners, set priority levels, and trigger live updates.
*   **📊 Productivity Analytics**: Track weekly code velocity, pull request cycles, commit rates, and workload curves via dynamic graphs and insights.

---

## 🛠️ Technology Stack

### Frontend
*   **Core**: React 19, Next.js 16 (Turbopack)
*   **Styling**: Tailwind CSS v4, Framer Motion (for animations and scroll reveals)
*   **State Management**: Zustand
*   **Communication**: Axios, Socket.io-Client

### Backend
*   **Runtime/Framework**: Node.js, Express.js 5 (TypeScript)
*   **Database**: MongoDB (via Mongoose)
*   **Caching & Queue**: Redis (via ioredis) & BullMQ (for background AI processing)
*   **AI Integration**: Google Generative AI SDK (Gemini API)
*   **Security & Log**: Helmet, CORS, JWT, bcryptjs, Winston Logger

---

## 📂 Project Structure

This project is managed as an NPM monorepo workspace:

```
devplatform/
├── apps/
│   ├── frontend/             # Next.js (React 19) App Router web app
│   └── backend/              # Node/Express TypeScript server & queue workers
├── package.json              # Root configurations and workspace scripts
└── README.md                 # Main workspace documentation
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (v20 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
*   [Redis](https://redis.io/) (Used for caching and BullMQ jobs)

---

### 1. Clone & Install Dependencies

From the workspace root directory:

```bash
# Install dependencies for both frontend and backend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`apps/backend/.env`)
Create a `.env` file inside `apps/backend/` and configure the following parameters:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Databases
MONGODB_URI=mongodb://127.0.0.1:27017/devplatform
DB_NAME=devplatform

# Redis Configurations
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Third-Party API Integrations
GEMINI_API_KEY=your_google_gemini_api_key
GITHUB_TOKEN=your_github_personal_access_token
```

#### Frontend (`apps/frontend/.env`)
Create a `.env` file inside `apps/frontend/` and configure the following parameters:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 3. Running the Project Locally

You can run both the frontend and backend applications from the root folder using workspace scripts:

```bash
# Run the Express.js Backend Server
npm run dev:backend

# Run the Next.js Frontend Server
npm run dev:frontend
```

Once running:
*   Frontend: [http://localhost:3000](http://localhost:3000)
*   Backend API: [http://localhost:5000](http://localhost:5000)
*   Backend Health Endpoint: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🧑‍💻 Development Workflows

*   **Production Build**: To compile static assets and prepare production versions, run `npm run build` in the respective workspaces.
*   **Linting**: Verify TypeScript definitions using `npm run lint`.
