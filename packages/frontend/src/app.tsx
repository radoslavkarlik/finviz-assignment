import { Taxonomy } from "#taxonomy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Taxonomy />
    </QueryClientProvider>
  );
}
