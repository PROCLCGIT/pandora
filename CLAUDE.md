# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application with:
- Backend: Django REST API (`backend/`) using Django 5.2 with Django REST Framework
- Frontend: React application (`pandora/`) using Vite as the build tool
- Database: MySQL
- Authentication: JWT tokens with cookies

## Development Commands

### Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (create virtual environment first)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver  # Runs on http://localhost:8000

# Run tests (if implemented)
python manage.py test
```

### Frontend (React/Vite)

```bash
# Navigate to frontend directory
cd pandora

# Install dependencies
npm install

# Run development server
npm run dev  # Runs on http://localhost:3000

# Build for production
npm run build

# Run tests
npm test
npm run test:auth  # Auth tests only
npm run test:ui   # With visual interface
npm run test:headed  # With visible browsers
```

## Architecture Overview

### Backend Structure

The Django backend is organized into multiple apps:
- `users/`: Custom user model and authentication
- `basic/`: Core business data (categories, cities, brands, etc.)
- `directorio/`: Directory management (clients, contacts, suppliers)
- `productos/`: Product management with image handling
- `proformas/`: Proforma (quote) management
- `docmanager/`: Document management
- `importexport/`: Data import/export functionality

Key backend features:
- Custom JWT authentication using cookies (`users/auth_backend.py`)
- Environment-based configuration with `django-environ`
- CORS configured for frontend interaction
- MySQL database with connection pooling
- Media file handling for product images

### Frontend Structure

The React frontend uses a modular architecture:
- `src/modulos/`: Feature modules for different business domains
- `src/components/ui/`: Reusable UI components
- `src/config/`: Axios configuration and constants
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions

Authentication flow:
- JWT tokens stored in HttpOnly cookies
- Automatic token refresh
- Session management with visual feedback
- Protected routes with role-based access

### Authentication Implementation

The system uses JWT tokens with cookies:
1. Frontend makes login request to `/api/auth/login/`
2. Backend returns access and refresh tokens in HttpOnly cookies
3. Frontend includes cookies automatically in all requests
4. Token refresh happens automatically when access token expires
5. Backend validates tokens from cookies, not headers

Key files:
- Backend: `users/auth_backend.py`, `users/auth_views.py`
- Frontend: `src/modulos/auth/authContext.jsx`, `src/config/axios.js`

## Environment Configuration

Both backend and frontend use environment variables:

Backend (`.env` in `backend/`):
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DB_NAME=database_name
DB_USER=database_user
DB_PASSWORD=database_password
DB_HOST=localhost
DB_PORT=3306
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=45
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1
```

Frontend environment variables are configured in Vite and can be set in `.env` files.

## Common Development Tasks

### Adding a New Backend API Endpoint
1. Create/update serializer in `<app>/serializers.py`
2. Create/update viewset in `<app>/views.py`
3. Register route in `<app>/urls.py`
4. Update main `pandora/urls.py` if new app

### Adding a New Frontend Module
1. Create module directory under `src/modulos/`
2. Create components, pages, and routes
3. Add API service in module's `api/` directory
4. Register routes in main `src/routes.jsx`

### Working with Product Images
- Images are handled by `productos/` app
- Multiple sizes generated automatically
- WebP format used by default
- ImageKit used for processing

## Testing

Frontend tests use Playwright for E2E testing:
- Test files in `pandora/tests/e2e/`
- Focus on authentication flows
- Mock API responses for reliability
- Visual regression testing available

## Important Notes

- Always use environment variables for sensitive data
- Frontend uses path aliases (@components, @modulos, etc.)
- Backend requires MySQL database
- CORS and CSRF protection enabled
- Session management requires both frontend and backend coordination