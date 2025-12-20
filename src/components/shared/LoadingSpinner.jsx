// Loading Spinner Component - Professional Style
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 border-t-primary-600`}></div>
            {text && <p className="mt-4 text-slate-600 font-medium text-sm animate-pulse">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
