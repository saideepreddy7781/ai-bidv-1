# AI Bid Evaluation Platform 🤖 -V1.0

A hackathon-ready AI-powered government bid evaluation platform built with React, Firebase, and Google Gemini API.

## 🚀 Features

### Core Functionality
- **🔐 Multi-Role Authentication**: Vendors, Procurement Officers, Evaluators, and Admins
- **📄 Tender Management**: Create, view, and manage procurement tenders
- **📝 Bid Submission**: Vendors can submit bids with document uploads
- **🤖 AI-Powered Analysis**: Automatic document analysis using Google Gemini API
- **✅ Compliance Checking**: Automated verification against tender requirements
- **📊 Comparative Analysis**: AI-driven bid ranking and comparison
- **⚡ Real-time Updates**: Live data synchronization with Firestore

### Technology Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI Engine**: Google Gemini API
- **Routing**: React Router v6
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- A Firebase project
- Google Gemini API key

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ai-bidv-1
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password and Google providers
   - **Firestore Database**: Create in test mode (update security rules for production)
   - **Storage**: Enable Firebase Storage

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Web" icon to add a web app
   - Copy the configuration object

### 3. Google Gemini API Setup

1. Visit [Google AI Studio](https://ai.google.dev)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use existing one
5. Copy the API key

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
VITE_MAX_FILE_SIZE_MB=10
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx
```

### 5. Firestore Security Rules

Update your Firestore security rules (Firebase Console > Firestore Database > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Tenders collection
    match /tenders/{tenderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PROCUREMENT_OFFICER', 'ADMIN'];
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['PROCUREMENT_OFFICER', 'ADMIN'];
    }
    
    // Bids collection
    match /bids/{bidId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'VENDOR';
      allow update: if request.auth != null && 
        resource.data.vendorId == request.auth.uid;
    }
    
    // Evaluations collection
    match /evaluations/{evaluationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['EVALUATOR', 'ADMIN'];
    }
  }
}
```

### 6. Firebase Storage Rules

Update Storage rules (Firebase Console > Storage > Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bids/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 👥 User Roles & Access

### Vendor
- View available tenders
- Submit bids with document uploads
- Track bid submission status
- View AI analysis results

### Procurement Officer
- Create and manage tenders
- View all bid submissions
- Access AI-generated insights
- Monitor tender progress

### Evaluator
- Review bid submissions
- Access AI recommendations
- Score bids manually
- Generate comparative reports

### Admin
- Full system access
- User management
- Tender oversight
- System analytics

## 📁 Project Structure

```
ai-bidv-1/
├── src/
│   ├── components/
│   │   ├── authentication/      # Login, Register, ProtectedRoute
│   │   ├── dashboard/           # Role-specific dashboards
│   │   ├── bid-submission/      # Bid submission components
│   │   ├── evaluation/          # Evaluation components
│   │   ├── vendor-management/   # Vendor management
│   │   ├── admin/               # Admin components
│   │   ├── layout/              # Navbar, Sidebar
│   │   └── shared/              # Reusable components
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── services/
│   │   ├── firebaseService.js   # Firestore operations
│   │   └── geminiService.js     # Gemini API integration
│   ├── utils/
│   │   ├── constants.js         # App constants
│   │   └── helpers.js           # Utility functions
│   ├── hooks/
│   │   ├── useFirestore.js      # Firestore custom hook
│   │   └── useStorage.js        # Storage custom hook
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── App.jsx                  # Main app with routing
│   └── main.jsx                 # Entry point
├── .env.example                 # Environment template
├── package.json
└── README.md
```

## 🔥 Firebase Collections Schema

### users
```javascript
{
  uid: "string",
  email: "string",
  role: "VENDOR | PROCUREMENT_OFFICER | EVALUATOR | ADMIN",
  displayName: "string",
  companyName: "string", // For vendors
  registrationNumber: "string", // For vendors
  createdAt: timestamp
}
```

### tenders
```javascript
{
  id: "auto-generated",
  title: "string",
  description: "string",
  deadline: timestamp,
  criteria: [
    { name: "string", weight: number, description: "string" }
  ],
  status: "OPEN | CLOSED | EVALUATING | COMPLETED",
  createdBy: "userId",
  createdAt: timestamp,
  requirements: {}
}
```

### bids
```javascript
{
  id: "auto-generated",
  tenderId: "string",
  vendorId: "string",
  documents: [
    { name: "string", url: "string", uploadedAt: timestamp }
  ],
  aiAnalysis: {
    summary: "string",
    extractedInfo: {},
    complianceCheck: {},
    recommendations: "string"
  },
  submittedAt: timestamp,
  status: "DRAFT | SUBMITTED | UNDER_REVIEW | EVALUATED"
}
```

### evaluations
```javascript
{
  id: "auto-generated",
  bidId: "string",
  tenderId: "string",
  evaluatorId: "string",
  scores: { "criterion": number },
  totalScore: number,
  comments: "string",
  recommendation: "APPROVE | REJECT | REQUEST_CLARIFICATION",
  evaluatedAt: timestamp
}
```

## 🎯 Key Features to Demonstrate

1. **AI Document Analysis**: Upload a bid document and watch Gemini API extract key information
2. **Compliance Checking**: See automated verification against tender requirements
3. **Real-time Updates**: Multiple users can see live updates
4. **Role-based Access**: Different interfaces for different user types
5. **Bid Comparison**: AI-powered comparative analysis of multiple bids

## 🚧 Future Enhancements

- [ ] Cloud Functions for backend document processing
- [ ] Advanced evaluation workflows
- [ ] Email notifications
- [ ] Audit trail and logging
- [ ] Export reports as PDF
- [ ] Advanced search and filters
- [ ] Mobile responsive improvements
- [ ] Multi-language support

## 📝 Testing the Application

### Create Test Accounts

1. Register as a Vendor (provide company details)
2. Register as a Procurement Officer
3. Register as an Evaluator

### Test Flow

1. **Procurement Officer**: Create a tender
2. **Vendor**: Submit a bid with documents
3. **System**: Automatic AI analysis
4. **Evaluator**: Review and score bids
5. **All Roles**: View real-time updates

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `.env` file has correct credentials
- Check Firebase project settings
- Ensure services are enabled in Firebase Console

### AI Analysis Not Working
- Verify Gemini API key is valid
- Check browser console for errors
- Ensure API quota is not exceeded

### Upload Failures
- Check Firebase Storage rules
- Verify file size limits
- Ensure allowed file types are correct

## 📄 License

MIT License - Feel free to use this for your hackathon!

## 🤝 Contributing

This is a hackathon project. Feel free to fork and enhance!

## 📧 Support

For issues or questions, check:
- Firebase Documentation: https://firebase.google.com/docs
- Gemini API Documentation: https://ai.google.dev/docs
- React Router Documentation: https://reactrouter.com

---

**Built with ❤️ for Hackathons**
