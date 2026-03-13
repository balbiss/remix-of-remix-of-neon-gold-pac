---
description: How to deploy Pac Bet to Coolify
---

# Coolify Deployment Workflow 🚀🌐

Follow these steps to put your application online at `pacbet.inoovaweb.com.br`.

## 1. Create New Resource
In your Coolify Dashboard:
1. Click on **+ New Resource**.
2. Select **Public Repository** or **Private Repository** (connect your GitHub/GitLab).
3. Paste the repository URL of your project.

## 2. Configure Build & Command
Select the **Nixpacks** builder (it will auto-detect Vite).
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Publish Directory**: `dist`

## 3. Set Domain
In the **Domains** field, enter:
`https://pacbet.inoovaweb.com.br`

## 4. Environment Variables
Goto the **Environment Variables** tab and add the following:
- `VITE_SUPABASE_URL`: `https://liacqzbvezvpmluasbld.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYWNxemJ2ZXp2cG1sdWFzYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYxNTYsImV4cCI6MjA2MjY0MjE1Nn0.4aR0NiaOJbMYrOWe5_W823hNMOGe3zS3UkBuxgm8U8A`

> [!TIP]
> You can find these values in your project's `.env` file or in the Supabase Dashboard under Settings > API.

## 5. Deploy
1. Click **Deploy**.
2. Wait for the build to finish.
3. Access your domain to verify!
