# Deployment Guide

## Architecture

**Backend and frontend are completely independent** and can be deployed on different servers/hosts.

- **Backend**: FastAPI application that serves API endpoints and uploaded files
- **Frontend**: React SPA that makes direct API calls to backend
- **Database**: PostgreSQL (can be on same server as backend or separate)

## Local Development Setup

### Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000/api
# API Docs: http://localhost:8000/docs
```

### Environment Variables

Edit `.env` file with your configuration:

**Frontend Variables (used at build time):**
- `VITE_API_BASE_URL` - Full URL to backend API (e.g., `http://localhost:8000/api`)
- `VITE_AUTH_ENABLED` - Enable/disable authentication (default: `true`)
- `VITE_APP_NAME` - Application name

**Backend Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `CORS_ORIGINS` - Comma-separated list of allowed frontend origins
- `BACKEND_BASE_URL` - Public URL of backend (for generating file URLs)

## Independent Deployment

### Backend Deployment

**Requirements:**
- Python 3.11+
- PostgreSQL database
- Port 8000 (or configure reverse proxy)

**Steps:**

1. **Set environment variables:**
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
export JWT_SECRET="your-secret-key"
export CORS_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
export BACKEND_BASE_URL="https://api.your-domain.com"
```

2. **Build and run:**
```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

3. **Or use Docker:**
```bash
cd backend
docker build -t tav360-backend .
docker run -p 8000:8000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e CORS_ORIGINS="..." \
  -e BACKEND_BASE_URL="..." \
  tav360-backend
```

**Backend serves:**
- API endpoints: `/api/*`
- Uploaded files: `/uploads/*`
- Health check: `/api/health`
- API docs: `/docs`

### Frontend Deployment

**Requirements:**
- Node.js 20+ (for build)
- Web server (Nginx, Apache, or CDN)

**Steps:**

1. **Set environment variables and build:**
```bash
cd frontend
export VITE_API_BASE_URL="https://api.your-domain.com/api"
export VITE_AUTH_ENABLED="true"
export VITE_APP_NAME="TAV 360 CRM"

npm install
npm run build
```

2. **Deploy `frontend/dist/` folder** to your web server or CDN

3. **Configure web server** (Nginx example):
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Important:** Frontend makes direct API calls to backend URL configured in `VITE_API_BASE_URL`. No proxy needed.

## Docker Compose (All-in-One)

For local development or single-server deployment:

```bash
docker-compose up --build
```

This runs:
- PostgreSQL database
- Backend API (port 8000)
- Frontend (port 80)

## Production Checklist

### Backend
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `CORS_ORIGINS` to your frontend domain(s)
- [ ] Set `BACKEND_BASE_URL` to your backend's public URL
- [ ] Use HTTPS (configure reverse proxy like Nginx)
- [ ] Set up database backups
- [ ] Configure file upload storage (consider cloud storage for production)
- [ ] Set up monitoring and logging

### Frontend
- [ ] Set `VITE_API_BASE_URL` to your backend's public URL
- [ ] Build with production environment variables
- [ ] Deploy to CDN or web server
- [ ] Enable HTTPS
- [ ] Set up proper caching headers

### Database
- [ ] Use strong database password
- [ ] Restrict database access (firewall rules)
- [ ] Set up regular backups
- [ ] Run migrations: `python backend/scripts/migrate.py`

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` includes your frontend URL exactly (with protocol and port if not 80/443)
- Check browser console for exact error message

### File Upload Issues
- Verify `BACKEND_BASE_URL` is set correctly
- Check backend `/uploads` directory permissions
- Ensure backend can write to uploads directory

### API Connection Issues
- Verify `VITE_API_BASE_URL` matches your backend URL
- Check backend is running and accessible
- Verify CORS configuration allows your frontend origin

