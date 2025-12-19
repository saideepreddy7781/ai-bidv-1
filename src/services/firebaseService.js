// Firebase Service Layer for Firestore operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

import { auth, db, storage, googleProvider } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

// ==================== Authentication Services ====================

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
            uid: user.uid,
            email: user.email,
            ...userData,
            createdAt: serverTimestamp()
        });

        return user;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists, if not create one
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'VENDOR', // Default role
                createdAt: serverTimestamp()
            });
        }

        return user;
    } catch (error) {
        console.error('Error with Google login:', error);
        throw error;
    }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

/**
 * Get current user profile from Firestore
 */
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
    try {
        await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// ==================== Tender Services ====================

/**
 * Create a new tender
 */
export const createTender = async (tenderData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.TENDERS), {
            ...tenderData,
            createdAt: serverTimestamp(),
            status: 'OPEN'
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating tender:', error);
        throw error;
    }
};

/**
 * Get all tenders
 */
export const getAllTenders = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.TENDERS), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting tenders:', error);
        throw error;
    }
};

/**
 * Get active (open) tenders
 */
export const getActiveTenders = async () => {
    try {
        const q = query(
            collection(db, COLLECTIONS.TENDERS),
            where('status', '==', 'OPEN')
        );
        const querySnapshot = await getDocs(q);
        const tenders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side by deadline to avoid needing a composite index
        return tenders.sort((a, b) => {
            const aTime = a.deadline?.seconds || 0;
            const bTime = b.deadline?.seconds || 0;
            return aTime - bTime; // asc order
        });
    } catch (error) {
        console.error('Error getting active tenders:', error);
        throw error;
    }
};

/**
 * Get tender by ID
 */
export const getTenderById = async (tenderId) => {
    try {
        const tenderDoc = await getDoc(doc(db, COLLECTIONS.TENDERS, tenderId));
        if (tenderDoc.exists()) {
            return { id: tenderDoc.id, ...tenderDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting tender:', error);
        throw error;
    }
};

/**
 * Update tender
 */
export const updateTender = async (tenderId, updates) => {
    try {
        await updateDoc(doc(db, COLLECTIONS.TENDERS, tenderId), updates);
    } catch (error) {
        console.error('Error updating tender:', error);
        throw error;
    }
};

/**
 * Delete tender
 */
export const deleteTender = async (tenderId) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.TENDERS, tenderId));
    } catch (error) {
        console.error('Error deleting tender:', error);
        throw error;
    }
};

// ==================== Bid Services ====================

/**
 * Submit a bid
 */
export const submitBid = async (bidData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.BIDS), {
            ...bidData,
            submittedAt: serverTimestamp(),
            status: 'SUBMITTED'
        });
        return docRef.id;
    } catch (error) {
        console.error('Error submitting bid:', error);
        throw error;
    }
};

/**
 * Get bids for a specific tender
 */
export const getBidsByTender = async (tenderId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.BIDS),
            where('tenderId', '==', tenderId)
        );
        const querySnapshot = await getDocs(q);
        const bids = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid needing a composite index
        return bids.sort((a, b) => {
            const aTime = a.submittedAt?.seconds || 0;
            const bTime = b.submittedAt?.seconds || 0;
            return bTime - aTime; // desc order
        });
    } catch (error) {
        console.error('Error getting bids:', error);
        throw error;
    }
};

/**
 * Get bids by vendor
 */
export const getBidsByVendor = async (vendorId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.BIDS),
            where('vendorId', '==', vendorId)
        );
        const querySnapshot = await getDocs(q);
        const bids = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid needing a composite index
        return bids.sort((a, b) => {
            const aTime = a.submittedAt?.seconds || 0;
            const bTime = b.submittedAt?.seconds || 0;
            return bTime - aTime; // desc order
        });
    } catch (error) {
        console.error('Error getting vendor bids:', error);
        throw error;
    }
};

/**
 * Get bid by ID
 */
export const getBidById = async (bidId) => {
    try {
        const bidDoc = await getDoc(doc(db, COLLECTIONS.BIDS, bidId));
        if (bidDoc.exists()) {
            return { id: bidDoc.id, ...bidDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting bid:', error);
        throw error;
    }
};

/**
 * Update bid
 */
export const updateBid = async (bidId, updates) => {
    try {
        await updateDoc(doc(db, COLLECTIONS.BIDS, bidId), updates);
    } catch (error) {
        console.error('Error updating bid:', error);
        throw error;
    }
};

// ==================== Evaluation Services ====================

/**
 * Create evaluation
 */
export const createEvaluation = async (evaluationData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.EVALUATIONS), {
            ...evaluationData,
            evaluatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating evaluation:', error);
        throw error;
    }
};

/**
 * Get evaluations for a bid
 */
export const getEvaluationsByBid = async (bidId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.EVALUATIONS),
            where('bidId', '==', bidId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting evaluations:', error);
        throw error;
    }
};

/**
 * Get evaluations for a tender
 */
