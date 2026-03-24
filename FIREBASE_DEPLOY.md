# Firebase Deployment Guide

This project is configured to deploy both the customer-facing frontend and the admin panel directly to Firebase Hosting via a single Firebase project utilizing "Hosting Sites".

## Prerequisites

1. Create a [Firebase Project](https://console.firebase.google.com/) for Saram Jewels.
2. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. Login to your Firebase account:
   ```bash
   firebase login
   ```

## Setup Your Hosting Sites

In your new Firebase project, you will have one default site (usually named like your project ID). We need *two* sites, one for the frontend and one for the admin panel.

1. Go to the Firebase Console -> Build -> Hosting.
2. Click **Get Started** and walk through the initial prompts.
3. At the bottom of the Hosting dashboard, click **Add another site**.
4. Name it something like `saram-jewels-admin`. Let's assume your two sites are `saram-jewels` (default) and `saram-jewels-admin`.

## Connecting The Codebase to Firebase

In the root of this repository (`/Saram-Jewels`), initialize your project and associate the sites we just set up.

1. Associate your local directory with your Firebase project:
   ```bash
   firebase use --add
   ```
   *Select your specific Firebase project.*

2. Link our deployment "targets" to the actual site names you have in Firebase:
   ```bash
   # Link the frontend target:
   firebase target:apply hosting saram-frontend <YOUR_DEFAULT_SITE_NAME>
   
   # Link the admin target:
   firebase target:apply hosting saram-admin <YOUR_ADMIN_SITE_NAME>
   ```

*(This creates a `.firebaserc` file linking our `firebase.json` settings with your actual Firebase sites)*

## Deploying

Anytime you need to deploy changes, build the apps first and then deploy!

### 1. Build Both Applications

**Frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

**Admin Panel:**
```bash
cd admin-panel
npm install
npm run build
cd ..
```

### 2. Deploy to Firebase

Deploying everything at once:
```bash
firebase deploy --only hosting
```

Or deploy only one of them individually:
```bash
# Only deploy Frontend:
firebase deploy --only hosting:saram-frontend

# Only deploy Admin Panel:
firebase deploy --only hosting:saram-admin
```

---

## Environment Variables Note

Do not forget to maintain your `.env` files locally before building. The produced build bundles the variables (`VITE_API_URL` and `REACT_APP_API_URL`) connecting to your Render backend API.
