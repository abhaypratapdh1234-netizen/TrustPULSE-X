# ⚡ TrustPULSE X — Premium AI Reputation Intelligence Platform

TrustPULSE X is a production-grade, full-stack company reputation and review analytics platform. Powered by AI and NLP algorithms, it compiles, verifies, and benchmarks company reputations across multiple source domains to provide actionable sentiment dashboards.

---

## ✨ Features

- **🛡️ Trust Score™ Algorithm**: Proprietary AI score computation taking rating distribution, review frequency, sentiment indicators, and toxicity alerts into consideration.
- **🧠 AI Sentiment Aggregation**: Live sentiment analysis of hundreds of reviews to identify positive highlights, critical pain points, and keywords.
- **⚖️ Side-by-Side Benchmarking**: Compare up to 4 companies simultaneously with overlaid radar graphs and metric matrices.
- **💬 Smart Conversational Agent**: Embedded AI chatbot customized to answer queries specific to any selected company's history and reviews logs.
- **🎨 Glassmorphic Multi-Theme Engine**: Sleek, immersive interfaces utilizing premium gradients across 3 unique visual styles (Dark, Plain White, and Cream-Green).
- **📦 P2P Reviews**: Users can submit new reviews, triggering automatic real-time database calculations and AI auditing.
- **🎨 Theme-Adaptive Design**: Perfect readability across all themes with dynamic CSS-variable highlights (`--hover-bg` and `.hover-bg-theme`) and customized contrast borders for circular/horizontal progress meters.
- **🚀 Logos.hunter.io Integration**: Real-time company logo rendering backend utilizing the free and reliable Logos Hunter API with automatic suffix filtering (e.g. stripping `Inc`, `Corp`, `PLC`) for precise brand imagery.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v3, Framer Motion, Recharts, React Router v6, Axios |
| **State** | Redux Toolkit (Central Stores) + React Context API (Auth & App Systems) |
| **Backend** | Node.js, Express.js (MVC Architecture) |
| **Database** | MongoDB, Mongoose ODM |
| **Orchestration** | Multi-stage client builds, Nginx reverse proxying, docker-compose orchestration |

---

## 📂 Project Structure

```text
├── client/                     # Vite + React SPA Frontend
│   ├── public/                 # Favicons & manifest.json
│   └── src/
│       ├── components/         # Layout, Chart, & Theme-Adaptive Brand Logo UI components
│       ├── context/            # Auth & App React Context
│       ├── pages/              # Premium visual views (Dashboard, Compare, Profile, etc.)
│       ├── services/           # Axios HTTP API services
│       └── index.css           # Global layout typography & theme variable definitions
├── server/                     # Express.js REST API Backend
│   ├── config/                 # DB connectors & passport oauth strategies
│   ├── controllers/            # MVC route handlers
│   ├── middleware/             # Sanitization, rate limiting & auth interceptors
│   ├── models/                 # Mongoose schemas (User, Company, Review)
│   └── utils/                  # Winston logger, scrapers & seed script utilities
├── docs/                       # Project documentation & templates
│   ├── .env.example            # Unified environmental template
│   └── PROJECT_DETAILS.md      # Comprehensive architectural details
├── scripts/                    # Logo optimization & helper utilities
│   ├── crop_and_make_transparent.py
│   ├── make_bold.py
│   ├── make_transparent.py
│   └── make_white_transparent.py
├── setup/                      # Unified workspace setup & container configuration
│   ├── docker-compose.yml      # Container orchestration config
│   ├── package.json            # Unified execution package config
│   └── package-lock.json       # Configured package locks
└── .gitignore                  # Git tracking configuration (Root-level)
```

---

## 🚀 Quick Start Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Unified Environment Setup
We have streamlined all installation and execution scripts inside the `setup/` folder to keep your root directory tidy and optimized.

```bash
# Navigate to the setup directory
cd setup

# Install all packages (root, server, and client) at once
npm run install-all

# Create your server environment configuration
cp ../docs/.env.example ../server/.env
# Note: Be sure to fill in your API keys in server/.env (e.g. APFY_API_KEY, OUTSCRAPER_API_KEY)
```

### 2. Run Database & Application Concurrently
Start your MongoDB service and launch the development environment concurrently:

```bash
# Start your local MongoDB database service (Choose your installed version)
npm run start-mongod-8.2

# Start both the frontend client and the API server concurrently
npm run dev
```

*   **Frontend Client**: [http://localhost:3000/](http://localhost:3000/)
*   **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🐳 Docker Deployment

To launch the complete infrastructure using Docker containers (including isolated client, API, and MongoDB with volume mapping):

```bash
# Navigate to the setup directory
cd setup

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
- **Reset Password validation** and secure sidebar validation state transitions
