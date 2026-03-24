# 🚀 Saram Jewelry E-commerce Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional for development)

## 🛠️ Installation

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start the Application
```bash
npm start
```

The application will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔐 Clerk Authentication Setup

### 1. Create Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get API Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 3. Configure Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend Configuration
REACT_APP_API_URL=http://localhost:5000

# Database Configuration (optional for development)
DATABASE_URL=postgresql://username:password@localhost:5432/saram_dev

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### 4. Configure Clerk Settings
1. In your Clerk dashboard, go to **User & Authentication**
2. Enable **Email** and **Phone number** sign-in methods
3. Configure your **Redirect URLs**:
   - After sign in: `http://localhost:3000`
   - After sign up: `http://localhost:3000`

## 🗄️ Database Setup (Optional)

### 1. Install PostgreSQL
Download and install PostgreSQL from [https://www.postgresql.org/](https://www.postgresql.org/)

### 2. Create Database
```sql
CREATE DATABASE saram_dev;
```

### 3. Update Environment Variables
Update the `DATABASE_URL` in your backend `.env` file with your database credentials.

### 4. Run Migrations
```bash
cd backend
npm run seed
```

## 💳 Razorpay Payment Setup

### 1. Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a developer account
3. Get your API keys from the dashboard

### 2. Configure Environment Variables
Add your Razorpay keys to the backend `.env` file:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

## 🎨 Customization

### Logo
The logo is implemented as an SVG component in `frontend/src/components/ui/Logo.js`. You can:
- Modify the SVG paths to change the design
- Adjust colors by changing the CSS classes
- Change sizes using the `size` prop

### Styling
- Main styles: `frontend/src/index.css`
- Tailwind config: `frontend/tailwind.config.js`
- Component styles: Individual component files

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service

### Backend (Heroku/Railway)
1. Set environment variables in your hosting platform
2. Deploy the `backend` folder
3. Update `REACT_APP_API_URL` in frontend environment variables

## 🔧 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Clerk Errors
- Ensure your `REACT_APP_CLERK_PUBLISHABLE_KEY` is correct
- Check that your redirect URLs are configured in Clerk dashboard
- Verify your domain is allowed in Clerk settings

### Database Connection
- Check your PostgreSQL service is running
- Verify database credentials in `DATABASE_URL`
- Ensure database exists and is accessible

## 📱 Features Implemented

### ✅ Frontend
- [x] Responsive navigation with logo
- [x] Home page with hero section
- [x] Categories page with filtering
- [x] Product listing with search and filters
- [x] Contact page with form
- [x] Modern UI with Tailwind CSS
- [x] Clerk authentication integration
- [x] Shopping cart interface

### ✅ Backend
- [x] Express.js server setup
- [x] PostgreSQL database models
- [x] Product API endpoints
- [x] User management
- [x] Cart functionality
- [x] Order management
- [x] Razorpay payment integration

### 🔄 Pending Features
- [ ] Product detail pages
- [ ] Shopping cart state management
- [ ] Payment flow completion
- [ ] Admin dashboard
- [ ] Image upload system
- [ ] Email notifications

## 🎯 Next Steps

1. **Configure Clerk** for full authentication
2. **Set up database** for data persistence
3. **Configure Razorpay** for payments
4. **Add product images** and complete product details
5. **Implement cart functionality** with state management
6. **Add admin features** for product management

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, etc.) are running
4. Check the troubleshooting section above

---

**Happy coding! 🎉**
