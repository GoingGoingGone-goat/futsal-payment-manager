# Deployment Guide

Follow these steps to put your app on the internet for free using **Vercel**.

## 1. Push Code to GitHub
(If you haven't already)
1.  Go to [GitHub.com](https://github.com) and create a new repository called `futsal-manager`.
2.  In your terminal, run:
    ```bash
    git init
    # (If git isn't configured, that's fine, proceed to manual upload if needed, but git is better)
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/futsal-manager.git
    git push -u origin main
    ```

## 2. Deploy on Vercel
1.  Go to [Vercel.com](https://vercel.com) and Sign Up/Log In.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `futsal-manager` repository.
4.  In the "Configure Project" screen, just click **Deploy**.

## 3. Set Up the Database
Once deployed, the build might fail or the app might look empty. We need the database.

1.  Go to your Project Dashboard on Vercel.
2.  Click the **Storage** tab.
3.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
4.  Accept the terms and click **Create**.
5.  Check "Automatically connect to your project" and click **Connect**.
6.  **Redeploy**: Go to the **Deployments** tab, click the three dots on the latest deployment -> **Redeploy**.

## 4. Initialize Tables
The database starts empty. We need to create the tables.

1.  Visit your new website URL (e.g., `https://futsal-manager.vercel.app`).
2.  Add `/api/seed` to the end of the URL:
    `https://futsal-manager.vercel.app/api/seed`
3.  You should see `{"message": "Database seeded successfully"}`.

## Done!
Your app is now live, secure, and uses a cloud database. 
- **Local Development**: When you run `npm run dev` locally, it will still use your `data.json` file, so you can test safely without messing up your live data.
