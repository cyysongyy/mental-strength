import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("Page render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-4xl">⚠️</p>
        <p className="text-slate-600 dark:text-slate-300">這個頁面發生錯誤</p>
        <p className="text-xs text-slate-400 break-all px-4">{error.message}</p>
        <button
          onClick={() => this.setState({ error: null })}
          className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm"
        >
          重試
        </button>
      </div>
    );
  }
}
