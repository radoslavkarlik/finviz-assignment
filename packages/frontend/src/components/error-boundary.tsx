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
      <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-lg rounded-lg border bg-background p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-lg font-bold text-destructive">
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
                <summary className="cursor-pointer text-xs text-muted-foreground select-none hover:text-foreground">
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted px-4 py-3 text-xs break-all whitespace-pre-wrap text-muted-foreground">
                  {error.stack}
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
