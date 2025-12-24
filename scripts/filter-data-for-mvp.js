/**
 * Filter data for MVP - Keep only Sydney (NSW) and Melbourne (VIC) data
 * 
 * Run: node scripts/filter-data-for-mvp.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../Data');

// Target states for MVP
const MVP_STATES = ['NSW', 'VIC'];

console.log('🔧 Filtering data for MVP (Sydney & Melbourne only)...\n');

// 1. Load providers
console.log('📂 Loading providers.json...');
const providersPath = path.join(dataDir, 'providers.json');
const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));
console.log(`   Total providers: ${providers.length}`);

// 2. Filter providers by state
const filteredProviders = providers.filter(provider => 
  MVP_STATES.includes(provider.state)
);
console.log(`   NSW/VIC providers: ${filteredProviders.length}`);

// 3. Get list of provider IDs to keep
const providerIdsToKeep = new Set(filteredProviders.map(p => p.id));

// 4. Load services
console.log('\n📂 Loading services.json...');
const servicesPath = path.join(dataDir, 'services.json');
const services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
console.log(`   Total services: ${services.length}`);

// 5. Filter services by provider
const filteredServices = services.filter(service => 
  providerIdsToKeep.has(service.providerId)
);
console.log(`   Services for NSW/VIC: ${filteredServices.length}`);

// 6. Re-number providers and services
console.log('\n🔢 Re-numbering IDs...');

// Create ID mapping for providers
const providerIdMap = new Map();
const renumberedProviders = filteredProviders.map((provider, index) => {
  const newId = `provider_${index + 1}`;
  providerIdMap.set(provider.id, newId);
  return {
    ...provider,
    id: newId
  };
});

// Update services with new provider IDs and renumber
const renumberedServices = filteredServices.map((service, index) => {
  const newProviderId = providerIdMap.get(service.providerId);
  return {
    ...service,
    id: `service_${index + 1}`,
    providerId: newProviderId
  };
});

// 7. Backup original files
console.log('\n💾 Backing up original files...');
const backupDir = path.join(dataDir, 'backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}
fs.copyFileSync(providersPath, path.join(backupDir, 'providers.json.backup'));
fs.copyFileSync(servicesPath, path.join(backupDir, 'services.json.backup'));
console.log('   Backups saved to Data/backup/');

// 8. Save filtered data
console.log('\n💾 Saving filtered data...');
fs.writeFileSync(providersPath, JSON.stringify(renumberedProviders, null, 2));
fs.writeFileSync(servicesPath, JSON.stringify(renumberedServices, null, 2));

// 9. Summary
console.log('\n==================================================');
console.log('✅ Data filtering complete!');
console.log('==================================================');
console.log('\n📊 Summary:');
console.log(`   Providers: ${providers.length} → ${renumberedProviders.length} (removed ${providers.length - renumberedProviders.length})`);
console.log(`   Services:  ${services.length} → ${renumberedServices.length} (removed ${services.length - renumberedServices.length})`);
console.log(`   Cities:    Keeping Sydney & Melbourne only`);

// Count by state
const nswCount = renumberedProviders.filter(p => p.state === 'NSW').length;
const vicCount = renumberedProviders.filter(p => p.state === 'VIC').length;
console.log(`\n   NSW (Sydney area): ${nswCount} providers`);
console.log(`   VIC (Melbourne area): ${vicCount} providers`);

console.log('\n🎯 Next steps:');
console.log('   1. Run the cleanup script to clear Firebase');
console.log('   2. Run: npx ts-node --project tsconfig.seed.json scripts/seed-data.ts');
console.log('');

