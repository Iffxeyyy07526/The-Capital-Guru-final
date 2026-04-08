import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

async function seed() {
  try {
    const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app, config.firestoreDatabaseId);

    const email = 'xenfxeliteofficial@gmail.com';
    const password = 'Iftekhar@18';
    
    let uid = '';
    try {
      console.log('Attempting to create user...');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log('Created new user.');
    } catch (e: any) {
      console.log('Create user failed with code:', e.code);
      if (e.code === 'auth/email-already-in-use') {
        console.log('Attempting to sign in instead...');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
        console.log('User already exists, logged in to update data.');
      } else {
        throw e;
      }
    }

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      name: 'iftekhar sheikh',
      email: email,
      mobileNumber: '+919106713107',
      telegramUsername: '@themoneymadness',
      address: 'gnsjdidosnbdkdodmbn',
      subscriptionPlan: 'yearly',
      subscriptionStatus: 'active',
      subscriptionExpiry: expiryDate.toISOString(),
      createdAt: new Date().toISOString()
    });
    
    console.log('Mock data seeded successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e);
    process.exit(1);
  }
}

seed();
