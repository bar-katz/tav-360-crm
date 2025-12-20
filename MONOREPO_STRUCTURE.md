# Monorepo Structure

This project is organized as a monorepo with clear separation between frontend and backend.

## Directory Structure

```
.
├── frontend/              # React frontend application
│   ├── src/              # Frontend source code
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── Dockerfile        # Frontend Docker image
│   └── nginx/            # Nginx configuration for frontend
│
├── backend/              # Python/FastAPI backend
│   ├── src/              # Backend source code
│   ├── migrations/       # Database migrations
│   ├── seeds/            # Database seed data
│   ├── scripts/          # Utility scripts
│   ├── requirements.txt  # Python dependencies
│   ├── Dockerfile        # Backend Docker image
│   └── uploads/          # File uploads directory
│
├── docs/                 # Documentation
│   ├── features/         # Feature documentation
│   └── feature-requests/ # Feature requests
│
├── docker-compose.yml    # Docker orchestration
├── README.md             # Main README
└── DEPLOYMENT.md         # Deployment guide
```

## Benefits of Monorepo Structure

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Independent Deployment**: Each can be deployed separately
3. **Shared Documentation**: Common docs in root `docs/` directory
4. **Single Repository**: Easier to manage and version
5. **Consistent Tooling**: Shared Docker Compose, CI/CD workflows

## Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

### Docker Development
```bash
# From root directory
docker-compose up --build
```

## Docker Configuration

- **Frontend**: Built from `frontend/Dockerfile`, context is `./frontend`
- **Backend**: Built from `backend/Dockerfile`, context is `./backend`
- **Database**: PostgreSQL service in `docker-compose.yml`

## CI/CD

GitHub Actions workflows are configured to:
- Build frontend from `frontend/` directory
- Build backend from `backend/` directory
- Run tests and linting in respective directories

## File Organization

### Frontend Files
All frontend-related files are in `frontend/`:
- Source code (`src/`)
- Configuration files (`vite.config.js`, `tsconfig.json`, etc.)
- Dependencies (`package.json`)
- Docker configuration (`Dockerfile`, `nginx/`)

### Backend Files
All backend-related files are in `backend/`:
- Source code (`src/`)
- Database migrations (`migrations/`)
- Seed data (`seeds/`)
- Dependencies (`requirements.txt`)
- Docker configuration (`Dockerfile`)

### Root Files
Root directory contains:
- Docker Compose configuration
- Documentation
- Environment configuration examples
- CI/CD workflows

