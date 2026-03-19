# Netlify Deployment

This project is split into separate apps:

- `frontend`: customer-facing React app (Create React App)
- `backend`: Express API that must be deployed separately on a Node host (Render)
- `admin-panel`: separate Vite React app for admin dashboard

## Deploy Order

1. **First**: Deploy backend to Render (see Render deployment guide)
2. **Second**: Deploy frontend and admin-panel to Netlify

---

## Frontend Deployment (Netlify)

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com) and click **Add new site** → **Import an existing project**
3. Select your GitHub repository
4. Configure the build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. Add these environment variables in Netlify:
   ```
   REACT_APP_API_URL = https://your-render-backend-url.onrender.com/api
   REACT_APP_CLERK_PUBLISHABLE_KEY = pk_test_xxx (from your Clerk dashboard)
   ```
6. Click **Deploy site**

### Option 2: Drag and Drop (Quick Deploy)

1. Build the frontend locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `frontend/build` folder to the drop zone

---

## Admin Panel Deployment (Netlify)

The admin panel is a Vite React app and needs to be deployed separately.

### Option 1: Deploy from GitHub

1. Go to [Netlify](https://app.netlify.com) and click **Add new site** → **Import an existing project**
2. Select your GitHub repository
3. Configure the build settings:
   - **Base directory**: `admin-panel`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add these environment variables in Netlify:
   ```
   VITE_API_URL = https://your-render-backend-url.onrender.com/api
   VITE_CLERK_PUBLISHABLE_KEY = pk_test_xxx (from your Clerk dashboard)
   ```
5. Click **Deploy site**

### Option 2: Drag and Drop

1. Build the admin panel locally:
   ```bash
   cd admin-panel
   npm install
   npm run build
   ```
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `admin-panel/dist` folder to the drop zone

---

## Required Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### Admin Panel (.env)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Important Notes

1. **Deploy Backend First**: Make sure your backend is deployed on Render before deploying the frontend/admin-panel
2. **Update API URL**: Replace `your-backend-url.onrender.com` with your actual Render backend URL
3. **SPA Redirect**: Both apps include a `_redirects` file for React Router support
4. **Clerk Keys**: Get your Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com)

---

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure your backend on Render allows requests from your Netlify domain:
- In Render dashboard, go to your backend service
- Check the environment variables include your Netlify URLs in CORS settings

### 404 on Refresh
Make sure the `_redirects` file is in the `public` folder (for React) or `dist` folder (for Vite) after build.
