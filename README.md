# Grooming Store 🧴  
A full-stack e-commerce application for modern men's grooming

Grooming Store is a production-style full-stack project that I built as:
- my **first full-stack app** after completing a Full Stack course, and  
- my **first real freelance project**, implemented end-to-end from scratch.

The app connects a real React frontend with a PostgreSQL-backed API, and includes authentication, product catalog, cart, checkout, and order history.

---

## 🌟 Main Features

### Storefront

- **Home Page**
  - Brand-focused hero section
  - “Why choose us” value props
  - “Shop by Category” cards (name, image, description from the database)
  - Featured products grid
  - Promotional banners (e.g. hero razor, gift sets)

- **Products Listing**
  - Paginated product grid
  - Filter by **category** and **price range**
  - Text search endpoint (`/api/search`) for products
  - Sort options (newest, price ascending/descending, rating)

- **Product Details**
  - Title, description, category, price, rating
  - Product image/thumbnail
  - Related products from the same category
  - Reviews with average rating

---

### Cart, Checkout & Orders

- **Shopping Cart**
  - Add/remove items
  - Update quantity
  - Live subtotal/total

- **Checkout**
  - Order creation with total price in cents + currency
  - Stores basic shipping information
  - “Order Confirmed” page with:
    - Order number
    - Status badge (Pending / Completed / Shipped / Cancelled)
    - Payment method
    - Summary of items and totals

- **My Orders & Order Details**
  - **My Orders** page:
    - List of all orders for the logged-in user
    - Order number
    - Created date
    - Status with color-coded badges
    - Payment method
    - Total amount
  - **Order Details / Order Confirmed** page:
    - Full breakdown of items
    - Payment and shipping info
    - Consistent, polished UI with the rest of the app

---

### Authentication & Users

- Email/password authentication
- Google OAuth (login / register with Google)
- Protected routes (e.g. My Orders, Order Confirmed) using an auth context on the frontend
- JWT-based authentication on the backend

---

## 🧱 Tech Stack

**Frontend**
- React
- Vite
- React Router
- Tailwind CSS (with `tw-` prefix for utility classes)
- Framer Motion (animations)
- lucide-react icons
- Reusable UI components (Button, Card, Badge, Image, etc.)

**Backend**
- Node.js
- Express
- PostgreSQL (using `pg` connection pool)
- JWT authentication
- Google OAuth
- Structured REST API routes:
  - `/api/home`
  - `/api/products`
  - `/api/products/:id`
  - `/api/products/slug/:slug`
  - `/api/categories`
  - `/api/orders` + `/api/orders/:id`
  - `/api/auth/*`
  - `/api/search`
  - `/api/products/:id/reviews`

**Tooling**
- Git & GitHub (feature branches, pull requests)
- Environment-based configuration via `.env` files
- Shell script for database backups (`backup-db.sh`)

---

## 📂 Project Structure

```bash
grooming-store/
├─ apps/
│  ├─ web/                 # React + Vite frontend
│  │  ├─ src/
│  │  │  ├─ pages/         # Home, Products, Categories, Auth, MyOrders, OrderConfirmed, ProductDetails, ...
│  │  │  ├─ components/    # UI components, Auth components, etc.
│  │  │  ├─ lib/           # apiFetch helpers, hooks...
│  │  │  └─ index.css
│  │  ├─ index.html
│  │  ├─ vite.config.js
│  │  └─ package.json
│  └─ api/                 # Express + PostgreSQL backend
│     ├─ routes/           # catalog.js, auth routes, order routes, ...
│     ├─ db/               # db.js (pool), migrations / schema (if used)
│     ├─ scripts/          # backup-db.sh, etc.
│     └─ package.json
├─ .gitignore
├─ package.json
└─ README.md


⸻

🔐 Environment & Security

Sensitive data (API keys, database credentials, JWT secrets, OAuth secrets) is never committed to the repository.

.gitignore is configured to ignore:
	•	.env
	•	.env.*
	•	node_modules
	•	dist / build artifacts
	•	other local-only files

Example Environment Variables

Adjust names/values according to your setup.

Frontend – apps/web/.env.local (or .env)

VITE_API_URL=http://localhost:3000

Backend – apps/api/.env

PORT=3000

# PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/grooming_store
# or PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT...

# JWT
JWT_SECRET=your-super-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL (for CORS / redirects)
FRONTEND_URL=http://localhost:5173


⸻

🛠️ Getting Started (Local Development)

1. Clone the repository

git clone https://github.com/Ahmad-agg/grooming-store.git
cd grooming-store

2. Install dependencies

If you’re keeping frontend and backend separate:

# Root (if you have scripts here)
npm install

# Frontend
cd apps/web
npm install

# Backend
cd ../api
npm install

(Use npm, yarn, or pnpm depending on your preference.)

3. Setup PostgreSQL
	1.	Create a database, e.g. grooming_store.
	2.	Apply your schema/migrations to create tables such as:
	•	users
	•	categories
	•	products
	•	orders
	•	order_items
	•	reviews
	•	review_comments
	3.	Seed initial data for:
	•	categories (name, slug, description, hero_image)
	•	products (title, slug, price_cents, category_id, description, thumbnail, etc.)

This project is designed so that most descriptions, names, and counts come from the real database, not hardcoded constants.

4. Configure environment variables

Create:
	•	apps/api/.env
	•	apps/web/.env.local (or .env)

Use the examples above as a reference.

5. Run the backend

From apps/api:

npm run dev
# or
npm start

Backend will usually run at http://localhost:3000.

6. Run the frontend

From apps/web:

npm run dev

Vite will usually run at http://localhost:5173.

Make sure VITE_API_URL in the frontend points to your backend URL.

⸻

🌐 Deployment (Overview)

Typical deployment setup:
	•	Frontend
	•	Deploy apps/web to:
	•	Netlify, Vercel, or GitHub Pages
	•	Build command:

npm run build


	•	Set VITE_API_URL to the production API URL.

	•	Backend
	•	Deploy apps/api to:
	•	Render, Railway, Fly.io, a VPS, or similar
	•	Provide environment variables:
	•	DATABASE_URL
	•	JWT_SECRET
	•	GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
	•	FRONTEND_URL
	•	Configure CORS + HTTPS where needed.

⸻

✅ Current Status & Possible Improvements

Currently implemented:
	•	Full storefront with categories, products, and home page sections
	•	Authentication (email/password + Google OAuth)
	•	Cart + checkout + orders flow
	•	Reviews system with average rating stored back into products.rating
	•	Category descriptions and hero images driven from the database

Potential future work:
	•	Admin dashboard for managing products, categories, and orders
	•	Wishlist / favorites
	•	More advanced filters and sorting
	•	Email notifications for order confirmations and status changes

⸻

🙋‍♂️ About the Project

This project represents an important milestone for me:
	•	my first full-stack app after a Full Stack course
	•	my first real freelance project, built with production-style requirements in mind

If you have feedback, suggestions, or questions about the implementation, feel free to reach out or open an issue.

Thanks for checking out Grooming Store ✂️🧴
