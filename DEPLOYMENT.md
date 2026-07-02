# Hosting PL Humanize: GitHub Pages & Render Guide

Your application has two parts:
1.  **Frontend**: The React interface (what you see).
2.  **Backend**: The Node.js server (provides Humanization, AI Detection, etc.).

**GitHub Pages** can ONLY host the **Frontend**. It cannot run your Backend server.
To get the full app working online, you need to host the Backend separately (e.g., on Render.com) and connect them.

Here is the complete workflow:

## Part 1: Deploy Backend (Node.js) on Render (Free)
Since GitHub Pages can't run `node server.js`, we'll use Render.

1.  Push your code to **GitHub**.
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository.
4.  Settings:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Click **Create Web Service**.
6.  Once deployed, copy your new backend URL (e.g., `https://pl-humanize-backend.onrender.com`).

## Part 2: Connect Frontend to Live Backend
Now we need to tell the Frontend to use your new Render URL instead of `localhost`.

1.  Open `src/pages/Humanize.tsx`, `Paraphrase.tsx`, etc.
2.  Find all fetch calls like `fetch("/api/humanize"...)`.
3.  Replace them with your full backend URL: `fetch("https://YOUR-APP.onrender.com/api/humanize"...)`.
    *   *Better way:* Create a config file `src/config.ts` with `export const API_BASE = "https://YOUR-APP.onrender.com";` and use `${API_BASE}/api/...`.

## Part 3: Deploy Frontend on GitHub Pages
Now we host the visual part.

1.  Open `package.json` (frontend root) and add these lines:
    ```json
    "homepage": "https://<YOUR-GITHUB-USERNAME>.github.io/<REPO-NAME>",
    ```
    (Replace `<...>` with your actual details).

2.  Add `gh-pages` dependency:
    ```bash
    npm install gh-pages --save-dev
    ```

3.  Add these scripts to `package.json`:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist",
      ...
    }
    ```

4.  Push these changes to GitHub.

5.  Run the deploy command:
    ```bash
    npm run deploy
    ```

6.  Go to your GitHub Repo -> Settings -> Pages. Ensure source is set to `gh-pages` branch.

**Your app should now be live!**

---

### Important Note on Vite Proxy
The `proxy` setting in `vite.config.ts` (`target: 'http://127.0.0.1:5000'`) **ONLY** works on your local machine (`npm run dev`). It does **NOT** work on GitHub Pages. This is why Step 2 (pointing to the live backend URL) is critical.
