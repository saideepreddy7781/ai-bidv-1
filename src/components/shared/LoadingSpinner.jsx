// Loading Spinner Component - Neobrutalism Style
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-12 w-12 border-4',
        md: 'h-20 w-20 border-8',
        lg: 'h-28 w-28 border-8'
    };

    return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className={`${sizeClasses[size]} border-black border-t-google-blue border-r-google-red border-b-google-yellow border-l-google-green animate-spin`}></div>
            {text && <p className="mt-6 text-black font-black text-xl uppercase">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
