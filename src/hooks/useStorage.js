// Custom hook for Firebase Storage file uploads
import { useState } from 'react';
import { uploadFile } from '../services/firebaseService';

/**
 * Custom hook for file uploads to Firebase Storage
 */
export const useStorage = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [downloadURL, setDownloadURL] = useState(null);

    const upload = async (file, path) => {
        try {
            setUploading(true);
            setError(null);
            setProgress(0);

            const url = await uploadFile(file, path, (progressValue) => {
                setProgress(progressValue);
            });

            setDownloadURL(url);
            return url;
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setUploading(false);
        setProgress(0);
        setError(null);
        setDownloadURL(null);
    };

    return {
        upload,
        uploading,
        progress,
        error,
        downloadURL,
        reset
    };
};

export default useStorage;
