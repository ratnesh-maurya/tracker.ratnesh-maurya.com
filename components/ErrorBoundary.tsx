'use client';

import React from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="mx-auto flex min-h-screen w-[min(720px,100%-32px)] flex-col justify-center py-16">
                    <p className="eyebrow">Error</p>
                    <h1 className="display mt-4 text-[clamp(46px,7.4vw,88px)]">
                        Something <em>broke</em>
                    </h1>
                    <p className="mt-5 max-w-lede text-[17px] text-muted-foreground">
                        Nothing you saved is lost; saved entries live on the server or in this device’s queue. Reloading usually sorts it.
                    </p>
                    <pre className="mt-6 overflow-x-auto rounded-inner border border-border bg-muted px-5 py-4 font-mono text-[13px] leading-[1.65] text-muted-foreground">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </pre>
                    <div className="mt-8">
                        <Button
                            size="lg"
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined });
                                window.location.reload();
                            }}
                        >
                            Reload →
                        </Button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

