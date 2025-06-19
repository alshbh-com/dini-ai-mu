
const LoadingSpinner = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-900 border-t-transparent"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-amber-300" style={{ animationDelay: '0.1s' }}></div>
      </div>
      <span className="font-medium">جاري البحث...</span>
    </div>
  );
};

export default LoadingSpinner;
