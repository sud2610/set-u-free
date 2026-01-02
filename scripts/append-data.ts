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
  images?: string[]; // Array of images for random selection
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
 * Create a mapping from category name to array of category images
 * Handles case-insensitive matching
 */
function createCategoryImageMap(categories: Category[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  
  for (const category of categories) {
    // Use images array if available, otherwise fallback to single image
    const images = category.images && category.images.length > 0 
      ? category.images 
      : [category.image];
    
    // Map by exact name
    map.set(category.name.toLowerCase(), images);
    
    // Also map common variations
    // e.g., "Migration & Visa Advisers" -> "Migration"
    const firstName = category.name.split(/[&,]/)[0].trim().toLowerCase();
    if (!map.has(firstName)) {
      map.set(firstName, images);
    }
  }
  
  return map;
}

/**
 * Create a mapping from common category variations to the correct category name
 * This allows scraped data to use simple names like "Recruitment" which get
 * automatically mapped to "Recruitment Agencies"
 */
function createCategoryNameMap(categories: Category[]): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const category of categories) {
    const correctName = category.name;
    
    // Map exact name (lowercase for comparison)
    map.set(correctName.toLowerCase(), correctName);
    
    // Map first word as a shorthand
    // e.g., "Recruitment Agencies" -> also match "Recruitment"
    const firstName = correctName.split(/[&,\s]+/)[0].toLowerCase();
    if (!map.has(firstName)) {
      map.set(firstName, correctName);
    }
    
    // Handle specific known variations
    if (correctName === 'Migration & Visa Advisers') {
      map.set('migration', correctName);
      map.set('visa', correctName);
    }
    if (correctName === 'Legal Services') {
      map.set('legal', correctName);
    }
    if (correctName === 'Eye Care') {
      map.set('eyecare', correctName);
      map.set('optometry', correctName);
    }
    if (correctName === 'Mental Health') {
      map.set('mentalhealth', correctName);
      map.set('counseling', correctName);
      map.set('therapy', correctName);
    }
  }
  
  return map;
}

/**
 * Normalize category names to match categories.json
 * Maps variations like "Recruitment" to "Recruitment Agencies"
 */
function normalizeCategories(
  providerCategories: string[],
  categoryNameMap: Map<string, string>
): string[] {
  return providerCategories.map(cat => {
    const normalized = categoryNameMap.get(cat.toLowerCase());
    if (normalized) {
      return normalized;
    }
    // If no match found, return original (will be logged as warning)
    console.warn(`   ⚠️ Unknown category: "${cat}" - keeping as-is`);
    return cat;
  });
}

/**
 * Get a random category image for a provider based on their first category
 */
