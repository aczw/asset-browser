import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { GetUserBody } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface UserPageProps {
  pennKey: string;
  data: GetUserBody;
  error: any;
}

const UserPage = ({ pennKey, data, error }: UserPageProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"commits" | "created" | "checkedOut">("commits");

  const handleBack = () => {
    window.location.href = "/";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto py-14 px-4 max-w-7xl">
        <Header />

        <div className="text-center flex flex-col items-center justify-center h-full min-h-[calc(100svh-156px)]">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested user "{pennKey}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-14 space-y-6">
      <Header />

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{data.user.fullName}</h1>
            <p className="text-muted-foreground">@{data.user.pennKey}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-6 items-center mb-8">
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "commits"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("commits")}
            >
              Recent Commits
            </button>
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "created"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("created")}
            >
              Assets Created
            </button>
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "checkedOut"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("checkedOut")}
            >
              Checked Out Assets
            </button>
          </div>

          {/* Tab Content */}
          {selectedTab === "commits" && (
            <div className="space-y-6">
              {data.user.recentCommits.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No commits found for this user.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.recentCommits.map((commit) => (
                    <a
                      href={`/asset/${commit.assetName}`}
                      key={`${commit.assetName}-${commit.version}`}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors block"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{commit.assetName}</h3>
                            <span className="text-sm text-muted-foreground">v{commit.version}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(commit.timestamp)}
                          </p>
                          <p className="text-sm">{commit.note}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === "created" && (
            <div className="space-y-6">
              {data.user.assetsCreated.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No assets created by this user.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.assetsCreated.map((asset, index) => (
                    <a
                      href={`/asset/${asset.name}`}
                      key={`${asset.name}-${index}`}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors block"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{asset.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Created: {formatDate(asset.createdAt)}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === "checkedOut" && (
            <div className="space-y-6">
              {data.user.checkedOutAssets.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    No assets currently checked out by this user.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.checkedOutAssets.map((asset, index) => (
                    <a
                      href={`/asset/${asset.name}`}
                      key={`${asset.name}-${index}`}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors block"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{asset.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Checked Out: {formatDate(asset.checkedOutAt)}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
