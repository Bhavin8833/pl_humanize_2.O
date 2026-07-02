# Deployment Guide: GitHub & Render

This guide will walk you through hosting your **PL Humanize** application (both Frontend and Backend) for free using GitHub and Render.

## Prerequisites

1.  **GitHub Account**: [Sign up here](https://github.com/join) if you don't have one.
2.  **Render Account**: [Sign up here](https://dashboard.render.com/register) using your GitHub account.
3.  **Git Installed**: You already have this locally.

---

## Step 1: Push Code to GitHub

First, we need to get your code onto GitHub.

1.  **Initialize Git (if not already done)**:
    Open your terminal in VS Code (`Ctrl+``) and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for deployment"
    ```

2.  **Create a New Repository on GitHub**:
    *   Go to [GitHub.com](https://github.com) and sign in.
    *   Click the **+** icon in the top right -> **New repository**.
    *   Name it `pl-humanize`.
    *   Keep it **Public** (or Private, Render works with both).
    *   **Do not** check "Initialize with README".
    *   Click **Create repository**.

3.  **Push your code**:
    Copy the commands under "**…or push an existing repository from the command line**" and run them in your VS Code terminal. They will look like this (replace `YOUR_USERNAME`):
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/pl-humanize.git
    git push -u origin main
    ```

---

## Step 2: Deploy Backend to Render

1.  Go to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Select **Build and deploy from a Git repository**.
4.  Connect your `pl-humanize` repository.
5.  **Configure the Service**:
    *   **Name**: `pl-humanize-backend`
    *   **Region**: Closest to you (e.g., Singapore, Frankfurt, US East).
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (Important! This tells Render the backend code is in the `backend` folder).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free`

6.  Click **Create Web Service**.
7.  Wait for deployment to finish. You will see a URL like `https://pl-humanize-backend.onrender.com`. **Copy this URL**, you will need it for the frontend.

---

## Step 3: Deploy Frontend to Render

1.  Go back to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Static Site**.
3.  Select the same `pl-humanize` repository.
4.  **Configure the Site**:
    *   **Name**: `pl-humanize-frontend`
    *   **Branch**: `main`
    *   **Root Directory**: `.` (Leave as default or empty).
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`

5.  **Environment Variables** (Crucial Step):
    *   Scroll down to **Environment Variables**.
    *   Click **Add Environment Variable**.
    *   **Key**: `VITE_API_URL`
    *   **Value**: Paste your Backend URL from Step 2 (e.g., `https://pl-humanize-backend.onrender.com`).
    *   *Note: Do not add a trailing slash `/` at the end of the URL.*

6.  Click **Create Static Site**.

---

## Step 4: Verification

1.  Wait for the Frontend deployment to finish.
2.  Click the URL provided by Render (e.g., `https://pl-humanize-frontend.onrender.com`).
3.  Your app should load!
4.  Try entering text and clicking "Humanize".
    *   If it works, great!
    *   If you get an error, check the Console (F12) to see if it's trying to connect to the correct backend URL.

---

## Updates

If you make changes to your code:
1.  `git add .`
2.  `git commit -m "Update message"`
3.  `git push`
4.  Render will automatically detect the push and re-deploy both services!





echo "# Pl-humanizer" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Bhavin8833/Pl-humanizer.git
git push -u origin main