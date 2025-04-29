import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { AssetWithDetails } from "@/lib/types";
import { type Metadata } from "@/lib/types";
import { getAccessToken } from "@/utils/utils";
import { actions } from "astro:actions";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import AssetDetailSkeleton from "../asset-detail/AssetDetailSkeleton";
import AssetInfoFlow from "../asset-detail/AssetInfoFlow";
import AssetPreview from "../asset-detail/AssetPreview";

interface AssetDetailPageProps {
  assetName: string;
}

const AssetDetailPage = ({ assetName }: AssetDetailPageProps) => {
  const { toast } = useToast();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [asset, setAsset] = useState<AssetWithDetails | null>(null);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ pennId: string; fullName: string }>({
    pennId: "anonymous",
    fullName: "Anonymous",
  });

  // Terrible hack! :D
  const [firstThumbnailFetch, setFirstThumbnailFetch] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const getSelf = async () => {
      let token = await getAccessToken();
      if (token.success) {
        let accessToken = token.accessToken;
        let response = await actions.getMe({ accessToken });

        setUser({
          pennId: response.data!.pennkey,
          fullName: response.data!.firstName + " " + response.data!.lastName,
        });
      }
    };

    getSelf();
  }, []);

  const handleUserFilesChange = (newFiles: File[]) => {
    console.log("User files changed:", newFiles);
    setUserFiles(newFiles);
  };

  const fetchAsset = async () => {
    if (!assetName) {
      console.error("Cannot fetch asset: No assetName provided");
      setIsLoading(false);
      return;
    }

    console.log("Fetching asset with name:", assetName);
    setIsLoading(true);

    const { data, error } = await actions.getAsset({ assetName });

    if (error) {
      console.error("Error fetching asset:", error);

      toast({
        title: "Error",
        description: "Failed to load asset details. Please try again.",
        variant: "destructive",
      });
    } else {
      console.log("API response:", data);
      setAsset(data.asset);

      if (firstThumbnailFetch) {
        setThumbnailUrl(data.asset.thumbnailUrl);
        setFirstThumbnailFetch(false);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    console.log("AssetDetailPage - Asset name changed:", assetName);
    console.log("AssetDetailPage - Asset name type:", typeof assetName);

    if (!assetName) {
      console.error("AssetDetailPage - No assetName provided");
      return;
    }
    fetchAsset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetName]);

  const handleCheckout = async () => {
    if (!assetName || !user || !asset) return;

    setIsCheckingOut(true);

    let token = await getAccessToken();
    if (!token.success) {
      console.error("Error checking out asset:", "No authentication.");
      toast({
        title: "Checkout Error",
        description: `You must be logged in to check out asset "${assetName}".`,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login/";
      }, 1500);
      return;
    }

    let accessToken = token.accessToken;

    const { data, error } = await actions.checkoutAsset({
      assetName,
      pennKey: user.pennId,
      accessToken: accessToken,
    });

    if (error) {
      console.error("Error checking out asset:", error.message);
      toast({
        title: "Checkout Error",
        description: `Failed to check out asset "${assetName}". Please try again.`,
        variant: "destructive",
      });
    } else {
      const { asset: updatedAsset, downloadUrl } = data;

      console.log("updated asset:", updatedAsset);

      setAsset(updatedAsset);
      toast({
        title: "Asset Checked Out",
        description: `You have successfully checked out ${asset.name}.`,
      });

      // Automatically download the asset
      if (downloadUrl) {
        console.log(`Downloading asset from ${downloadUrl}`);

        try {
          // Make a fetch request to download the asset
          const apiUrl = "http://localhost:5000";
          const downloadResponse = await fetch(`${apiUrl}${downloadUrl}`);

          if (!downloadResponse.ok) {
            throw new Error("Failed to download asset");
          }

          // Get the blob from the response
          const blob = await downloadResponse.blob();

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link and click it to download the file
          const link = document.createElement("a");
          link.href = url;
          link.download = `${asset.name}.zip`;
          document.body.appendChild(link);
          link.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        } catch (downloadError) {
          console.error("Error downloading asset:", downloadError);
          toast({
            title: "Download Error",
            description: "Failed to download the asset. Please try again.",
            variant: "destructive",
          });
        }
      }
    }

    setIsCheckingOut(false);
  };

  const handleCheckIn = async (checkInData?: {
    note: string;
    version: string;
    hasTexture: boolean;
    keywords: string;
  }) => {
    console.log("It's time to check in.");

    let token = await getAccessToken();
    if (!token.success) {
      console.error("Error checking in asset:", "No authentication.");
      toast({
        title: "Checkin Error",
        description: `You must be logged in to check in asset "${assetName}".`,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login/";
      }, 1500);
      return;
    }

    let accessToken = token.accessToken;

    if (!assetName || !user || !asset || userFiles.length === 0 || !checkInData) {
      return;
    }

    console.log("Preparing check-in data");
    console.log("Files:", userFiles);
    console.log("keywords:", checkInData.keywords);

    const formData = new FormData();
    formData.append("file", userFiles[0]);
    formData.append("note", checkInData.note);
    formData.append("version", checkInData.version);
    formData.append("hasTexture", checkInData.hasTexture.toString());
    formData.append("pennKey", user.pennId);

    // Pass the keywords string directly without any further processing
    formData.append("keywordsRawList", checkInData.keywords);

    formData.append("assetName", assetName);

    formData.append("accessToken", accessToken);

    const { data, error } = await actions.checkinAsset(formData);

    if (error) {
      console.error("Error checking in asset:", error.message);
      toast({
        title: "Check-in Error",
        description: `Failed to check in the asset. Please try again. Error message: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setAsset(data.asset);
      toast({
        title: "Asset Checked In",
        description: `You have successfully checked in ${asset.name}.`,
        variant: "default",
      });
    }
  };

  const handleDownload = async (version?: string) => {
    console.log("[DEBUG] handleDownload called with assetName:", assetName, "version:", version);

    if (!assetName) {
      console.log("[DEBUG] No assetName provided, returning early");
      return;
    }

    setIsDownloading(true);

    console.log("[DEBUG] Calling downloadAsset");
    const { data, error } = await actions.downloadAsset({ assetName, version });

    if (error) {
      console.error("[DEBUG] Error in handleDownload:", error.message);

      toast({
        title: "Download Error",
        description: "Failed to download the asset. Please try again.",
        variant: "destructive",
      });
    } else {
      // Convert array buffer to blob for easier usage
      const blob = new Blob([data], { type: "application/zip" });

      // Get the blob from the response
      console.log("[DEBUG] Received blob of size:", blob.size);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      console.log("[DEBUG] Created blob URL");

      // Create a link and click it to download the file
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assetName}${version ? `_${version}` : ""}.zip`;
      document.body.appendChild(link);
      link.click();
      console.log("[DEBUG] Triggered download");

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      console.log("[DEBUG] Cleaned up resources");
    }

    setIsDownloading(false);
  };

  const handleLaunchDCC = async () => {
    console.log("It's time to launch Houdini.");

    console.log("[DEBUG] API: launchDCC called");

    const { data, error } = await actions.launchDCC({ assetName });

    return { message: "Application launched successfully" };
  };

  if (isLoading) {
    return <AssetDetailSkeleton />;
  }

  if (!asset) {
    return (
      <div className="container mx-auto py-14 px-4 max-w-7xl">
        <Header />

        <div className="text-center flex flex-col items-center justify-center h-full min-h-[calc(100svh-156px)]">
          <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested asset "{assetName}" could not be found.
          </p>
        </div>
      </div>
    );
  }
  console.log(asset.checkedOutBy === user.pennId);
  console.log(asset.checkedOutBy);
  console.log(user.pennId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-14 space-y-6">
      <Header />

      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold animate-fade-in text-left">{asset.name}</h1>
            {asset?.isCheckedOut && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Checked Out
              </Badge>
            )}
          </div>

          <AssetInfoFlow
            asset={asset}
            canCheckout={!asset.isCheckedOut && !!user}
            canCheckin={asset.isCheckedOut && !!user && asset.checkedOutBy === user.pennId}
            onCheckout={handleCheckout}
            onCheckin={handleCheckIn}
            onDownload={handleDownload}
            onFilesChange={handleUserFilesChange}
            onLaunchDCC={handleLaunchDCC}
            isDownloading={isDownloading}
            isCheckingOut={isCheckingOut}
          />
          <Separator />
        </div>

        <div className="flex justify-center lg:block mt-4 lg:mt-0">
          <div className="w-[80vh] h-[80vh] bg-secondary rounded-xl overflow-hidden relative">
            <AssetPreview asset={asset} thumbnailUrl={thumbnailUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
