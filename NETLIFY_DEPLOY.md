# Netlify Deployment

This project is split into separate apps:

- `frontend`: customer-facing React app that can be deployed to Netlify
- `backend`: Express API that must be deployed separately on a Node host
- `admin-panel`: separate Vite app that can also be deployed independently if needed

## What Netlify should deploy

The included [`netlify.toml`](./netlify.toml) is configured for the `frontend` app:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`

It also includes an SPA redirect so React Router routes like `/products/abc` work on refresh.

## Required Netlify environment variables

Set these in Netlify for the frontend site:

```bash
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_from_clerk
```

## Important

Netlify will only host the frontend static site. Your Express backend cannot run from this Netlify setup as-is, so deploy `backend` separately on a service such as Render, Railway, or another Node-compatible host, then point `REACT_APP_API_URL` to that backend URL.

## Deploy steps

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site** and import the GitHub repo.
3. Netlify will read `netlify.toml` automatically.
4. Add the required environment variables.
5. Deploy the site.

## Optional: deploy the admin panel too

If you also want the `admin-panel` on Netlify, deploy it as a second Netlify site with:

- Base directory: `admin-panel`
- Build command: `npm run build`
- Publish directory: `dist`
