# 📄 FreeSetu (Set-U-Free) - Project Documentation

> **"Free Help is Just a Click Away"**

## 🎯 Executive Summary

**FreeSetu** (branded as "Set-U-Free") is a **local service marketplace platform** that connects customers with service providers across Australia.

**Live URL:** https://www.freesetu.com

---

## 1️⃣ Business Overview

### 1.1 Problem Statement
Customers struggle to find reliable local service providers for healthcare, wellness, and lifestyle services. Service providers lack a unified platform to showcase their services and manage bookings.

### 1.2 Solution
A two-sided marketplace that:
- Allows **Customers** to discover, compare, and book service providers
- Allows **Providers** to list services, manage availability, and receive bookings

### 1.3 Target Market
- **Primary:** Australia (Sydney, Melbourne, Brisbane, Perth, Adelaide, Gold Coast, Canberra, Newcastle, Hobart, Darwin)
- **Service Categories:** Healthcare & Wellness focused

### 1.4 Service Categories

| Category | Icon | Description |
|----------|------|-------------|
| Dentist | 🦷 | Dental care & oral health |
| Beauty | 💅 | Salon, spa & skincare |
| Gym | 💪 | Fitness centers & trainers |
| Physiotherapy | 🏥 | Physical therapy & rehab |
| Yoga | 🧘 | Yoga classes & meditation |
| Nutrition | 🥗 | Diet plans & consultations |
| Mental Health | 🧠 | Counseling & therapy |
| Dermatology | ✨ | Skin care & treatments |
| Ayurveda | 🌿 | Traditional healing |
| Eye Care | 👁️ | Vision & eye health |

---

## 2️⃣ Functional Requirements

### 2.1 User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Customer** | End user seeking services | Search, browse, book, review providers |
| **Provider** | Service professional/business | List services, manage bookings, respond to reviews |

### 2.2 Core Features

#### 🔍 Search & Discovery
- Search by keyword (service name, provider name)
- Filter by category
- Filter by city/location
- Sort by rating (highest first)
- Provider cards with ratings, reviews, verification badge

#### 👤 User Authentication
- Email/password registration
- Email/password login
- Google OAuth sign-in
- Password reset via email
- Role-based registration (Customer or Provider)

#### 📅 Booking System
- View provider availability (time slots)
- Book appointments
- Booking statuses: `pending` → `confirmed` → `completed` / `cancelled`
- Add booking notes

#### ⭐ Reviews & Ratings
- Rate providers (1-5 stars)
- Write review comments
- View provider's average rating and review count

#### 📊 Dashboards

**Customer Dashboard:**
- Total bookings count
- Completed/pending bookings
- Booking history
- Reviews given

**Provider Dashboard:**
- Total bookings received
- Completed/pending bookings
- Total earnings
- Average rating
- Manage services
- Manage availability slots

---

## 3️⃣ Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | React-based SSR/SSG framework |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Language** | TypeScript | Type-safe JavaScript |
| **Icons** | Lucide React | Modern icon library |
| **Animations** | Framer Motion | Smooth UI animations |
| **Forms** | React Hook Form + Zod | Form handling & validation |
| **Notifications** | React Hot Toast | Toast notifications |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **Database** | Firebase Firestore | NoSQL document database |
| **Authentication** | Firebase Auth | User auth (email + Google) |
| **File Storage** | Firebase Storage | Images and media |
| **Hosting** | Vercel | Serverless deployment |
| **CI/CD** | Vercel + GitHub | Auto-deploy on push |

### 3.2 Project Structure

```
FreeSetu_200/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages (login, register)
│   ├── (home)/               # Home page
│   ├── about/                # About page
│   ├── api/                  # API routes
│   │   ├── auth/             # Login, register, logout
│   │   ├── bookings/         # Booking CRUD
│   │   ├── providers/        # Provider CRUD, search
│   │   └── services/         # Service CRUD
│   ├── dashboard/            # User/Provider dashboards
│   ├── providers/            # Provider profiles
│   ├── services/             # Service listings
│   ├── privacy-policy/       # Legal pages
│   ├── terms-of-service/
│   └── layout.tsx            # Root layout
├── components/
│   ├── common/               # Navbar, Footer, shared components
│   ├── dashboard/            # Dashboard components
│   ├── forms/                # Form components
│   ├── home/                 # Homepage sections
│   └── providers/            # Provider cards, profiles
├── context/
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── firestore.ts          # Firestore CRUD operations
│   └── auth.ts               # Auth helper functions
├── types/
│   └── index.ts              # TypeScript interfaces
├── Data/                     # Seed data (JSON files)
│   ├── categories.json
│   ├── cities.json
│   ├── providers.json
│   └── services.json
├── scripts/
│   └── seed-data.ts          # Database seeding script
├── public/                   # Static assets
│   ├── logo.png
│   ├── favicon.png
│   └── site.webmanifest
└── styles/                   # Global CSS
```

