const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-dark-sidebar z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );
};

export default LoadingScreen;
