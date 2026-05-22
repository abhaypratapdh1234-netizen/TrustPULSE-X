# ⚡ TrustPULSE X — Premium AI Reputation Intelligence Platform

TrustPULSE X is a production-grade, full-stack company reputation and review analytics platform. Powered by AI and NLP algorithms, it compiles, verifies, and benchmarks company reputations across multiple source domains to provide actionable sentiment dashboards.

---

## ✨ Features

- **🛡️ Trust Score™ Algorithm**: Proprietary AI score computation taking rating distribution, review frequency, sentiment indicators, and toxicity alerts into consideration.
- **🧠 AI Sentiment Aggregation**: Live sentiment analysis of hundreds of reviews to identify positive highlights, critical pain points, and keywords.
- **⚖️ Side-by-Side Benchmarking**: Compare up to 4 companies simultaneously with overlaid radar graphs and metric matrices.
- **💬 Smart Conversational Agent**: Embedded AI chatbot customized to answer queries specific to any selected company's history and reviews logs.
- **🎨 Glassmorphic Multi-Theme Engine**: Sleek, immersive interfaces utilizing premium gradients across 5 unique visual styles.
- **📦 P2P Reviews**: Users can submit new reviews, triggering automatic real-time database calculations and AI auditing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v3, Framer Motion, Recharts, React Router v6, Axios |
| **State** | Redux Toolkit (Central Stores) + React Context API (Auth & App Systems) |
| **Backend** | Node.js, Express.js (MVC Architecture) |
| **Database** | MongoDB, Mongoose ODM |
| **Docker** | Multi-stage client builds, Nginx reverse proxying, docker-compose orchestration |

---

## 📂 Project Structure

```
├── client/                     # Vite + React SPA Frontend
│   ├── public/                 # Favicons & manifest.json
│   ├── src/
│   │   ├── components/         # Layout & Chart UI components
│   │   ├── context/            # Auth & App React Context
│   │   ├── pages/              # Premium visual views (Dashboard, Compare, etc.)
│   │   ├── services/           # Axios HTTP API services
│   │   ├── store/              # Redux central slices
│   │   └── index.css           # Global layout typography & 5 themes variables
├── server/                     # Express.js REST API Backend
│   ├── config/                 # DB connectors & passport oauth strategies
│   ├── controllers/            # MVC route handlers
│   ├── middleware/             # Sanitization, rate limiting & auth interceptors
│   ├── models/                 # Mongoose schemas (User, Company, Review)
│   ├── routes/                 # Express API router definitions
│   └── utils/                  # Winston logger & mock seed script utilities
├── docker-compose.yml          # Container configuration
└── .env.example                # Unified environmental template
```

---

## 🚀 Quick Start Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Seed and Run Backend
```bash
# Navigate to backend
cd server

# Install dependencies
npm install

# Copy configuration
cp .env.example .env

# Seed MongoDB with 10 companies & hundreds of AI logs
node utils/seedData.js

# Launch development API (Server runs on port 5000)
npm run dev
```

### 2. Run Frontend Client
```bash
# Navigate to frontend
cd ../client

# Install dependencies
npm install

# Launch Vite development client (UI runs on port 3000)
npm run dev
```

---

## 🐳 Docker Deployment

To launch the complete infrastructure using Docker containers (including isolated client, API, and MongoDB with volume mapping):

```bash
# Build and run containers
docker-compose up --build
```
The client will be served at `http://localhost:3000` with the Express API reverse-proxied internally through Nginx.

---

## 🔒 Security Practices

- **Helmet.js** protection headers
- **Express-Rate-Limit** route blocking
- **Mongo-Sanitize** against database injection
- **JWT Authorization** with client authorization header interceptors
