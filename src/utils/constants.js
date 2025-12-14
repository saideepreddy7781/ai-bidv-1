// Application constants

// User Roles
export const USER_ROLES = {
    VENDOR: 'VENDOR',
    PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
    EVALUATOR: 'EVALUATOR',
    ADMIN: 'ADMIN'
};

// Bid Status
export const BID_STATUS = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    EVALUATED: 'EVALUATED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

// Tender Status
export const TENDER_STATUS = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    EVALUATING: 'EVALUATING',
    COMPLETED: 'COMPLETED'
};

// Evaluation Recommendations
export const EVALUATION_RECOMMENDATIONS = {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    REQUEST_CLARIFICATION: 'REQUEST_CLARIFICATION'
};

// File Upload Settings
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // Convert to bytes
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Default Evaluation Criteria Template
export const DEFAULT_EVALUATION_CRITERIA = [
    {
        name: 'Technical Capability',
        weight: 40,
        description: 'Evaluation of technical expertise and proposed solution'
    },
    {
        name: 'Financial Proposal',
        weight: 30,
        description: 'Cost-effectiveness and budget alignment'
    },
    {
        name: 'Experience & Track Record',
        weight: 20,
        description: 'Past performance and relevant experience'
    },
    {
        name: 'Compliance',
        weight: 10,
        description: 'Meeting all tender requirements and regulations'
    }
];

// Firestore Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    TENDERS: 'tenders',
    BIDS: 'bids',
    EVALUATIONS: 'evaluations'
};

// Route Paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VENDOR_DASHBOARD: '/vendor/dashboard',
    VENDOR_TENDERS: '/vendor/tenders',
    VENDOR_SUBMIT_BID: '/vendor/submit-bid/:tenderId',
    VENDOR_MY_BIDS: '/vendor/my-bids',
    PROCUREMENT_DASHBOARD: '/procurement/dashboard',
    PROCUREMENT_TENDERS: '/procurement/tenders',
    PROCUREMENT_CREATE_TENDER: '/procurement/create-tender',
    EVALUATOR_DASHBOARD: '/evaluator/dashboard',
    EVALUATOR_EVALUATE: '/evaluator/evaluate/:tenderId',
    EVALUATOR_COMPARISON: '/evaluator/comparison/:tenderId',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_TENDERS: '/admin/tenders'
};
