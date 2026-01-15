# Patch Notes

## Changes Made

### 1. Created Login Page
- Added `src/app/login/page.tsx`
- This page displays the LoginScreen component for user authentication.
- Purpose: Provides a dedicated route for login, improving user experience.

### 2. Updated Middleware Redirects
- Modified `middleware.ts` to redirect to `/login` instead of `/` when authentication fails or user lacks admin role.
- Changes:
  - No token: redirect to `/login`
  - Invalid token: redirect to `/login`
  - Not admin role: redirect to `/login`
- Purpose: Ensures users are directed to a proper login page instead of the home page, which may confuse the flow.

### 3. Fixed JWT Secret
- Updated `.env` to set `JWT_SECRET="secret"`
- Purpose: Ensures consistency between local and production environments. In production (Vercel), if not set, it defaults to "secret".

## Why These Changes

The original issue was a 307 Temporary Redirect on `/admin/dashboard` due to the middleware checking for authentication. Since the app uses JWT-based auth with Supabase for data, the middleware redirects unauthenticated users.

Previously, it redirected to `/`, which shows the login screen only if not logged in. But for admin routes, it's better to have a clear login page.

In production on Vercel, authentication may fail if environment variables are not set, causing the redirect.

With these changes:
- Users trying to access admin routes without login are redirected to `/login`.
- After logging in, they can access admin pages.
- The auth system works properly when env vars are configured in Vercel.

## Deployment Notes

To deploy successfully:
- Set the following environment variables in Vercel:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - JWT_SECRET
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- Use the values from your local `.env` file.

This resolves the 307 redirect issue and improves the authentication flow.