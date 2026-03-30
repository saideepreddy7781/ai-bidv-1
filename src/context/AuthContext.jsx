// Authentication Context Provider
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
    registerUser as registerService,
    loginUser as loginService,
    loginWithGoogle as googleLoginService,
    logoutUser as logoutService,
    getUserProfile
} from '../services/firebaseService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch user profile from Firestore
                try {
                    const profile = await getUserProfile(firebaseUser.uid);
                    if (profile) {
                        setUserProfile(profile);
                        setError(null);
                    } else {
                        // Avoid indefinite loading states in protected routes
                        setUserProfile(null);
                        setError('User profile not found. Please register again or seed demo users.');
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError(err.message);
                }
            } else {
                setUser(null);
                setUserProfile(null);
                setError(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = async (email, password, userData) => {
        try {
            setError(null);
            const user = await registerService(email, password, userData);
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const user = await loginService(email, password);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const loginWithGoogle = async () => {
        try {
            setError(null);
            const user = await googleLoginService();
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await logoutService();
            setUser(null);
            setUserProfile(null);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        hasRole: (role) => userProfile?.role === role,
        isVendor: userProfile?.role === 'VENDOR',
        isProcurementOfficer: userProfile?.role === 'PROCUREMENT_OFFICER',
        isEvaluator: userProfile?.role === 'EVALUATOR',
        isAdmin: userProfile?.role === 'ADMIN'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
