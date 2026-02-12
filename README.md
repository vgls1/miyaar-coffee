# Miyaar Coffee (معيار)

Miyaar is a premium e-commerce platform dedicated to specialty coffee. It features a modern, responsive design and a robust full-stack architecture.

## 🚀 Live Demo

- **Frontend (Storefront):** [https://miyaar-coffee-bwiir97s2-khaleds-projects-8f6e58f3.vercel.app/en](https://miyaar-coffee-bwiir97s2-khaleds-projects-8f6e58f3.vercel.app/en)
- **Backend (API):** [https://miyaar-coffee-production.up.railway.app](https://miyaar-coffee-production.up.railway.app)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Internationalization:** Next-Intl (English & Arabic support)
- **Deployment:** Vercel

### Backend
- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** JWT & Guards
- **Deployment:** Railway (Dockerized)

---

## ✨ Features

- **Multi-language Support:** Fully localized for Arabic (RTL) and English (LTR).
- **User Authentication:** Secure registration and login with JWT.
- **Product Catalog:** Browns through categories (Coffee, Accessories).
- **Shopping Cart:** Add items, update quantities, and view cart summary.
- **Order Management:** Place orders and track status.
- **Responsive Design:** Optimized for mobile, tablet, and desktop.

## 📦 Project Structure

```
miyaar/
├── frontend/          # Next.js Application
│   ├── src/app/       # Pages & Routing
│   ├── src/components # UI Components
│   └── messages/      # Localization (ar.json, en.json)
│
└── backend/           # NestJS Application
    ├── src/products/  # Product Module
    ├── src/orders/    # Order Module
    ├── src/auth/      # Authentication System
    └── prisma/        # Database Schema
```

## 🔧 Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- pnpm (Reference package manager)

### 1. Backend Setup
```bash
cd backend
pnpm install
# Set up .env with DATABASE_URL
pnpm start:dev
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
# Set up .env with NEXT_PUBLIC_API_URL
pnpm dev
```