import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertOctagon size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">حدث خطأ غير متوقع</h1>
          <p className="text-gray-500 text-sm mb-8">نعتذر عن هذا الخلل. حاول تحديث الصفحة.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="h-12 px-8 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg"
          >
            تحديث الصفحة <RefreshCw size={18} />
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
