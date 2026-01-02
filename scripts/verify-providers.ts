/**
 * Bulk Verify Providers Script
 * 
 * Verifies all providers or specific providers in bulk
 * 
 * Usage:
 * npx ts-node --project tsconfig.seed.json scripts/verify-providers.ts [all|specific-uids]
 * 
 * Examples:
 * npx ts-node --project tsconfig.seed.json scripts/verify-providers.ts all
 * npx ts-node --project tsconfig.seed.json scripts/verify-providers.ts uid1,uid2,uid3
 */

import { initializeApp, cert, ServiceAccount, deleteApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// ==================== CONFIGURATION ====================

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found.');
  console.error('Please download your Firebase service account key and place it in the project root.');
  process.exit(1);
}

// Load service account credentials
const serviceAccount: ServiceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
});

const db = getFirestore(app);

// ==================== MAIN FUNCTION ====================

async function verifyProviders(): Promise<void> {
  console.log('🔍 Verify Providers Script');
  console.log('===========================\n');

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx ts-node --project tsconfig.seed.json scripts/verify-providers.ts all');
    console.log('  npx ts-node --project tsconfig.seed.json scripts/verify-providers.ts uid1,uid2,uid3');
    console.log('');
    process.exit(1);
  }

  const mode = args[0];

  try {
    if (mode === 'all') {
      // Get all unverified providers
      console.log('📋 Finding all unverified providers...');
      
      const providersSnapshot = await db.collection('providers')
        .where('verified', '==', false)
        .get();
      
      const providers = providersSnapshot.docs;
      
      console.log(`Found ${providers.length} unverified providers\n`);
      
      if (providers.length === 0) {
        console.log('🎉 All providers are already verified!');
        return;
      }

      // Use batch operations for efficiency
      const batchSize = 10; // Firestore batch limit is 500, but we'll use smaller batches
      let processed = 0;
      
      while (processed < providers.length) {
        const batch = db.batch();
        const chunk = providers.slice(processed, processed + batchSize);
        
        console.log(`Processing batch ${Math.floor(processed / batchSize) + 1} (${chunk.length} providers)...`);
        
        for (const providerDoc of chunk) {
          const providerData = providerDoc.data();
          
          console.log(`✅ Verifying: ${providerData.businessName || providerData.name || providerDoc.id}`);
          
          batch.update(providerDoc.ref, {
            verified: true,
            verifiedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        
        await batch.commit();
        processed += chunk.length;
        console.log(`   ✓ Verified ${processed}/${providers.length} providers`);
      }
      
      console.log(`\n🎉 Successfully verified ${providers.length} providers!`);
      
    } else {
      // Verify specific providers by UID
      const uids = mode.split(',').map(uid => uid.trim());
      
      console.log(`📋 Verifying ${uids.length} specific providers...`);
      console.log(`UIDs: ${uids.join(', ')}\n`);
      
      const batch = db.batch();
      let verifiedCount = 0;
      
      for (const uid of uids) {
        const providerRef = db.collection('providers').doc(uid);
        const providerDoc = await providerRef.get();
        
        if (providerDoc.exists) {
          const providerData = providerDoc.data();
          
          console.log(`✅ Verifying: ${providerData?.businessName || providerData?.name || uid}`);
          
          batch.update(providerRef, {
            verified: true,
            verifiedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          
          verifiedCount++;
        } else {
          console.log(`⚠️  Provider not found: ${uid}`);
        }
      }
      
      if (verifiedCount > 0) {
        await batch.commit();
        console.log(`\n🎉 Successfully verified ${verifiedCount} providers!`);
      } else {
        console.log('\n⚠️  No providers were verified (none found or already verified)');
      }
    }

  } catch (error) {
    console.error('\n❌ Error verifying providers:', error);
    process.exit(1);
  } finally {
    // Clean up
    await deleteApp(app);
  }
}

// ==================== RUN SCRIPT ====================

verifyProviders().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});