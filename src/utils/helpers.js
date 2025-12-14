// Utility helper functions

/**
 * Format a timestamp to a readable date string
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format a timestamp to include time
 */
export const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Check if a file type is allowed
 */
export const isFileTypeAllowed = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

/**
 * Check if file size is within limit
 */
export const isFileSizeValid = (file, maxSize) => {
    return file.size <= maxSize;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Calculate total score from evaluation scores
 */
export const calculateTotalScore = (scores, criteria) => {
    let total = 0;
    criteria.forEach(criterion => {
        const score = scores[criterion.name] || 0;
        total += score;
    });
    return total;
};

/**
 * Calculate weighted score
 */
export const calculateWeightedScore = (scores, criteria) => {
    let totalWeight = 0;
    let weightedSum = 0;

    criteria.forEach(criterion => {
        const score = scores[criterion.name] || 0;
        const weight = criterion.weight || 0;
        weightedSum += (score / criterion.weight) * weight;
        totalWeight += weight;
    });

    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
};

/**
 * Check if deadline has passed
 */
export const isDeadlinePassed = (deadline) => {
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    return deadlineDate < new Date();
};

/**
 * Get days until deadline
 */
export const getDaysUntilDeadline = (deadline) => {
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Generate a random color for avatars
 */
export const getRandomColor = () => {
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-yellow-500',
        'bg-red-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Sort array of objects by property
 */
export const sortByProperty = (array, property, ascending = true) => {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (ascending) {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