function getCategoryImage(categories: string[], categoryImageMap: Map<string, string[]>): string {
  if (!categories || categories.length === 0) {
    return '';
  }
  
  const primaryCategory = categories[0].toLowerCase();
  
  // Helper to pick a random image from array
  const pickRandom = (images: string[]): string => {
    if (!images || images.length === 0) return '';
    return images[Math.floor(Math.random() * images.length)];
  };
  
  // Try exact match first
  if (categoryImageMap.has(primaryCategory)) {
    return pickRandom(categoryImageMap.get(primaryCategory)!);
  }
  
  // Try partial match
  const entries = Array.from(categoryImageMap.entries());
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];
    const images = entries[i][1];
    if (primaryCategory.includes(key) || key.includes(primaryCategory)) {
      return pickRandom(images);
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
 * Get existing provider IDs from Firebase
 */
async function getExistingProviderIds(): Promise<Set<string>> {
  console.log(`📂 Fetching existing provider IDs from Firebase...`);
  const existingIds = new Set<string>();
  
  const snapshot = await db.collection('providers').select().get();
  snapshot.docs.forEach(doc => existingIds.add(doc.id));
  
  console.log(`   Found ${existingIds.size} existing providers in Firebase`);
  return existingIds;
}

/**
 * Get existing city IDs from Firebase
 */
async function getExistingCityIds(): Promise<Set<string>> {
  const existingIds = new Set<string>();
  
  const snapshot = await db.collection('cities').select().get();
  snapshot.docs.forEach(doc => existingIds.add(doc.id));
  
  return existingIds;
}

/**
 * Append new cities (only add those that don't exist)
 */
async function appendCities(cities: City[]): Promise<number> {
  if (cities.length === 0) {
    console.log(`⏭️  Skipping cities (no data)`);
    return 0;
  }
  
  console.log(`\n📦 Appending new cities...`);
  
  const existingCityIds = await getExistingCityIds();
  const newCities = cities.filter(city => !existingCityIds.has(city.id));
  
  if (newCities.length === 0) {
    console.log(`   ✓ No new cities to add (all ${cities.length} cities already exist)`);
    return 0;
  }
  
  const batch = db.batch();
  
  for (const city of newCities) {
    const docRef = db.collection('cities').doc(city.id);
    batch.set(docRef, {
      name: city.name,
      state: city.state,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`   ✓ Adding: ${city.name}, ${city.state}`);
  }
  
  await batch.commit();
  console.log(`✅ Added ${newCities.length} new cities (skipped ${cities.length - newCities.length} existing)`);
  return newCities.length;
}

/**
 * Append providers (only add those that don't exist)
 */
async function appendProviders(
  providers: ScrapedProvider[],
  categoryImageMap: Map<string, string[]>,
  categoryNameMap: Map<string, string>
): Promise<number> {
  if (providers.length === 0) {
    console.log(`⏭️  Skipping providers (no data)`);
    return 0;
  }
  
  console.log(`\n📦 Appending new providers...`);
  
  // Get existing provider IDs to skip duplicates
  const existingIds = await getExistingProviderIds();
  
  // Filter out providers that already exist
  const newProviders = providers.filter(p => !existingIds.has(p.id));
  
  if (newProviders.length === 0) {
    console.log(`   ✓ No new providers to add (all ${providers.length} providers already exist)`);
    return 0;
  }
  
  console.log(`   📊 ${newProviders.length} new providers to add (skipping ${providers.length - newProviders.length} existing)`);
  
  // Firestore batch limit is 500 operations
  const batchSize = 400;
  let processed = 0;
  let fallbackImageCount = 0;
  
  while (processed < newProviders.length) {
    const batch = db.batch();
    const chunk = newProviders.slice(processed, processed + batchSize);
    
    for (const provider of chunk) {
      // Use the scraped ID as the document ID
      const docRef = db.collection('providers').doc(provider.id);
      
      // Normalize category names to match categories.json
      const normalizedCategories = normalizeCategories(provider.categories, categoryNameMap);
      
      // Determine the profile image
      // If provider has no profileImage, use the category image as fallback
      let profileImage = provider.profileImage || '';
      if (!profileImage) {
        profileImage = getCategoryImage(normalizedCategories, categoryImageMap);
        if (profileImage) {
          fallbackImageCount++;
        }
      }
      
      batch.set(docRef, {
        businessName: provider.businessName,
        description: provider.description || '',
        categories: normalizedCategories,
        location: provider.location,
        city: provider.city,
        state: provider.state,
        postcode: provider.postcode,
        phone: provider.phone,
        website: provider.website,
        rating: provider.rating || 0,
        reviewCount: provider.reviewCount || 0,
        verified: provider.verified || false,
        status: 'approved',
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
    console.log(`   ✓ Added ${processed}/${newProviders.length} new providers`);
  }
  
  console.log(`✅ Added ${newProviders.length} new providers`);
  console.log(`   📷 ${fallbackImageCount} providers using category image as profileImage`);
  return newProviders.length;
}

// ==================== MAIN APPEND FUNCTION ====================

async function appendDatabase(): Promise<void> {
  console.log('🚀 Starting database append (keeping existing data)...');
  console.log('==================================================');
  console.log(`📂 Loading data from: ${scrapedDataDir}`);
  console.log('⚠️  NOTE: This will ADD new data without deleting existing data');
  console.log('==================================================\n');

  try {
    // Load categories from JSON file
    const categories = loadCategories();
    console.log(`📂 Loaded ${categories.length} categories from categories.json`);
    
    // Create category name → image mapping for provider fallback images
    const categoryImageMap = createCategoryImageMap(categories);
    console.log(`   Created image mapping for ${categoryImageMap.size} category variations`);
    
    // Create category name normalization map (e.g., "Recruitment" -> "Recruitment Agencies")
    const categoryNameMap = createCategoryNameMap(categories);
    console.log(`   Created name mapping for ${categoryNameMap.size} category variations`);
    
    // Load all providers from scraped data files
    const allProviders = loadAllProviders();
    
    // Deduplicate providers
    const providers = deduplicateProviders(allProviders);
    
    // Extract cities from providers
    const cities = extractCities(providers);

    console.log(`\n📊 Data to process:`);
    console.log(`   - Cities: ${cities.length} (from scraped data)`);
    console.log(`   - Providers: ${providers.length} (from scraped data)`);

    // Append new data (without deleting existing)
    const newCitiesCount = await appendCities(cities);
    const newProvidersCount = await appendProviders(providers, categoryImageMap, categoryNameMap);

    console.log('\n==================================================');
    console.log('🎉 Database append completed successfully!');
    console.log('==================================================');
    
    console.log('\n📝 Summary:');
    console.log(`   ✅ ${newCitiesCount} new cities added`);
    console.log(`   ✅ ${newProvidersCount} new providers added`);
    console.log(`   ⏭️  ${providers.length - newProvidersCount} existing providers skipped`);
    
    if (newProvidersCount > 0) {
      // Show breakdown by city for new providers
      const newProviderIds = new Set(
        providers.filter(p => newProvidersCount > 0).slice(-newProvidersCount).map(p => p.id)
      );
      
      const cityBreakdown = new Map<string, number>();
      for (const provider of providers) {
        if (!cityBreakdown.has(provider.city)) {
          cityBreakdown.set(provider.city, 0);
        }
      }
      
      // Simplified breakdown - just show what was in the scraped data
      console.log('\n📍 Providers in scraped data by city:');
      const providersByCity = new Map<string, number>();
      for (const provider of providers) {
        const count = providersByCity.get(provider.city) || 0;
        providersByCity.set(provider.city, count + 1);
      }
      Array.from(providersByCity.entries()).forEach(([city, count]) => {
        console.log(`   - ${city}: ${count}`);
      });
      
      // Show breakdown by category
      const categoryBreakdown = new Map<string, number>();
      for (const provider of providers) {
        for (const cat of provider.categories) {
          const count = categoryBreakdown.get(cat) || 0;
          categoryBreakdown.set(cat, count + 1);
        }
      }
      console.log('\n🏷️  Providers in scraped data by category:');
      Array.from(categoryBreakdown.entries()).forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Database append failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await deleteApp(app);
  }
}

// ==================== RUN SCRIPT ====================

appendDatabase();

