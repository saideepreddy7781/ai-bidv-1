# URGENT: Firebase Setup Fix

## Problem
- ❌ Can't register new users (vendors, procurement officers, etc.)
- ❌ Can't create tenders

## Root Cause
Firebase Email/Password authentication is **NOT enabled** in your Firebase Console.

## 🔧 IMMEDIATE FIX (2 minutes)

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **ai-bid-4a338**
3. Click **Authentication** in the left sidebar
4. Click **Get started** (if you haven't already)
5. Go to **Sign-in method** tab
6. Click on **Email/Password** provider
7. **Toggle ON** the "Enable" switch
8. Click **Save**

### Step 2: Enable Google Sign-In (Optional but Recommended)

1. Still in **Sign-in method** tab
2. Click on **Google** provider
3. **Toggle ON** the "Enable" switch
4. Add support email (use your email)
5. Click **Save**

### Step 3: Update Firestore Rules

1. Go to **Firestore Database** in Firebase Console
2. Click **Rules** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write users during development
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if true; // Allow user creation during registration
    }
    
    // Tenders
    match /tenders/{tenderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Bids
    match /bids/{bidId} {
      allow read, write: if request.auth != null;
    }
    
    // Evaluations
    match /evaluations/{evaluationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

## ✅ Test After Fix

1. **Refresh your browser** at http://localhost:5173
2. Try registering: `procurement@test.com` / `test123`
3. Should redirect to dashboard
4. Try creating a tender

## 🚨 If Still Not Working

**Check browser console for errors:**
1. Open browser
2. Press `F12` (or Cmd+Option+I on Mac)
3. Go to **Console** tab
4. Try registering again
5. Send me any RED error messages you see

## Alternative: Use Existing Account

You already have one working account:
- **Email:** vendor@test.com
- **Password:** test123

But you won't be able to create tenders with this account because it's a VENDOR role, not PROCUREMENT_OFFICER.

## Quick Recovery Plan

**Option 1:** Enable Firebase Auth (2 min) - **RECOMMENDED**

**Option 2:** I can create a seed script to add test accounts directly to Firestore (5 min)

Let me know which you prefer!
