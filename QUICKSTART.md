# AI Bid Evaluation Platform - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Environment Setup
```bash
# Copy environment template
cp .env.example .env
```

### Step 2: Get Firebase Credentials

1. Go to https://console.firebase.google.com
2. Create a new project
3. Click ⚙️ Settings > Project Settings
4. Scroll to "Your apps" > Click "Web" icon
5. Copy the config values to `.env`

### Step 3: Enable Firebase Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable "Email/Password"
3. Enable "Google"

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location

#### Storage
1. Go to Storage
2. Click "Get started"
3. Start in **test mode**

### Step 4: Get Gemini API Key

1. Visit https://ai.google.dev
2. Click "Get API Key"
3. Copy the key to `.env`

### Step 5: Run the App

```bash
npm install
npm run dev
```

Visit http://localhost:5173 🎉

## 🧑‍💻 Create Your First Test Account

1. Click "Get Started" or "Register"
2. Fill in details:
   - Name: Test Vendor
   - Email: vendor@test.com
   - Role: Vendor
   - Company: Test Corp
   - Password: test123
3. Login and explore!

## 📋 Demo Test Accounts

Create these accounts for full demo:

| Role | Email | Purpose |
|------|-------|---------|
| Vendor | vendor@test.com | Submit bids |
| Procurement | procurement@test.com | Create tenders |
| Evaluator | evaluator@test.com | Evaluate bids |
| Admin | admin@test.com | System management |

## 🎯 Demo Flow

1. **Procurement Officer**: Create a tender
2. **Vendor**: Submit a bid (upload a PDF)
3. **AI**: Analyzes the document automatically
4. **Evaluator**: Reviews and scores
5. **All**: See real-time updates

## 📝 Sample Tender

**Title**: Website Development Project
**Description**: Build a responsive website for a government agency
**Deadline**: 30 days from today
**Criteria**:
- Technical Capability (40%)
- Cost (30%)
- Experience (20%)
- Compliance (10%)

## 🚨 Common Issues

**"Firebase: Error (auth/operation-not-allowed)"**
→ Enable Email/Password in Firebase Auth

**"Firestore: Missing or insufficient permissions"**
→ Start Firestore in test mode

**"AI analysis not working"**
→ Check Gemini API key in `.env`

## 📚 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Google AI Studio](https://ai.google.dev)
- [Project Documentation](./README.md)

---

**Ready to hack! 🚀**
