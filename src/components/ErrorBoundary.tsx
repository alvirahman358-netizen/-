import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Storefront boundary caught error:', error, info);
  }

  handleRecover = () => {
    try {
      window.localStorage.removeItem('amar_dokan_config_v1');
      window.localStorage.removeItem('amar_dokan_cart_v1');
    } catch {
      // Ignore storage errors
    }
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-stone-200 p-8 text-center space-y-4">
            <h1 className="text-xl font-bold text-zinc-900">
              পৃষ্ঠাটি লোড করতে সাময়িক সমস্যা হয়েছে
            </h1>
            <p className="text-sm text-stone-600">
              অনুগ্রহ করে নিচের বাটনে ক্লিক করে দোকানটি আবার চালু করুন।
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg cursor-pointer"
            >
              পুনরায় লোড করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
