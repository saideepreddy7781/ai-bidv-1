// Custom hook for Firestore operations
import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from Firestore
 * @param {Function} fetchFunction - Function that fetches data
 * @param {Array} dependencies - Dependencies for useEffect
 */
export const useFirestore = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            console.error('Firestore fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, dependencies);

    return { data, loading, error, refetch };
};

/**
 * Custom hook for Firestore real-time subscriptions
 * @param {Function} subscribeFunction - Function that sets up subscription
 * @param {Array} dependencies - Dependencies for useEffect
 */
export const useFirestoreSubscription = (subscribeFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const unsubscribe = subscribeFunction((result) => {
            setData(result);
            setLoading(false);
        }, (err) => {
            console.error('Firestore subscription error:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, dependencies);

    return { data, loading, error };
};

export default useFirestore;
