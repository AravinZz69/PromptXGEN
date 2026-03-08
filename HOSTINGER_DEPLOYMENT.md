# AskJai — Hostinger Deployment Guide

## Prerequisites
- Hostinger hosting plan (Premium or Business recommended)
- Domain connected to Hostinger
- Supabase project (for database & auth — keep as-is)

---

## Step 1: Build the App

```bash
npm install
npm run build
```

This creates a `dist/` folder with your production-ready static files.

---

## Step 2: Upload to Hostinger

### Option A: File Manager (Simple)
1. Log in to **Hostinger hPanel**
2. Go to **File Manager**
3. Navigate to `public_html/` (or your domain's root folder)
4. **Delete** all existing files in `public_html/`
5. **Upload** all contents of the `dist/` folder into `public_html/`

### Option B: FTP Upload
1. In hPanel → **Files → FTP Accounts**, get your FTP credentials
2. Use FileZilla or any FTP client
3. Connect and upload `dist/` contents to `public_html/`

### Option C: Git Deployment (Recommended)
1. Push your code to GitHub
2. In hPanel → **Advanced → Git**, connect your repository
3. Set up auto-deploy on push

---

## Step 3: Configure .htaccess

Create a `.htaccess` file in `public_html/` for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle client-side routing - redirect all requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  
  # Security headers
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  
  # Cache static assets
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  
  # Don't cache HTML
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
```

---

## Step 4: Environment Variables

Since this is a static site, environment variables are baked into the build. Before building, ensure your `.env.local` or `.env.production` has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** These are public/anon keys and safe to include in the build.

---

## Step 5: SSL Certificate

1. In hPanel → **Security → SSL**
2. Enable **Free SSL** (Let's Encrypt) for your domain
3. Force HTTPS redirect

---

## Step 6: Verify Deployment

1. Visit your domain — the app should load
2. Test navigation (all routes should work via .htaccess)
3. Test login/signup (should work with Supabase)
4. Test contact form submission
5. Test admin panel at `/admin`

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐
│   Hostinger      │     │   Supabase Cloud     │
│   (Frontend)     │────▶│   (Backend)          │
│                  │     │                      │
│  • React SPA     │     │  • PostgreSQL DB     │
│  • Static files  │     │  • Authentication    │
│  • .htaccess     │     │  • Edge Functions    │
│                  │     │  • Storage (media)   │
└─────────────────┘     └──────────────────────┘
```

## Important Notes

- **Database stays on Supabase** — Don't use Hostinger's MySQL
- **Edge Functions** run on Supabase, not Hostinger
- **File uploads** (images, etc.) go to Supabase Storage
- Hostinger only serves the **static frontend** files
- No server-side rendering needed — this is a pure SPA

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on page refresh | Ensure `.htaccess` is properly configured |
| API calls failing | Check Supabase URL/key in the build |
| CORS errors | Your Supabase project allows the Hostinger domain |
| Blank page | Check browser console for JS errors |
| Slow load | Enable Hostinger's CDN and caching |
