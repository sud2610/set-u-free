/**
 * Migration script to create provider documents for existing users with role='provider'
 * who don't have a corresponding provider document.
 * 
 * Run with: npx ts-node --project tsconfig.seed.json scripts/migrate-providers.ts
 */

import admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

async function migrateProviders() {
  console.log('🔄 Starting provider migration...\n');

  try {
    // Get all users with role='provider'
    const usersSnapshot = await db.collection('users').where('role', '==', 'provider').get();
    
    console.log(`Found ${usersSnapshot.size} users with role='provider'\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        // Check if provider document already exists
        const providerDoc = await db.collection('providers').doc(userId).get();
        
        if (providerDoc.exists) {
          console.log(`⏭️  Provider document already exists for: ${userData.email}`);
          skipped++;
          continue;
        }

        // Create provider document
        await db.collection('providers').doc(userId).set({
          name: userData.fullName || userData.email?.split('@')[0] || 'Provider',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          services: [],
          description: '',
          rating: 0,
          reviewCount: 0,
          verified: false,
          status: 'pending', // Set as pending for admin approval
          availability: {},
          profileImage: userData.profileImage || '',
          images: [],
          createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Created provider document for: ${userData.email} (status: pending)`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating provider for ${userData.email}:`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateProviders()
  .then(() => {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

