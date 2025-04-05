import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import type { AssetWithDetails } from "../../services/api";

interface AstroAssetDetailHeaderProps {
  asset: AssetWithDetails;
  onBack: () => void;
}

const AstroAssetDetailHeader = ({ asset, onBack }: AstroAssetDetailHeaderProps) => {
  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-1 mb-4 hover:bg-secondary/80 transition-all"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assets
      </Button>
      <h1 className="text-3xl font-bold">{asset.name}</h1>
    </div>
  );
};

export default AstroAssetDetailHeader;
