# Set-U-Free

A modern local service marketplace platform built with Next.js 14, Firebase, and Tailwind CSS.

## Features

- 🏠 **Service Categories** - Browse services across multiple categories (Home Services, Beauty, Health, Education, etc.)
- 👤 **User Authentication** - Secure login/registration with Firebase Auth (Email & Google)
- 📅 **Booking System** - Easy appointment scheduling with providers
- ⭐ **Reviews & Ratings** - Customer reviews and provider ratings
- 📊 **Dashboard** - Separate dashboards for users and service providers
- 🔍 **Search & Filter** - Advanced search with category and location filters
- 📱 **Responsive Design** - Mobile-first, works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/set-u-free.git
cd set-u-free
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (home)/           # Home page route group
│   ├── (auth)/           # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── services/         # Service listing pages
│   │   └── [category]/   # Category-specific pages
│   ├── providers/        # Provider detail pages
│   │   └── [id]/
│   ├── dashboard/        # Dashboard pages
│   │   ├── user/
│   │   └── provider/
│   ├── api/              # API routes
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── providers/
│   │   └── services/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── common/           # Shared components
│   ├── home/             # Home page components
│   ├── providers/        # Provider-related components
│   ├── dashboard/        # Dashboard components
│   └── forms/            # Form components
├── lib/
│   ├── firebase.ts       # Firebase initialization
│   ├── auth.ts           # Auth utilities
│   └── firestore.ts      # Firestore utilities
├── types/
│   └── index.ts          # TypeScript types
├── context/
│   └── AuthContext.tsx   # Auth context provider
├── styles/
│   └── globals.css       # Global styles
└── public/               # Static assets
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Enable Storage
5. Copy your web app configuration to `.env.local`

### Firestore Collections

- `users` - User profiles
- `providers` - Service provider profiles
- `bookings` - Booking records
- `reviews` - Customer reviews
- `services` - Service listings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

