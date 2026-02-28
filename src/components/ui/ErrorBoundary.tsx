'use client';

import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CustomizedAI] Unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{ background: 'var(--bg)' }}
        >
          <div
            className="max-w-md w-full rounded-2xl p-8 text-center"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--danger)', opacity: 0.15 }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: 'var(--danger)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--ink)' }}
            >
              Something went wrong
            </h2>

            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: 'var(--ink)', opacity: 0.6 }}
            >
              An unexpected error occurred. You can try again or refresh the
              page.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary
                  className="text-xs cursor-pointer mb-2"
                  style={{ color: 'var(--ink)', opacity: 0.5 }}
                >
                  Error details
                </summary>
                <pre
                  className="text-xs p-3 rounded-lg overflow-auto max-h-32"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    opacity: 0.7,
                    border: '1px solid var(--border)',
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
