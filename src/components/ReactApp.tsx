import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import AssetsPage from "./pages/AssetsPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function ReactApp() {
  useEffect(() => {
    console.log("ReactApp mounted");
    console.log("QueryClient:", queryClient);

    // Check if the window object is available (client-side only)
    if (typeof window !== "undefined") {
      console.log("Window object is available");

      // Add ReactApp to window for debugging
      (window as unknown as { ReactApp: { queryClient: QueryClient; version: string } }).ReactApp =
        {
          queryClient,
          version: "1.0.0",
        };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="react-app-wrapper">
        <AssetsPage />
      </div>
    </QueryClientProvider>
  );
}
