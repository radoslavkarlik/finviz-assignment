import { ErrorBoundary } from "#components/error-boundary";
import { Taxonomy } from "#modules/taxonomy/taxonomy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Taxonomy />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
