import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Lock, LockOpen, Download, PlayCircle } from "lucide-react";
import type { AssetWithDetails } from "../../services/api";

interface AstroAssetControlPanelProps {
  asset: AssetWithDetails;
  user: { pennId: string; fullName: string };
  onCheckout: () => Promise<void>;
  onCheckin: () => Promise<void>;
}

const AstroAssetControlPanel = ({
  asset,
  user,
  onCheckout,
  onCheckin
}: AstroAssetControlPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const canCheckout = !asset.isCheckedOut;
  const canCheckin = asset.isCheckedOut && asset.checkedOutBy === user.pennId;
  
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async () => {
    setIsLoading(true);
    try {
      await onCheckin();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Asset Control</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {asset.isCheckedOut ? (
              <Badge variant="outline" className="gap-1 py-1.5">
                <Lock className="h-3 w-3" />
                Checked Out
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 py-1.5 border-green-500 text-green-500">
                <LockOpen className="h-3 w-3" />
                Available
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="flex items-center gap-2" 
            onClick={handleCheckout}
            disabled={!canCheckout || isLoading}
          >
            <LockOpen className="h-4 w-4" />
            Check Out
          </Button>
          
          <Button 
            className="flex items-center gap-2" 
            onClick={handleCheckin}
            disabled={!canCheckin || isLoading}
          >
            <Lock className="h-4 w-4" />
            Check In
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 col-span-2"
            onClick={() => window.open(`/api/assets/${asset.name}/download`, '_blank')}
          >
            <Download className="h-4 w-4" />
            Download Copy
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 col-span-2"
            onClick={() => window.open(`/asset-preview?name=${encodeURIComponent(asset.name)}`, '_blank')}
          >
            <PlayCircle className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AstroAssetControlPanel;
