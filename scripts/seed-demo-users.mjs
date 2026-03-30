const API_KEY = process.env.VITE_FIREBASE_API_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error('Missing Firebase environment variables.');
  console.error('Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID');
  process.exit(1);
}

const defaultPassword = process.env.DEMO_USERS_PASSWORD || 'Test@123456';

const demoUsers = [
  {
    email: process.env.DEMO_VENDOR_EMAIL || 'vendor.demo@aibid.local',
    password: process.env.DEMO_VENDOR_PASSWORD || defaultPassword,
    profile: {
      displayName: 'Demo Vendor',
      role: 'VENDOR',
      companyName: 'Demo Supplies Pvt Ltd',
      registrationNumber: 'DEMO-VENDOR-001'
    }
  },
  {
    email: process.env.DEMO_PROCUREMENT_EMAIL || 'procurement.demo@aibid.local',
    password: process.env.DEMO_PROCUREMENT_PASSWORD || defaultPassword,
    profile: {
      displayName: 'Demo Procurement Officer',
      role: 'PROCUREMENT_OFFICER'
    }
  },
  {
    email: process.env.DEMO_EVALUATOR_EMAIL || 'evaluator.demo@aibid.local',
    password: process.env.DEMO_EVALUATOR_PASSWORD || defaultPassword,
    profile: {
      displayName: 'Demo Evaluator',
      role: 'EVALUATOR'
    }
  },
  {
    email: process.env.DEMO_ADMIN_EMAIL || 'admin.demo@aibid.local',
    password: process.env.DEMO_ADMIN_PASSWORD || defaultPassword,
    profile: {
      displayName: 'Demo Admin',
      role: 'ADMIN'
    }
  }
];

const baseAuthUrl = 'https://identitytoolkit.googleapis.com/v1';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function createUser(email, password) {
  const response = await fetch(`${baseAuthUrl}/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to create user');
  }

  return data;
}

async function signIn(email, password) {
  const response = await fetch(`${baseAuthUrl}/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to sign in');
  }

  return data;
}

function toFirestoreFields(payload) {
  const fields = {};

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
      continue;
    }

    if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
      continue;
    }

    if (Number.isInteger(value)) {
      fields[key] = { integerValue: String(value) };
      continue;
    }

    if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
      continue;
    }

    if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
      continue;
    }

    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    }
  }

  return { fields };
}

async function upsertUserProfile({ uid, idToken, email, profile }) {
  const docPath = `${firestoreBase}/users/${uid}`;
  const now = new Date();
  const payload = {
    uid,
    email,
    ...profile,
    createdAt: now,
    seededByScript: true
  };

  const response = await fetch(docPath, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(toFirestoreFields(payload))
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to upsert Firestore profile');
  }

  return data;
}

async function ensureUser(entry) {
  const { email, password, profile } = entry;

  try {
    const created = await createUser(email, password);
    await upsertUserProfile({
      uid: created.localId,
      idToken: created.idToken,
      email,
      profile
    });

    return { email, status: 'created', role: profile.role };
  } catch (error) {
    if (!String(error.message).includes('EMAIL_EXISTS')) {
      return { email, status: 'failed', role: profile.role, error: error.message };
    }

    try {
      const signedIn = await signIn(email, password);
      await upsertUserProfile({
        uid: signedIn.localId,
        idToken: signedIn.idToken,
        email,
        profile
      });
      return { email, status: 'updated', role: profile.role };
    } catch (signInError) {
      return {
        email,
        status: 'failed',
        role: profile.role,
        error: `EMAIL_EXISTS but sign-in/upsert failed: ${signInError.message}`
      };
    }
  }
}

async function run() {
  console.log('Seeding demo users...');
  const results = [];

  for (const user of demoUsers) {
    // Process sequentially to simplify output and avoid quota bursts.
    const result = await ensureUser(user);
    results.push(result);

    if (result.status === 'failed') {
      console.error(`✗ ${result.role}: ${result.email} -> ${result.error}`);
    } else {
      console.log(`✓ ${result.role}: ${result.email} (${result.status})`);
    }
  }

  const hasFailure = results.some((r) => r.status === 'failed');

  console.log('\nDemo credentials:');
  for (const user of demoUsers) {
    console.log(`- ${user.profile.role}: ${user.email} / ${user.password}`);
  }

  if (hasFailure) {
    process.exit(1);
  }

  console.log('\nAll demo users are ready.');
}

run().catch((error) => {
  console.error('Unexpected error while seeding users:', error.message);
  process.exit(1);
});
