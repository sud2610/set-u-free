/**
 * Create Admin User Script
 * 
 * Creates an admin user in Firebase Auth and Firestore
 * 
 * Usage:
 * npx ts-node --project tsconfig.seed.json scripts/create-admin.ts <email> <password> <name>
 * 
 * Example:
 * npx ts-node --project tsconfig.seed.json scripts/create-admin.ts admin@example.com MySecurePass123 "Admin User"
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// ==================== CONFIGURATION ====================

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

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
const auth = admin.auth();

// ==================== MAIN FUNCTION ====================

async function createAdminUser(): Promise<void> {
  console.log('👤 Create Admin User Script');
  console.log('==================================================\n');

  // Get arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: npx ts-node --project tsconfig.seed.json scripts/create-admin.ts <email> <password> <name>');
    console.log('');
    console.log('Example:');
    console.log('  npx ts-node --project tsconfig.seed.json scripts/create-admin.ts admin@example.com MySecurePass123 "Admin User"');
    console.log('');
    process.exit(1);
  }

  const [email, password, ...nameParts] = args;
  const fullName = nameParts.join(' ');

  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${fullName}`);
  console.log('');

  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(email);
      console.log(`⚠️  User with email ${email} already exists (UID: ${existingUser.uid})`);
      console.log('   Updating user role to admin in Firestore...');
      
      // Update Firestore to make them admin
      await db.collection('users').doc(existingUser.uid).set({
        uid: existingUser.uid,
        email: email,
        fullName: fullName,
        role: 'admin',
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      console.log('   ✅ User role updated to admin!');
      return;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // User doesn't exist, create new one
    }

    // Create user in Firebase Auth
    console.log('📝 Creating user in Firebase Auth...');
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    console.log(`   ✅ Auth user created with UID: ${userRecord.uid}`);

    // Create user document in Firestore
    console.log('📝 Creating user document in Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      fullName: fullName,
      role: 'admin',
      isActive: true,
      location: '',
      phone: '',
      profileImage: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('   ✅ Firestore document created!');

    console.log('\n==================================================');
    console.log('✅ Admin user created successfully!');
    console.log('==================================================');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👑 Role: admin`);
    console.log('\n🎯 You can now log in at /login with these credentials');
    console.log('   and access the admin panel at /admin');
    console.log('');

  } catch (error) {
    console.error('\n❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

// ==================== RUN SCRIPT ====================

createAdminUser().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