### 3.3 Database Schema (Firestore Collections)

```
Firestore Database
├── users/                    # Customer accounts
│   └── {uid}/
│       ├── fullName: string
│       ├── email: string
│       ├── phone?: string
│       ├── role: "customer" | "provider"
│       ├── location: string
│       ├── profileImage?: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── providers/                # Provider profiles
│   └── {uid}/
│       ├── businessName: string
│       ├── description: string
│       ├── categories: string[]
│       ├── location: string
│       ├── city: string
│       ├── bio: string
│       ├── profileImage?: string
│       ├── rating: number (0-5)
│       ├── reviewCount: number
│       ├── verified: boolean
│       ├── consultationSlots: TimeSlot[]
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── services/                 # Services offered by providers
│   └── {serviceId}/
│       ├── providerId: string
│       ├── category: string
│       ├── title: string
│       ├── description: string
│       ├── duration: number (minutes)
│       ├── images: string[]
│       └── createdAt: timestamp
│
├── bookings/                 # Customer bookings
│   └── {bookingId}/
│       ├── userId: string
│       ├── providerId: string
│       ├── serviceId: string
│       ├── status: "pending" | "confirmed" | "completed" | "cancelled"
│       ├── dateTime: timestamp
│       ├── notes?: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── reviews/                  # Customer reviews
│   └── {reviewId}/
│       ├── userId: string
│       ├── providerId: string
│       ├── rating: number (1-5)
│       ├── comment: string
│       └── createdAt: timestamp
│
├── categories/               # Service categories
│   └── {categoryId}/
│       ├── name: string
│       ├── icon: string
│       ├── description: string
│       └── image: string
│
└── cities/                   # Supported cities
    └── {cityId}/
        ├── name: string
        └── state: string
```

### 3.4 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/providers/search` | Search providers |
| GET | `/api/providers/[id]` | Get provider details |
| PUT | `/api/providers/[id]` | Update provider profile |
| GET | `/api/providers/slots` | Get provider availability |
| PUT | `/api/providers/slots` | Update availability |
| POST | `/api/services` | Create new service |
| GET | `/api/services/[id]` | Get service details |
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/bookings/user` | Get user's bookings |
| GET | `/api/bookings/provider` | Get provider's bookings |
| PUT | `/api/bookings/[id]` | Update booking status |

---

## 4️⃣ UI/UX Design

### 4.1 Design System

| Element | Value |
|---------|-------|
| **Primary Color** | Yellow/Amber (#FFD700, #F59E0B) |
| **Secondary Color** | Gray (#374151) |
| **Accent** | Green (verified badges) |
| **Border Radius** | 2xl (rounded-2xl) |
| **Font** | System default |

### 4.2 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, search, categories, stats |
| Services | `/services` | Provider search results |
| Provider Profile | `/providers/[id]` | Detailed provider page |
| Login | `/login` | User authentication |
| Register | `/register` | User registration |
| Customer Dashboard | `/dashboard/user` | Booking history, stats |
| Provider Dashboard | `/dashboard/provider` | Manage services, bookings |
| About | `/about` | Company information |
| Contact | `/contact` | Contact form |

### 4.3 Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Navbar` | `components/common/` | Top navigation with yellow theme |
| `Footer` | `components/common/` | Site footer |
| `HeroSection` | `components/home/` | Landing hero section |
| `CategoriesSection` | `components/home/` | Category grid display |
| `StatsSection` | `components/home/` | Animated statistics counters |
| `ServicesContent` | `app/services/` | Search interface + results grid |
| `ProviderCard` | `components/providers/` | Provider listing card |
| `ProviderProfile` | `components/providers/` | Full provider detail page |

---

## 5️⃣ DevOps & Deployment

### 5.1 Environments

| Environment | URL | Branch |
|-------------|-----|--------|
| Production | https://www.freesetu.com | `main` |
| Preview | Vercel preview URLs | Feature branches |
| Local Dev | http://localhost:3000 | - |

### 5.2 Environment Variables

```env
# Firebase Client SDK (NEXT_PUBLIC_ prefix = accessible in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Firebase Admin SDK (server-side only, no NEXT_PUBLIC_ prefix)
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
```

### 5.3 NPM Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Build
npm run build        # Production build

# Start production server locally
npm run start        # Run built app

