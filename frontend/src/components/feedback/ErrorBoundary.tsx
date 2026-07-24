import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EduCore Uncaught Exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                System Interface Recovery
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                An unexpected component error occurred. The system isolated the fault to preserve application data integrity.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left font-mono text-[11px] text-rose-400 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
