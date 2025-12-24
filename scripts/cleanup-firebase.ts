/**
 * Firebase Cleanup Script
 * 
 * Clears all data from Firebase collections before re-seeding
 * 
 * Usage:
 * npx ts-node --project tsconfig.seed.json scripts/cleanup-firebase.ts
 * 
 * Or to clear specific collections:
 * npx ts-node --project tsconfig.seed.json scripts/cleanup-firebase.ts providers services
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// ==================== CONFIGURATION ====================

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Collections to clean up
const ALL_COLLECTIONS = [
  'providers',
  'services',
  'cities',
  'categories',
  'bookings',
  'reviews',
];

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found.');
  console.error('Please download your Firebase service account key and place it in the project root.');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

const db = admin.firestore();

// ==================== HELPER FUNCTIONS ====================

/**
 * Delete all documents in a collection
 */
async function clearCollection(collectionName: string): Promise<number> {
  console.log(`🗑️  Clearing ${collectionName}...`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`   Collection ${collectionName} is already empty`);
    return 0;
  }

  // Delete in batches of 500 (Firestore limit)
  const batchSize = 500;
  let deleted = 0;
  
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = snapshot.docs.slice(i, i + batchSize);
    
    batchDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deleted += batchDocs.length;
    console.log(`   Deleted ${deleted}/${snapshot.size} documents...`);
  }
  
  console.log(`   ✓ Cleared ${deleted} documents from ${collectionName}`);
  return deleted;
}

// ==================== MAIN FUNCTION ====================

async function cleanupFirebase(): Promise<void> {
  console.log('🧹 Firebase Cleanup Script');
  console.log('==================================================\n');
  
  // Get collections to clean from command line args, or use all
  const args = process.argv.slice(2);
  const collectionsToClean = args.length > 0 ? args : ALL_COLLECTIONS;
  
  console.log(`📋 Collections to clean: ${collectionsToClean.join(', ')}\n`);
  
  // Confirm before proceeding
  if (args.length === 0) {
    console.log('⚠️  WARNING: This will delete ALL data from the following collections:');
    collectionsToClean.forEach(c => console.log(`   - ${c}`));
    console.log('\n');
  }

  try {
    let totalDeleted = 0;
    
    for (const collection of collectionsToClean) {
      const deleted = await clearCollection(collection);
      totalDeleted += deleted;
    }
    
    console.log('\n==================================================');
    console.log('✅ Cleanup complete!');
    console.log('==================================================');
    console.log(`\n📊 Total documents deleted: ${totalDeleted}`);
    
    console.log('\n🎯 Next steps:');
    console.log('   Run seed script: npx ts-node --project tsconfig.seed.json scripts/seed-data.ts');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// ==================== RUN SCRIPT ====================

cleanupFirebase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

