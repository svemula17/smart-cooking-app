# SmartCookingApp

An AI-powered cooking assistant with nutrition tracking, recipe discovery, guided cooking mode, and one-tap grocery delivery.

## Project Overview

SmartCookingApp helps home cooks plan, prepare, and track meals end-to-end:

- **Recipe browser** with cuisine-based discovery and personalized recommendations.
- **Cooking mode** with step-by-step guidance and built-in timers.
- **AI assistant** for ingredient substitutions, multi-dish coordination, and variety planning.
- **Nutrition tracking** with macro progress and daily logs.
- **Shopping lists** with Instacart and Walmart integrations.

## Tech Stack

### Mobile
- React Native + TypeScript
- React Navigation
- Redux Toolkit

### Backend Microservices
- **user-service** — Node.js, Express, TypeScript (auth, profiles)
- **recipe-service** — Node.js, Express, TypeScript (recipe catalog)
- **nutrition-service** — Python, FastAPI (macro/calorie computations)
- **ai-service** — Python, FastAPI, LangChain (AI assistant, dish coordination)
- **shopping-service** — Node.js, Express, TypeScript (cart + grocery integrations)

### Data
- PostgreSQL 16 (primary store)
- Redis 7 (caching, sessions, rate limiting)

### Infra
- Docker Compose for local development
- Workspaces (npm) for the monorepo

## Repository Layout

```
smart-cooking-app/
├── mobile/              # React Native app
├── backend/
│   ├── user-service/
│   ├── recipe-service/
│   ├── nutrition-service/
│   ├── ai-service/
│   └── shopping-service/
├── database/
│   ├── migrations/
│   └── seeds/
└── docker-compose.yml
```

## Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker Desktop
- Xcode (for iOS) / Android Studio (for Android)
- React Native CLI

### 1. Clone and install

```bash
git clone <repo-url>
cd smart-cooking-app
cp .env.example .env
npm install
```

### 2. Install service-level dependencies

```bash
# Node services
npm install --workspaces

# Python services
cd backend/nutrition-service && pip install -r requirements.txt && cd ../..
cd backend/ai-service && pip install -r requirements.txt && cd ../..

# Mobile
cd mobile && npm install
cd ios && pod install && cd ../..
```

## Run Locally (without Docker)

Each service can be run individually:

```bash
# user-service          http://localhost:4001
cd backend/user-service && npm run dev

# recipe-service        http://localhost:4002
cd backend/recipe-service && npm run dev

# nutrition-service     http://localhost:4003
cd backend/nutrition-service && uvicorn main:app --reload --port 4003

# ai-service            http://localhost:4004
cd backend/ai-service && uvicorn main:app --reload --port 4004

# shopping-service      http://localhost:4005
cd backend/shopping-service && npm run dev

# mobile
cd mobile && npm run ios     # or: npm run android
```

## Run with Docker

```bash
cp .env.example .env
docker-compose up --build
```

This starts:

| Service            | Port |
|--------------------|------|
| postgres           | 5432 |
| redis              | 6379 |
| user-service       | 4001 |
| recipe-service     | 4002 |
| nutrition-service  | 4003 |
| ai-service         | 4004 |
| shopping-service   | 4005 |

Stop with `docker-compose down`. Add `-v` to wipe volumes.

## Database Migrations

```bash
docker-compose exec postgres psql -U cooking -d smartcooking -f /migrations/001_create_users.sql
# ...repeat for each migration, or use a tool like node-pg-migrate
```

Seed data:

```bash
docker-compose exec postgres psql -U cooking -d smartcooking -f /seeds/recipes.sql
```

## Testing

```bash
# Node services
npm test --workspaces

# Python services
cd backend/nutrition-service && pytest
cd backend/ai-service && pytest
```

## License

MIT
