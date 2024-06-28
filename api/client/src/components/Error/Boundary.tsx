import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return {
            hasError: true
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) { 
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return <h1>Error Happened</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
