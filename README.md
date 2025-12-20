# TAV 360 CRM

A self-hosted CRM system for real estate management, built with React, TypeScript, and Python/FastAPI.

## Project Structure

This is a monorepo containing:

```
.
├── frontend/          # React frontend application
├── backend/          # Python/FastAPI backend
├── docs/             # Documentation
└── docker-compose.yml # Docker orchestration
```

## Features

- Property management (residential and commercial)
- Client/buyer management
- Meeting scheduling
- Task management
- Service call tracking
- Project management
- Marketing leads management
- Role-based access control

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Python 3.11, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local backend development)

### Running with Docker

```bash
# Copy environment file
cp .env.example .env

# Edit .env file and set your frontend/backend URLs if deploying separately
# For local development, defaults work fine

# Start all services
docker-compose up --build

# Run database migrations (if not auto-run)
docker-compose exec backend python scripts/migrate.py
```

The application will be available at:
- Frontend: http://localhost:3000 (default, configurable via `FRONTEND_PORT` env var)
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/docs

**Note:** If port 80 is already in use on your system, the frontend will use port 3000 by default. You can change this by setting `FRONTEND_PORT` in your `.env` file.

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

## Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist/` directory.

## Environment Variables

See `.env.example` for required environment variables.

## Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Feature Documentation](docs/features/) - Implementation details
- [Feature Requests](docs/feature-requests/) - Planned features

## Independent Deployment

**Backend and frontend are completely independent** and can be deployed on different servers:

**Backend Deployment:**
- Set `CORS_ORIGINS` to include your frontend URL(s)
- Set `BACKEND_BASE_URL` to your backend's public URL
- Backend serves uploads directly at `/uploads`

**Frontend Deployment:**
- Set `VITE_API_BASE_URL` to your backend's public URL (e.g., `https://api.example.com/api`)
- Build with: `VITE_API_BASE_URL=https://api.example.com/api npm run build`
- Frontend makes direct API calls to backend (no proxy needed)

## License

Private - All rights reserved
