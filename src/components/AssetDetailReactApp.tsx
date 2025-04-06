import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AssetDetailPage from "./pages/AssetDetailPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

interface AssetDetailReactAppProps {
  assetName?: string;
}

export default function AssetDetailReactApp({ assetName }: AssetDetailReactAppProps) {
  // For debugging
  console.log("AssetDetailReactApp received assetName:", assetName);

  // If we don't have an asset name, try to get it from the URL query parameter
  const effectiveAssetName =
    assetName ||
    (() => {
      // Try to get from URL if we're in the browser
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const nameFromUrl = urlParams.get("name");
        console.log("Got asset name from URL:", nameFromUrl);
        return nameFromUrl || "";
      }
      return "";
    })();

  console.log("Effective asset name:", effectiveAssetName);

  // If we still don't have an asset name, show error
  if (!effectiveAssetName) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: No asset name provided.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="asset-detail-app-wrapper">
        <AssetDetailPage assetName={effectiveAssetName} />
      </div>
    </QueryClientProvider>
  );
}
