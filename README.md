# Saram Jewels

Welcome to the Saram Jewels E-commerce Application! A premium, elegant, and modern digital platform for curated jewelry collections. 

## Project Architecture

This application strictly follows a decoupled architectural pattern, consisting of two main components:
1. **Frontend (Client Application)**
2. **Backend (REST API Server)**

### Tech Stack
- **Frontend**: React.js, Tailwind CSS V3, Heroicons, Framer Motion (animations), React Router DOM.
- **Backend**: Node.js, Express.js, Sequelize (PostgreSQL ORM - currently mocked in SQLite for dev ease).
- **Authentication**: Clerk.
- **Payments**: Razorpay.

## Directory Structure

```
Saram-Jewels
├── frontend               # React application
│   ├── public             
│   └── src                
│       ├── components     # Reusable UI elements (Cart, Layout, Checkout)
│       ├── context        # React Context (Auth, Cart, Theme)
│       ├── pages          # Route components (Home, Profile, Shop, etc.)
│       └── services       # API service files
├── backend                # Node.js Express server
│   ├── config             # Database connection setup
│   ├── controllers        # Core business logic (Orders, Users, Addresses)
│   ├── middleware         # Auth guards and request formatting
│   ├── models             # Sequelize schemas (User, Product, Address, Order)
│   ├── routes             # API route definitions
│   └── services           # Helper services (Email)
└── admin-panel            # React Admin application for management
```

## Setup & Running the Application

Please refer to the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md) for full instructions on installing dependencies and running the environment.

### Quick Start
1. Ensure `node` and `npm` are installed.
2. Clone the repository.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Start both servers:
   - Backend: `npm run dev` (Runs on port 5001)
   - Frontend: `npm start` (Runs on port 3000)

## Recent Updates
- Implemented robust Amazon/Myntra-styled Delivery Address Management system.
- Completely refactored the checkout flow to dynamically pull saved addresses and persist new ones elegantly.
- Transitioned physical locations out of the brand footprint to emphasize a purely digital storefront.
- Improved and refined coding standards by cleaning mock data across the profile section and switching to live API routes.

---

> ✦ Curated with Love in Delhi ✦
