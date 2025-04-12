import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

const AssetDetailSkeleton = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" className="flex items-center gap-1 mb-4" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4" />
          Back to Assets
        </Button>

        <Skeleton className="h-8 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-secondary rounded-lg overflow-hidden">
          <Skeleton className="aspect-square w-full" />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />

            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>

          <Skeleton className="h-[1px] w-full" />

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailSkeleton;
