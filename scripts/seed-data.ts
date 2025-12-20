import { initializeApp, cert, ServiceAccount, deleteApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// ==================== CONFIGURATION ====================

// Path to your service account key
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

// Path to data files
const dataDir = path.resolve(__dirname, '../Data');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found.');
  console.error('Please download your Firebase service account key and place it in the project root.');
  console.error('See: https://firebase.google.com/docs/admin/setup#initialize_the_sdk');
  process.exit(1);
}

// Check if data directory exists
if (!fs.existsSync(dataDir)) {
  console.error('❌ Error: Data folder not found.');
  console.error('Please create a Data folder in the project root with JSON files.');
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Load JSON data from file
 */
function loadJsonFile<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Warning: ${filename} not found in Data folder. Skipping...`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
}

/**
 * Clear a collection before seeding
 */
async function clearCollection(collectionName: string): Promise<void> {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`   Deleted ${snapshot.size} documents`);
}

/**
 * Seed a collection with data
 */
async function seedCollection<T extends { uid?: string; id?: string }>(
  collectionName: string,
  data: T[],
  clearFirst: boolean = true
): Promise<void> {
  if (data.length === 0) {
    console.log(`⏭️  Skipping ${collectionName} (no data)`);
    return;
  }

  console.log(`\n📦 Seeding ${collectionName}...`);
  
  if (clearFirst) {
    await clearCollection(collectionName);
  }
  
  const batch = db.batch();
  
  for (const item of data) {
    const docId = item.uid || item.id || db.collection(collectionName).doc().id;
    const docRef = db.collection(collectionName).doc(docId);
    
    // Remove uid/id from the data object (it's already the document ID)
    const { uid, id, ...itemData } = item as T & { uid?: string; id?: string };
    
    batch.set(docRef, {
      ...itemData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`   ✓ Added: ${docId}`);
  }
  
  await batch.commit();
  console.log(`✅ Seeded ${data.length} ${collectionName}`);
}

// ==================== MAIN SEED FUNCTION ====================

async function seedDatabase(): Promise<void> {
  console.log('🚀 Starting database seeding...');
  console.log('==================================================');
  console.log(`📂 Loading data from: ${dataDir}`);
  console.log('==================================================\n');

  try {
    // Load data from JSON files
    const categories = loadJsonFile<{ id: string; name: string; icon: string; description: string; image: string }>('categories.json');
    const cities = loadJsonFile<{ id: string; name: string; state?: string }>('cities.json');
    const providers = loadJsonFile<{ uid: string; [key: string]: unknown }>('providers.json');
    const services = loadJsonFile<{ id: string; [key: string]: unknown }>('services.json');

    console.log(`📊 Data summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Cities: ${cities.length}`);
    console.log(`   - Providers: ${providers.length}`);
    console.log(`   - Services: ${services.length}`);

    // Seed collections
    await seedCollection('categories', categories);
    await seedCollection('cities', cities);
    await seedCollection('providers', providers);
    await seedCollection('services', services);

    console.log('\n==================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('==================================================');
    
    console.log('\n📝 Summary:');
    console.log(`   ✅ ${categories.length} categories`);
    console.log(`   ✅ ${cities.length} cities`);
    console.log(`   ✅ ${providers.length} providers`);
    console.log(`   ✅ ${services.length} services`);
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await deleteApp(app);
  }
}

// ==================== RUN SCRIPT ====================

seedDatabase();
