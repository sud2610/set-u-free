/**
 * Script to make a user an admin
 * 
 * Usage:
 * npx ts-node --project tsconfig.seed.json scripts/make-admin.ts <user-email>
 * 
 * Example:
 * npx ts-node --project tsconfig.seed.json scripts/make-admin.ts admin@freesetu.com
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

const db = admin.firestore();

async function makeAdmin(email: string) {
  console.log(`\n🔍 Looking for user with email: ${email}\n`);

  try {
    // Find user by email
    const usersSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error(`❌ No user found with email: ${email}`);
      console.log('\nMake sure the user has registered first.');
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    console.log(`📋 Found user:`);
    console.log(`   Name: ${userData.fullName}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Current Role: ${userData.role}`);

    if (userData.role === 'admin') {
      console.log('\n✅ User is already an admin!');
      process.exit(0);
    }

    // Update user role to admin
    await userDoc.ref.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`\n✅ Successfully updated ${userData.fullName} to admin role!`);
    console.log(`\n🔐 They can now access the admin dashboard at /admin`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.log('\n📝 Usage: npx ts-node --project tsconfig.seed.json scripts/make-admin.ts <user-email>');
  console.log('\nExample:');
  console.log('  npx ts-node --project tsconfig.seed.json scripts/make-admin.ts admin@freesetu.com\n');
  process.exit(1);
}

makeAdmin(email).then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

