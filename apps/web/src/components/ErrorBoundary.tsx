import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
          <div className="bg-bg-secondary border border-border rounded p-8 max-w-lg w-full">
            <h1 className="font-display text-lg font-bold text-accent-red uppercase tracking-wider mb-4">
              Something went wrong
            </h1>
            <p className="text-sm text-text-secondary mb-4">
              An unexpected error occurred. Details below:
            </p>
            <pre className="bg-bg-primary border border-border rounded p-3 text-xs text-accent-amber font-display overflow-auto mb-6">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={this.handleRetry}
              className="bg-accent-cyan text-bg-primary font-display font-medium text-sm px-4 py-2 rounded border border-accent-cyan hover:bg-accent-cyan/90 transition-colors"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
