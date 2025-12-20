# Feature 5: JWT Authentication System

**Status:** ✅ Complete  
**Branch:** `feature/jwt-authentication`

## Description

Implement JWT-based authentication to replace Base44 auth (`base44.auth`). Includes login, logout, session management, and role-based access control.

## Implementation

### Backend Components

#### Authentication Routes (`backend/src/routes/auth.py`)
- `POST /api/auth/login` - User login endpoint
  - Accepts OAuth2PasswordRequestForm (email/password)
  - Validates credentials
  - Returns JWT access token
- `GET /api/auth/me` - Get current user info
  - Requires valid JWT token
  - Returns user details including role

#### Authentication Utilities (`backend/src/utils/auth.py`)
- `verify_password()` - Verify password against hash
- `get_password_hash()` - Hash passwords with bcrypt
- `create_access_token()` - Generate JWT tokens
- `get_current_user()` - Dependency for protected routes

#### User Model (`backend/src/models/user.py`)
- Email, password_hash, full_name
- app_role enum (admin, office_manager, agent, property_manager, project_manager)
- Password hashing handled automatically

### Frontend Components

#### Auth Context (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- Login/logout functions
- User data and token storage
- Loading states
- Automatic token refresh on mount

#### Login Page (`src/pages/Login.tsx`)
- Email/password form
- Error handling
- Loading states
- Redirects to dashboard on success

#### Protected Route Component (`src/components/ProtectedRoute.tsx`)
- Route guard wrapper
- Checks authentication status
- Redirects to login if not authenticated
- Supports role-based access control

### Integration Points

#### Layout Component (`src/pages/Layout.jsx`)
- Updated to use `useAuth()` hook
- Fetches user on mount
- Filters navigation based on user role
- Shows loading state while fetching user

#### Routing (`src/pages/index.jsx`)
- Added `/login` route
- Wrapped all routes with `ProtectedRoute`
- Public routes accessible without auth

#### Main App (`src/main.jsx`)
- Wrapped with `AuthProvider`
- Provides auth context to entire app

### Dependencies

- Feature 3 (Backend API Server) - Required for auth endpoints
- Feature 4 (Database Schema) - Required for users table

## Authentication Flow

1. User enters email/password on login page
2. Frontend sends credentials to `POST /api/auth/login`
3. Backend validates credentials against database
4. Backend generates JWT token with user email and role
5. Frontend stores token in localStorage
6. Frontend fetches user data from `GET /api/auth/me`
7. Token included in Authorization header for all API requests
8. Backend validates token on protected routes

## Token Structure

```json
{
  "sub": "user@example.com",
  "role": "admin",
  "exp": 1234567890
}
```

## Role-Based Access Control

Roles defined:
- `admin` - Full access
- `office_manager` - Management access
- `agent` - Brokerage access
- `property_manager` - Property management access
- `project_manager` - Project management access

Navigation filtered based on user role in `Layout.jsx`.

## Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Expiration:** Configurable (default 24 hours)
- **Token Storage:** localStorage (consider httpOnly cookies for production)
- **CORS:** Configured for allowed origins only
- **Protected Routes:** All API routes require authentication except `/api/health`

## Usage

### Login

```typescript
const { login } = useAuth();
await login(email, password);
```

### Check Authentication

```typescript
const { isAuthenticated, user } = useAuth();
if (isAuthenticated) {
  console.log(user.app_role);
}
```

### Logout

```typescript
const { logout } = useAuth();
logout();
```

### Protected Routes

```tsx
<ProtectedRoute requiredRole={['admin', 'office_manager']}>
  <AdminPanel />
</ProtectedRoute>
```

## Configuration

**Backend (.env):**
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Frontend (.env):**
```bash
VITE_AUTH_ENABLED=true
```

## Testing

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=test123"

# Test protected route
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- Default admin user created in migrations (change password in production!)
- Token expiration should be adjusted based on security requirements
- Consider implementing refresh tokens for better security
- Add rate limiting for login endpoint to prevent brute force
- Implement password reset functionality if needed

