# OAuth Setup Guide for AskJai

This guide explains how to configure Google and GitHub OAuth so users see **"AskJai"** branding (not Supabase) on consent screens.

## Overview

When you use your own OAuth credentials:
- ✅ Users see "AskJai" on Google/GitHub consent screens
- ✅ Your logo and app name appear
- ✅ Supabase is invisible to users (just handles the backend)

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named **"AskJai"**
3. Go to **APIs & Services > OAuth consent screen**

### Step 2: Configure OAuth Consent Screen

1. Select **External** user type
2. Fill in the app information:
   - **App name**: `AskJai`
   - **User support email**: Your email
   - **App logo**: Upload AskJai logo (upload `AskJai.png` from your project)
   - **App home page**: `https://prompt-xgen.vercel.app`
   - **App privacy policy**: `https://prompt-xgen.vercel.app/terms`
   - **App terms of service**: `https://prompt-xgen.vercel.app/terms`
3. Add scopes: `email`, `profile`, `openid`
4. Add test users if in testing mode

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application**
4. Name: `AskJai Web`
5. **Authorized JavaScript origins**:
   ```
   https://prompt-xgen.vercel.app
   http://localhost:8080
   ```
6. **Authorized redirect URIs**:
   ```
   https://coxcreyluubhfeicqfev.supabase.co/auth/v1/callback
   ```
   > Replace `coxcreyluubhfeicqfev` with your Supabase project ref

7. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) > Your Project
2. Navigate to **Authentication > Providers > Google**
3. Enable Google provider
4. Paste your **Client ID** and **Client Secret**
5. Save

---

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps > New OAuth App**
3. Fill in:
   - **Application name**: `AskJai`
   - **Homepage URL**: `https://prompt-xgen.vercel.app`
   - **Application description**: `AI-powered prompt generator`
   - **Authorization callback URL**: 
     ```
     https://coxcreyluubhfeicqfev.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Upload your AskJai logo
6. Copy the **Client ID**
7. Generate a **Client Secret** and copy it

### Step 2: Add to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) > Your Project
2. Navigate to **Authentication > Providers > GitHub**
3. Enable GitHub provider
4. Paste your **Client ID** and **Client Secret**
5. Save

---

## 3. Supabase URL Configuration

In Supabase Dashboard > **Authentication > URL Configuration**:

### Site URL
```
https://prompt-xgen.vercel.app
```

### Redirect URLs (add all of these)
```
https://prompt-xgen.vercel.app
https://prompt-xgen.vercel.app/auth/callback
http://localhost:8080
http://localhost:8080/auth/callback
```

---

## 4. Enable Providers in Admin Panel

Your app has an admin panel to enable/disable OAuth providers. Make sure they're enabled:

1. Log into admin dashboard at `/admin`
2. Go to **Auth Config** section
3. Enable Google and GitHub providers

Alternatively, directly in Supabase SQL editor:
```sql
INSERT INTO auth_config (provider, is_enabled) 
VALUES ('google', true), ('github', true)
ON CONFLICT (provider) 
DO UPDATE SET is_enabled = true;
```

---

## 5. Testing

### Local Development
1. Start dev server: `npm run dev` (should run on port 8080)
2. Click "Sign in with Google" or "Sign in with GitHub"
3. You should see **"AskJai"** branding on consent screen
4. After approval, you'll be redirected to dashboard

### Production
1. Deploy to Vercel
2. Test OAuth flow at `https://prompt-xgen.vercel.app/auth`

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Check that redirect URIs in Google/GitHub match exactly what's in Supabase
- The redirect URI must be: `https://<your-project-ref>.supabase.co/auth/v1/callback`

### OAuth returns to homepage instead of dashboard
- This is handled by the updated `Index.tsx` which detects OAuth tokens in URL hash
- Make sure your Supabase URL Configuration has the correct Site URL

### Users still see "Supabase" branding
- You're using Supabase's built-in OAuth, not your own credentials
- Follow the steps above to use YOUR Google/GitHub OAuth app credentials

### Google says "App not verified"
- Click "Advanced" > "Go to AskJai (unsafe)" during development
- For production: Submit your app for Google verification

---

## File Reference

These files handle OAuth in your codebase:

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client with `detectSessionInUrl: true` |
| `src/contexts/AuthContext.tsx` | `signInWithGoogle()` and `signInWithGitHub()` functions |
| `src/pages/Auth.tsx` | Login page with OAuth buttons |
| `src/pages/AuthCallback.tsx` | Handles `/auth/callback` redirect |
| `src/pages/Index.tsx` | Handles OAuth tokens when redirected to root `/` |
| `src/components/auth/ProtectedRoute.tsx` | Protects authenticated routes |