# Linting
npm run lint         # Check for code issues

# Database Seeding
npm run seed         # Populate Firestore with sample data from Data/*.json

# Legacy Firebase Deploy (not recommended, use Git push instead)
npm run deploy       # Build and deploy to Firebase Hosting
```

### 5.4 Deployment Workflow (Recommended)

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to GitHub (triggers auto-deploy)
git push origin main
```

**What happens after `git push`:**
```
GitHub receives code
       ↓
Vercel webhook triggered
       ↓
Vercel pulls latest code
       ↓
Runs: npm run build
       ↓
Deploys to global CDN
       ↓
Live on freesetu.com (usually ~60-90 seconds)
```

### 5.5 Database Seeding

To populate Firestore with sample data:

1. Ensure `serviceAccountKey.json` exists in project root (download from Firebase Console)
2. Edit JSON files in `Data/` folder as needed:
   - `categories.json` - Service categories
   - `cities.json` - Supported cities
   - `providers.json` - Sample providers
   - `services.json` - Sample services
3. Run: `npm run seed`

---

## 6️⃣ Data Models (TypeScript Interfaces)

### User
```typescript
interface User {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'provider';
  location: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Provider
```typescript
interface Provider {
  uid: string;
  businessName: string;
  description: string;
  categories: string[];
  location: string;
  city: string;
  bio: string;
  profileImage?: string;
  rating: number;        // 0-5
  reviewCount: number;
  verified: boolean;
  consultationSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Service
```typescript
interface Service {
  id: string;
  providerId: string;
  category: string;
  title: string;
  description: string;
  duration: number;      // in minutes
  images: string[];
  createdAt: Date;
}
```

### Booking
```typescript
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  dateTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Review
```typescript
interface Review {
  id: string;
  userId: string;
  providerId: string;
  rating: number;        // 1-5
  comment: string;
  createdAt: Date;
}
```

### TimeSlot
```typescript
interface TimeSlot {
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  available: boolean;
}
```

---

## 7️⃣ Future Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | Payment Integration | Stripe/PayPal for paid bookings |
| 🔴 High | Email Notifications | Booking confirmations, reminders |
| 🔴 High | SMS Notifications | Twilio integration for alerts |
| 🟡 Medium | Provider Self-Registration | Onboarding flow for new providers |
| 🟡 Medium | Admin Dashboard | Manage users, providers, analytics |
| 🟡 Medium | Mobile App | React Native iOS/Android app |
| 🟡 Medium | Push Notifications | Browser/mobile push alerts |
| 🟢 Low | Multi-language (i18n) | Support for multiple languages |
| 🟢 Low | Advanced Analytics | Provider insights, booking trends |
| 🟢 Low | Referral System | Customer referral rewards |

---

## 8️⃣ Quick Reference for AI Assistants

### Key Files to Know

| Purpose | File Path |
|---------|-----------|
| TypeScript Types | `types/index.ts` |
| Firestore Operations | `lib/firestore.ts` |
| Firebase Init | `lib/firebase.ts` |
| Auth Helpers | `lib/auth.ts` |
| Auth Context | `context/AuthContext.tsx` |
| Main Search UI | `app/services/ServicesContent.tsx` |
| Navigation | `components/common/Navbar.tsx` |
| Provider Card | `components/providers/ProviderCard.tsx` |
| Seed Data | `Data/*.json` |
| Seed Script | `scripts/seed-data.ts` |

### Tech Constraints & Conventions

1. **Next.js 14 App Router** (not Pages Router)
   - Server Components by default
   - Add `'use client'` directive for client-side interactivity

2. **Firestore (NoSQL)**
   - No SQL joins - denormalized data structure
   - Use client-side sorting when complex queries are needed

3. **Styling**
   - Tailwind CSS only (no CSS modules or styled-components)
   - Yellow/Amber primary theme (`yellow-400`, `amber-500`)

4. **Icons**
   - Lucide React library (`lucide-react`)

5. **Forms**
   - React Hook Form + Zod for validation

6. **State Management**
   - React Context for auth (`AuthContext`)
   - Component-level state with `useState`

### Common Commands

```bash
# Start development
npm run dev

# Deploy (via Git)
git add . && git commit -m "message" && git push origin main

# Seed database
npm run seed

# Check for errors
npm run lint
npm run build
```

---

## 📝 Document Info

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Last Updated** | December 21, 2025 |
| **Repository** | GitHub (connected to Vercel) |
| **Live URL** | https://www.freesetu.com |
| **Firebase Project** | freesetu-aacfd |

---

*This document is intended for developers and AI assistants working on the FreeSetu project.*

