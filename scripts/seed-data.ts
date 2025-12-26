import { initializeApp, cert, ServiceAccount, deleteApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// ==================== CONFIGURATION ====================

// Path to your service account key
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

// Path to scraped data files
const scrapedDataDir = path.resolve(__dirname, '../scraped_data');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found.');
  console.error('Please download your Firebase service account key and place it in the project root.');
  console.error('See: https://firebase.google.com/docs/admin/setup#initialize_the_sdk');
  process.exit(1);
}

// Check if scraped data directory exists
if (!fs.existsSync(scrapedDataDir)) {
  console.error('❌ Error: scraped_data folder not found.');
  console.error('Please ensure the scraped_data folder exists with provider JSON files.');
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

// ==================== TYPES ====================

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
}

interface ScrapedProvider {
  id: string;
  businessName: string;
  description: string;
  categories: string[];
  location: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  placeId: string;
  latitude: number;
  longitude: number;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  googleMapsUrl: string;
  dataSource: string;
  scrapedAt: string;
  needsManualVerification: boolean;
  freeConsultation: boolean;
  freeConsultationSource?: string;
  freeConsultationTermsMatched?: string[];
}

interface City {
  id: string;
  name: string;
  state: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Load categories from scraped_data/categories.json
 */
function loadCategories(): Category[] {
  const categoriesPath = path.join(scrapedDataDir, 'categories.json');
  
  if (!fs.existsSync(categoriesPath)) {
    console.error('❌ Error: categories.json not found in scraped_data folder.');
    process.exit(1);
  }
  
  const content = fs.readFileSync(categoriesPath, 'utf8');
  return JSON.parse(content) as Category[];
}

/**
 * Create a mapping from category name to category image
 * Handles case-insensitive matching
 */
function createCategoryImageMap(categories: Category[]): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const category of categories) {
    // Map by exact name
    map.set(category.name.toLowerCase(), category.image);
    
    // Also map common variations
    // e.g., "Migration & Visa Advisers" -> "Migration"
    const firstName = category.name.split(/[&,]/)[0].trim().toLowerCase();
    if (!map.has(firstName)) {
      map.set(firstName, category.image);
    }
  }
  
  return map;
}

/**
 * Get the category image for a provider based on their first category
 */
function getCategoryImage(categories: string[], categoryImageMap: Map<string, string>): string {
  if (!categories || categories.length === 0) {
    return '';
  }
  
  const primaryCategory = categories[0].toLowerCase();
  
  // Try exact match first
  if (categoryImageMap.has(primaryCategory)) {
    return categoryImageMap.get(primaryCategory)!;
  }
  
  // Try partial match
  const entries = Array.from(categoryImageMap.entries());
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];
    const image = entries[i][1];
    if (primaryCategory.includes(key) || key.includes(primaryCategory)) {
      return image;
    }
  }
  
  return '';
}

/**
 * Load all provider JSON files from scraped_data folder
 */
function loadAllProviders(): ScrapedProvider[] {
  const allProviders: ScrapedProvider[] = [];
  const files = fs.readdirSync(scrapedDataDir);
  
  const providerFiles = files.filter(f => f.startsWith('providers_') && f.endsWith('.json'));
  
  console.log(`📂 Found ${providerFiles.length} provider files in scraped_data/`);
  
  for (const file of providerFiles) {
    const filePath = path.join(scrapedDataDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const providers = JSON.parse(content) as ScrapedProvider[];
      console.log(`   ✓ ${file}: ${providers.length} providers`);
      allProviders.push(...providers);
    } catch (error) {
      console.warn(`   ⚠️ Failed to parse ${file}:`, error);
    }
  }
  
  return allProviders;
}

/**
 * Extract unique cities from providers
 */
function extractCities(providers: ScrapedProvider[]): City[] {
  const cityMap = new Map<string, City>();
  
  for (const provider of providers) {
    if (provider.city && provider.state) {
      const cityId = provider.city.toLowerCase().replace(/\s+/g, '-');
      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, {
          id: cityId,
          name: provider.city,
          state: provider.state,
        });
      }
    }
  }
  
  return Array.from(cityMap.values());
}

/**
 * Deduplicate providers by business name and location
 */
