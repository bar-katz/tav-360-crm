# Feature 7: Nginx Reverse Proxy Configuration

**Status:** ✅ Complete  
**Branch:** `feature/nginx-proxy`

## Description

Configure Nginx as reverse proxy for production deployment, handling SSL termination, static file serving, and API routing.

## Implementation

### Files Created

- `nginx/default.conf` - Site configuration
- `nginx/nginx.conf` - Main configuration (if needed)

### Configuration Features

#### SPA Fallback Routing
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
- All routes fallback to `index.html` for React Router
- Enables client-side routing

#### API Proxy
```nginx
location /api {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 20M;  # For file uploads
}
```
- Proxies `/api` requests to backend:8000
- Preserves headers for proper routing
- Supports file uploads up to 20MB

#### Static File Serving
```nginx
location /uploads {
    alias /app/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```
- Serves uploaded files
- Long cache headers for performance

#### Gzip Compression
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml 
           application/javascript application/json;
```
- Compresses text-based files
- Reduces bandwidth usage

#### Cache Headers
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```
- Long cache for static assets
- Improves page load performance

#### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```
- Prevents clickjacking
- Prevents MIME type sniffing
- XSS protection

### Docker Integration

Nginx configuration copied into frontend Dockerfile:
```dockerfile
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
```

### Dependencies

- Feature 1 (Docker Containerization) - Required for container setup

## Configuration Details

### Server Block
- Listens on port 80
- Server name: localhost (update for production)
- Root: `/usr/share/nginx/html` (Vite build output)

### API Routing
- All `/api/*` requests → `http://backend:8000`
- WebSocket support via Upgrade headers
- Real IP forwarding for logging

### File Upload Support
- `client_max_body_size 20M` - Allows large file uploads
- Uploads directory served separately

## SSL/TLS Configuration (Placeholder)

For production, add SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # ... rest of config
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## Usage

### Development
```bash
# Nginx runs in frontend container
docker-compose up frontend
```

### Production
1. Update server_name in nginx config
2. Add SSL certificates
3. Configure domain DNS
4. Update CORS origins in backend

## Testing

```bash
# Test frontend
curl http://localhost/

# Test API proxy
curl http://localhost/api/health

# Test file serving
curl http://localhost/uploads/test.jpg
```

## Performance Optimizations

- **Gzip:** Reduces response sizes by ~70%
- **Caching:** Static assets cached for 1 year
- **Connection Keep-Alive:** Enabled by default
- **File Upload:** Large file support (20MB)

## Notes

- Nginx runs inside frontend container
- Backend accessible only via Docker network
- Uploads directory must be mounted as volume
- Consider CDN for static assets in production
- Add rate limiting if needed
- Monitor access logs for debugging

## Security Considerations

- Update security headers as needed
- Implement rate limiting
- Add IP whitelisting if required
- Use HTTPS in production
- Regular security updates for Nginx

