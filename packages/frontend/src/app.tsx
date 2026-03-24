import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Taxonomy } from "./taxonomy";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Taxonomy />
    </QueryClientProvider>
  );
}
