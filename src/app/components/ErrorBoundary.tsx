"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset?: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div style={{ 
      padding: "20px", 
      textAlign: "center", 
      background: "#fef2f2", 
      border: "1px solid #fecaca", 
      borderRadius: "8px",
      margin: "20px"
    }}>
      <h2 style={{ color: "#dc2626", marginBottom: "10px" }}>Something went wrong</h2>
      <p style={{ color: "#7f1d1d", marginBottom: "15px" }}>
        {error?.message || "An unexpected error occurred"}
      </p>
      {reset && (
        <button 
          onClick={reset}
          style={{
            padding: "8px 16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