function deduplicateProviders(providers: ScrapedProvider[]): ScrapedProvider[] {
  const seen = new Map<string, ScrapedProvider>();
  
  for (const provider of providers) {
    const key = `${provider.businessName.toLowerCase()}_${provider.location.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, provider);
    }
  }
  
  console.log(`   Deduplicated: ${providers.length} → ${seen.size} unique providers`);
  return Array.from(seen.values());
}

/**
 * Clear a collection before seeding
 */
async function clearCollection(collectionName: string): Promise<void> {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.size === 0) {
    console.log(`   Collection is empty`);
    return;
  }
  
  // Delete in batches of 500 (Firestore limit)
  const batchSize = 500;
  let deleted = 0;
  
  while (deleted < snapshot.size) {
    const batch = db.batch();
    const docsToDelete = snapshot.docs.slice(deleted, deleted + batchSize);
    
    docsToDelete.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deleted += docsToDelete.length;
  }
  
  console.log(`   Deleted ${snapshot.size} documents`);
}

/**
 * Seed categories collection
 */
async function seedCategories(categories: Category[]): Promise<void> {
  console.log(`\n📦 Seeding categories...`);
  await clearCollection('categories');
  
  const batch = db.batch();
  
  for (const category of categories) {
    const docRef = db.collection('categories').doc(category.id);
    batch.set(docRef, {
      name: category.name,
      icon: category.icon,
      description: category.description,
      image: category.image,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`   ✓ Added: ${category.name}`);
  }
  
  await batch.commit();
  console.log(`✅ Seeded ${categories.length} categories`);
}

/**
 * Seed cities collection
 */
async function seedCities(cities: City[]): Promise<void> {
  if (cities.length === 0) {
    console.log(`⏭️  Skipping cities (no data)`);
    return;
  }
  
  console.log(`\n📦 Seeding cities...`);
  await clearCollection('cities');
  
  const batch = db.batch();
  
  for (const city of cities) {
    const docRef = db.collection('cities').doc(city.id);
    batch.set(docRef, {
      name: city.name,
      state: city.state,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`   ✓ Added: ${city.name}, ${city.state}`);
  }
  
  await batch.commit();
  console.log(`✅ Seeded ${cities.length} cities`);
}

/**
 * Seed providers collection in batches
 */
async function seedProviders(
  providers: ScrapedProvider[],
  categoryImageMap: Map<string, string>
): Promise<void> {
  if (providers.length === 0) {
    console.log(`⏭️  Skipping providers (no data)`);
    return;
  }
  
  console.log(`\n📦 Seeding providers...`);
  await clearCollection('providers');
  
  // Firestore batch limit is 500 operations
  const batchSize = 400;
  let processed = 0;
  let fallbackImageCount = 0;
  
  while (processed < providers.length) {
    const batch = db.batch();
    const chunk = providers.slice(processed, processed + batchSize);
    
    for (const provider of chunk) {
      // Use the scraped ID as the document ID
      const docRef = db.collection('providers').doc(provider.id);
      
      // Determine the profile image
      // If provider has no profileImage, use the category image as fallback
      let profileImage = provider.profileImage || '';
      if (!profileImage) {
        profileImage = getCategoryImage(provider.categories, categoryImageMap);
        if (profileImage) {
          fallbackImageCount++;
        }
      }
      
      batch.set(docRef, {
        businessName: provider.businessName,
        description: provider.description || '',
        categories: provider.categories,
        location: provider.location,
        city: provider.city,
        state: provider.state,
        postcode: provider.postcode,
        phone: provider.phone,
        website: provider.website,
        rating: provider.rating || 0,
        reviewCount: provider.reviewCount || 0,
        verified: provider.verified || false,
        profileImage: profileImage,
        latitude: provider.latitude,
        longitude: provider.longitude,
        businessHours: provider.businessHours,
        googleMapsUrl: provider.googleMapsUrl,
        placeId: provider.placeId,
        freeConsultation: provider.freeConsultation || false,
        freeConsultationSource: provider.freeConsultationSource || '',
        freeConsultationTermsMatched: provider.freeConsultationTermsMatched || [],
        dataSource: provider.dataSource,
        scrapedAt: provider.scrapedAt,
        needsManualVerification: provider.needsManualVerification || false,
        bio: '', // Default empty bio
        consultationSlots: [], // Default empty slots
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    
    await batch.commit();
    processed += chunk.length;
    console.log(`   ✓ Seeded ${processed}/${providers.length} providers`);
  }
  
  console.log(`✅ Seeded ${providers.length} providers`);
  console.log(`   📷 ${fallbackImageCount} providers using category image as profileImage`);
}

// ==================== MAIN SEED FUNCTION ====================

async function seedDatabase(): Promise<void> {
  console.log('🚀 Starting database seeding...');
  console.log('==================================================');
  console.log(`📂 Loading data from: ${scrapedDataDir}`);
  console.log('==================================================\n');

  try {
    // Load categories from JSON file
    const categories = loadCategories();
    console.log(`📂 Loaded ${categories.length} categories from categories.json`);
    
    // Create category name → image mapping for provider fallback images
    const categoryImageMap = createCategoryImageMap(categories);
    console.log(`   Created image mapping for ${categoryImageMap.size} category variations`);
    
    // Load all providers from scraped data files
    const allProviders = loadAllProviders();
    
    // Deduplicate providers
    const providers = deduplicateProviders(allProviders);
    
    // Extract cities from providers
    const cities = extractCities(providers);

    console.log(`\n📊 Data summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Cities: ${cities.length} (extracted from providers)`);
    console.log(`   - Providers: ${providers.length} (from scraped data)`);

    // Seed collections
    await seedCategories(categories);
    await seedCities(cities);
    await seedProviders(providers, categoryImageMap);

    console.log('\n==================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('==================================================');
    
    console.log('\n📝 Summary:');
    console.log(`   ✅ ${categories.length} categories`);
    console.log(`   ✅ ${cities.length} cities`);
    console.log(`   ✅ ${providers.length} providers`);
    
    // Show breakdown by city
    const cityBreakdown = new Map<string, number>();
    for (const provider of providers) {
      const count = cityBreakdown.get(provider.city) || 0;
      cityBreakdown.set(provider.city, count + 1);
    }
    console.log('\n📍 Providers by city:');
    for (const [city, count] of cityBreakdown) {
      console.log(`   - ${city}: ${count}`);
    }
    
    // Show breakdown by category
    const categoryBreakdown = new Map<string, number>();
    for (const provider of providers) {
      for (const cat of provider.categories) {
        const count = categoryBreakdown.get(cat) || 0;
        categoryBreakdown.set(cat, count + 1);
      }
    }
    console.log('\n🏷️  Providers by category:');
    for (const [cat, count] of categoryBreakdown) {
      console.log(`   - ${cat}: ${count}`);
    }
    
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
