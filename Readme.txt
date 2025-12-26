
Brand Name - "Set-U-Free"
Brand Slogan - "Free Help is Just a Click Away..."

Find Your Perfect
Free Consultation
Discover trusted service providers offering free consultations. From dental care to fitness, 
beauty to wellness - your perfect match is just a search away.


# Login to Firebase
firebase login


# Step 1: Stage your changes
git add .

# Step 2: Commit with a message
git commit -m "Fixed text overflow in categories"

# Step 3: Push to GitHub
git push origin main


# Deploy
npm run build
firebase deploy
npm run seed

vercel --prod


Dentist, Physio, Migration, Beauty, Financial
Melbourne, Sydney

http://localhost:3000/admin
npx ts-node --project tsconfig.seed.json scripts/make-admin.ts your-email@example.com

Here's the command to delete all users from Firebase Firestore:
npx ts-node --project tsconfig.seed.json scripts/cleanup-firebase.ts users


To Seed Your Database
npx ts-node --project tsconfig.seed.json scripts/seed-data.ts

Or if you want to clear everything first:
npx ts-node --project tsconfig.seed.json scripts/cleanup-firebase.ts
npx ts-node --project tsconfig.seed.json scripts/seed-data.ts


Adding New Categories in the Future
Edit the CATEGORIES array in scripts/seed-data.ts (lines 42-107) and re-run the seed script. The format is:
{  id: 'your-category-id',  name: 'Your Category Name',  icon: '🔧',  description: 'Short description',  image: 'https://...',}