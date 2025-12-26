# Quick Start Guide - TAV 360 CRM

## Access the Application

1. **Frontend URL**: http://localhost:3000
2. **Backend API**: http://localhost:8000/api
3. **Health Check**: http://localhost:8000/api/health

## Login Credentials

### בר כץ (Bar Katz) - WhatsApp User
- **Email**: `barkatz13897@gmail.com`
- **Password**: `test123`
- **Role**: `agent`
- **Phone**: `054-5569919`

### Admin User
- **Email**: `admin@test.com`
- **Password**: `test123`
- **Role**: `admin`

### Other Test Users
- **Email**: `agent@test.com`
- **Password**: `test123`
- **Role**: `agent`

- **Email**: `manager@test.com`
- **Password**: `test123`
- **Role**: `office_manager`

## Current Database Status

✅ **Data is populated:**
- 539 Properties
- 213 Buyers/Clients
- 12 Meetings this week
- Recent activity data available

## Troubleshooting Empty Website

If you see an empty website:

1. **Check if you're logged in:**
   - Go to http://localhost:3000
   - You should see a login page
   - Log in with credentials above

2. **Check browser console:**
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Check Network tab for failed API calls

3. **Verify services are running:**
   ```bash
   docker compose ps
   ```

4. **Check backend logs:**
   ```bash
   docker compose logs backend --tail 50
   ```

5. **Test API directly:**
   ```bash
   # Test login
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=barkatz13897@gmail.com&password=test123"
   
   # Test dashboard (replace TOKEN with token from login)
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/dashboard/stats/main
   ```

## Populate Development Database

To populate/refresh the development database:

```bash
# Copy seed file to container
docker compose cp backend/seeds/development.sql db:/tmp/development.sql

# Run seed file
docker compose exec db psql -U tav360 -d tav360_crm -f /tmp/development.sql
```

## Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart db
```

## Common Issues

### Blank White Page
- Check browser console for JavaScript errors
- Verify frontend is running: `docker compose ps`
- Check if redirected to `/login` (need to authenticate)

### Dashboard Shows No Data
- Verify you're logged in
- Check browser console for API errors
- Verify backend is running and accessible
- Check CORS configuration

### API Errors
- Verify backend is running: `docker compose logs backend`
- Check database connection: `docker compose logs db`
- Verify CORS allows `http://localhost:3000`

## Next Steps

1. Log in at http://localhost:3000
2. Navigate to Dashboard
3. You should see:
   - 539 Properties
   - 213 Buyers
   - 12 Meetings this week
   - Recent activity feed

