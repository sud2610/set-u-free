# 🚀 Set-U-Free Deployment Guide

This guide covers deploying Set-U-Free to Vercel and setting up Firebase services.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
   - [Create Firebase Project](#1-create-firebase-project)
   - [Authentication Setup](#2-authentication-setup)
   - [Firestore Database Setup](#3-firestore-database-setup)
   - [Storage Bucket Setup](#4-storage-bucket-setup)
   - [Get Configuration Keys](#5-get-configuration-keys)
3. [Vercel Deployment](#vercel-deployment)
   - [Connect Repository](#1-connect-repository)
   - [Configure Environment Variables](#2-configure-environment-variables)
   - [Deploy](#3-deploy)
   - [Custom Domain](#4-custom-domain-optional)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier available)
- [ ] Google account for Firebase
- [ ] Node.js 18+ installed locally
- [ ] npm or yarn package manager

---

## Firebase Setup

### 1. Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   ```
   Click "Add project" → Enter project name (e.g., "freesetu") 
   → Enable/Disable Google Analytics → Create project
   ```

3. **Register Web App**
   ```
   Project Overview → Click web icon (</>) 
   → Enter app nickname → Register app
   → Copy the firebaseConfig object
   ```

   Your config will look like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-XXXXXXX"
   };
   ```

---

### 2. Authentication Setup

1. **Enable Authentication**
   ```
   Firebase Console → Build → Authentication → Get started
   ```

2. **Enable Sign-in Methods**

   | Provider | Steps |
   |----------|-------|
   | Email/Password | Enable → Save |
   | Google | Enable → Add support email → Save |

3. **Configure Authorized Domains**
   ```
   Authentication → Settings → Authorized domains
   ```
   
   Add your domains:
   - `localhost` (for development)
   - `your-app.vercel.app` (Vercel preview)
   - `yourdomain.com` (production)

4. **Email Templates (Optional)**
   ```
   Authentication → Templates → Customize emails
   ```

---

### 3. Firestore Database Setup

1. **Create Database**
   ```
   Firebase Console → Build → Firestore Database → Create database
   ```

2. **Choose Mode**
   - **Production mode** (recommended for live apps)
   - **Test mode** (for development - expires in 30 days)

3. **Select Location**
   - Choose `asia-south1 (Mumbai)` for India-based apps
   - ⚠️ Location cannot be changed later

4. **Set Security Rules**

   Go to `Firestore → Rules` and paste:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.auth.uid == userId;
         allow update, delete: if request.auth != null && request.auth.uid == userId;
       }
       
       // Providers collection
       match /providers/{providerId} {
         allow read: if true; // Public read
         allow create: if request.auth != null && request.auth.uid == providerId;
         allow update, delete: if request.auth != null && request.auth.uid == providerId;
       }
       
       // Services collection
       match /services/{serviceId} {
         allow read: if true; // Public read
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
           get(/databases/$(database)/documents/services/$(serviceId)).data.providerId == request.auth.uid;
       }
       
       // Bookings collection
       match /bookings/{bookingId} {
         allow read: if request.auth != null && (
           resource.data.userId == request.auth.uid ||
           resource.data.providerId == request.auth.uid
         );
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         allow update: if request.auth != null && (
           resource.data.userId == request.auth.uid ||
           resource.data.providerId == request.auth.uid
         );
         allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       // Reviews collection
       match /reviews/{reviewId} {
         allow read: if true; // Public read
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

5. **Create Indexes**

   Go to `Firestore → Indexes → Add Index`:

   | Collection | Fields | Query Scope |
   |------------|--------|-------------|
   | providers | city (Asc), rating (Desc) | Collection |
   | providers | categories (Array), rating (Desc) | Collection |
   | bookings | userId (Asc), dateTime (Desc) | Collection |
   | bookings | providerId (Asc), status (Asc) | Collection |
   | reviews | providerId (Asc), createdAt (Desc) | Collection |

---

### 4. Storage Bucket Setup

1. **Enable Storage**
   ```
   Firebase Console → Build → Storage → Get started
   ```

2. **Choose Rules Mode**
   - Select production or test mode

3. **Select Location**
   - Use same region as Firestore (asia-south1)

4. **Set Security Rules**

   Go to `Storage → Rules`:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       
       // Profile images
       match /profiles/{userId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId
           && request.resource.size < 5 * 1024 * 1024 // 5MB limit
           && request.resource.contentType.matches('image/.*');
       }
       
       // Service images
       match /services/{serviceId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null
           && request.resource.size < 10 * 1024 * 1024 // 10MB limit
           && request.resource.contentType.matches('image/.*');
       }
       
       // Business images
       match /businesses/{providerId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == providerId
           && request.resource.size < 10 * 1024 * 1024
           && request.resource.contentType.matches('image/.*');
       }
     }
   }
   ```

5. **Configure CORS (if needed)**

   Create `cors.json`:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

   Deploy with:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name.appspot.com
   ```

---

### 5. Get Configuration Keys

1. **Get Web App Config**
   ```
   Project Settings (⚙️) → General → Your apps → Web app → Config
   ```

2. **Copy These Values**
   ```
   apiKey
   authDomain
   projectId
   storageBucket
   messagingSenderId
   appId
   measurementId
   ```

---

## Vercel Deployment

### 1. Connect Repository

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/set-u-free.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: ./
   Build Command: npm run build (default)
   Output Directory: .next (default)
   Install Command: npm install (default)
   ```

---

### 2. Configure Environment Variables

1. **Add Variables in Vercel**
   ```
   Project Settings → Environment Variables
   ```

2. **Add All Required Variables**

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key | All |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | All |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | All |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | All |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | All |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID | All |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | G-XXXXXXX | All |
   | `NEXT_PUBLIC_BASE_URL` | https://your-domain.com | Production |
   | `NEXT_PUBLIC_BASE_URL` | https://your-app.vercel.app | Preview |
   | `NEXT_PUBLIC_ENV` | production | Production |
   | `NEXT_PUBLIC_ENV` | preview | Preview |

3. **Environment Selection**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

### 3. Deploy

1. **Initial Deployment**
   - Click "Deploy" after configuration
   - Wait for build to complete (2-5 minutes)

2. **Automatic Deployments**
   - Every push to `main` → Production deployment
   - Every pull request → Preview deployment

3. **Manual Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy preview
   vercel
   
   # Deploy production
   vercel --prod
   ```

---

### 4. Custom Domain (Optional)

1. **Add Domain**
   ```
   Project Settings → Domains → Add Domain
   ```

2. **Configure DNS**

   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 76.76.21.21 |
   | CNAME | www | cname.vercel-dns.com |

   Or use nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

3. **SSL Certificate**
   - ✅ Automatic HTTPS (Let's Encrypt)
   - No configuration needed

4. **Update Firebase**
   ```
   Firebase → Authentication → Settings → Authorized domains
   → Add your custom domain
   ```

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit your deployed URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test Google sign-in
- [ ] Test provider registration
- [ ] Test booking flow
- [ ] Check mobile responsiveness

### 2. Set Up Monitoring

1. **Vercel Analytics**
   ```
   Project → Analytics → Enable
   ```

2. **Firebase Analytics**
   - Automatically enabled with measurementId

3. **Error Tracking (Optional)**
   - Integrate Sentry or LogRocket

### 3. Configure Alerts

1. **Vercel Notifications**
   ```
   Project Settings → Notifications
   ```

2. **Firebase Alerts**
   ```
   Firebase Console → Project Settings → Integrations
   ```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails
```
Error: Cannot find module 'xyz'
```
**Solution:** Check package.json dependencies, run `npm install`

#### 2. Environment Variables Not Loading
```
Error: Firebase: No Firebase App
```
**Solution:** 
- Verify variables are added in Vercel
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables

#### 3. Authentication Not Working
```
Error: This domain is not authorized
```
**Solution:** Add domain to Firebase Authorized Domains

#### 4. Firestore Permission Denied
```
Error: Missing or insufficient permissions
```
**Solution:** Check Firestore security rules

#### 5. CORS Errors
```
Error: Access-Control-Allow-Origin
```
**Solution:** Configure CORS for Firebase Storage

### Debug Commands

```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run lint

# Test production build
npm run start

# View Vercel logs
vercel logs your-deployment-url
```

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Community:** https://github.com/vercel/next.js/discussions

---

## Environment Variables Reference

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics ID |
| `NEXT_PUBLIC_BASE_URL` | App base URL |
| `NEXT_PUBLIC_APP_NAME` | Application name |
| `NEXT_PUBLIC_ENV` | Environment name |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API |

---

## Quick Deployment Checklist

```
□ Firebase project created
□ Authentication enabled (Email + Google)
□ Firestore database created with rules
□ Storage bucket configured
□ Firebase config keys copied
□ Code pushed to GitHub
□ Vercel project created
□ Environment variables added
□ Custom domain configured (optional)
□ Deployment verified
□ Monitoring enabled
```

---

**Happy Deploying! 🚀**



