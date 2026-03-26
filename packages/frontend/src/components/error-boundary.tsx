import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { readonly children: ReactNode };
type State = { readonly error?: Error; readonly errorInfo?: ErrorInfo };

export class ErrorBoundary extends Component<Props, State> {
  state: State = {};

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
  }

  render() {
    const { error, errorInfo } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-background border rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive text-lg font-bold shrink-0">
              !
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">An unexpected error occurred</p>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <p className="text-sm font-medium text-destructive">{error.message}</p>
            {errorInfo?.componentStack && (
              <details className="group">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none">
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted px-4 py-3 text-xs text-muted-foreground whitespace-pre-wrap break-all">
                  {error.stack}
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
