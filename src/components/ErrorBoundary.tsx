import { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-red-200 rounded-xl shadow-sm max-w-md mx-auto my-12 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-650 text-xl font-bold mx-auto">
            ⚠
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Failed to Load Component
          </h3>
          <p className="text-xs text-slate-500">
            We encountered an issue loading this simulation. This can happen due to a temporary network issue or a new update.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