export const getEvaluationsByTender = async (tenderId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.EVALUATIONS),
            where('tenderId', '==', tenderId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting tender evaluations:', error);
        throw error;
    }
};

/**
 * Update evaluation
 */
export const updateEvaluation = async (evaluationId, updates) => {
    try {
        await updateDoc(doc(db, COLLECTIONS.EVALUATIONS, evaluationId), updates);
    } catch (error) {
        console.error('Error updating evaluation:', error);
        throw error;
    }
};

/**
 * Accept a bid - simplified evaluation
 * Updates bid status to APPROVED and closes the tender
 */
export const acceptBid = async (bidId, tenderId, evaluatorId, evaluatorName, comments) => {
    try {
        // Update bid status to APPROVED
        await updateDoc(doc(db, COLLECTIONS.BIDS, bidId), {
            status: 'APPROVED',
            evaluatedAt: serverTimestamp(),
            evaluatorId: evaluatorId,
            evaluatorName: evaluatorName,
            evaluationComments: comments
        });

        // Close the tender (mark as COMPLETED)
        await updateDoc(doc(db, COLLECTIONS.TENDERS, tenderId), {
            status: 'COMPLETED',
            winningBidId: bidId,
            completedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error accepting bid:', error);
        throw error;
    }
};

/**
 * Reject a bid - simplified evaluation
 * Updates bid status to REJECTED, tender remains OPEN
 */
export const rejectBid = async (bidId, evaluatorId, evaluatorName, comments) => {
    try {
        // Update bid status to REJECTED
        await updateDoc(doc(db, COLLECTIONS.BIDS, bidId), {
            status: 'REJECTED',
            evaluatedAt: serverTimestamp(),
            evaluatorId: evaluatorId,
            evaluatorName: evaluatorName,
            evaluationComments: comments,
            rejectionReason: comments
        });

        return { success: true };
    } catch (error) {
        console.error('Error rejecting bid:', error);
        throw error;
    }
};

// ==================== Storage Services ====================

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Download URL
 */
export const uploadFile = (file, path, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Delete file from Firebase Storage
 */
export const deleteFile = async (filePath) => {
    try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// ==================== Real-time Listeners ====================

/**
 * Listen to tender changes
 */
export const subscribeTenders = (callback) => {
    const q = query(collection(db, COLLECTIONS.TENDERS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const tenders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tenders);
    });
};

/**
 * Listen to bid changes for a tender
 */
export const subscribeBidsByTender = (tenderId, callback) => {
    const q = query(
        collection(db, COLLECTIONS.BIDS),
        where('tenderId', '==', tenderId),
        orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
        const bids = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(bids);
    });
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (userId, newRole) => {
    try {
        await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
            role: newRole,
            roleUpdatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

/**
 * Get system statistics (Admin only)
 */
export const getSystemStats = async () => {
    try {
        const [users, tenders, bids] = await Promise.all([
            getDocs(collection(db, COLLECTIONS.USERS)),
            getDocs(collection(db, COLLECTIONS.TENDERS)),
            getDocs(collection(db, COLLECTIONS.BIDS))
        ]);

        const usersData = users.docs.map(doc => doc.data());
        const tendersData = tenders.docs.map(doc => doc.data());
        const bidsData = bids.docs.map(doc => doc.data());

        return {
            totalUsers: users.size,
            usersByRole: {
                vendors: usersData.filter(u => u.role === 'VENDOR').length,
                evaluators: usersData.filter(u => u.role === 'EVALUATOR').length,
                procurement: usersData.filter(u => u.role === 'PROCUREMENT_OFFICER').length,
                admins: usersData.filter(u => u.role === 'ADMIN').length
            },
            totalTenders: tenders.size,
            tendersByStatus: {
                open: tendersData.filter(t => t.status === 'OPEN').length,
                completed: tendersData.filter(t => t.status === 'COMPLETED').length,
                evaluating: tendersData.filter(t => t.status === 'EVALUATING').length
            },
            totalBids: bids.size,
            bidsByStatus: {
                submitted: bidsData.filter(b => b.status === 'SUBMITTED').length,
                approved: bidsData.filter(b => b.status === 'APPROVED').length,
                rejected: bidsData.filter(b => b.status === 'REJECTED').length
            }
        };
    } catch (error) {
        console.error('Error getting system stats:', error);
        throw error;
    }
};

export default {
    // Auth
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    // Tenders
    createTender,
    getAllTenders,
    getActiveTenders,
    getTenderById,
    updateTender,
    deleteTender,
    // Bids
    submitBid,
    getBidsByTender,
    getBidsByVendor,
    getBidById,
    updateBid,
    acceptBid,
    rejectBid,
    // Evaluations
    createEvaluation,
    getEvaluationsByBid,
    getEvaluationsByTender,
    updateEvaluation,
    // Storage
    uploadFile,
    deleteFile,
    // Real-time
    subscribeTenders,
    subscribeBidsByTender,
    // Users & Admin
    getAllUsers,
    updateUserRole,
    getSystemStats
};
