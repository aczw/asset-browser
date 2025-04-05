import { Badge } from "../ui/badge";
import { User, Calendar, Tag, Info, Lock, GitCommit } from "lucide-react";
import type { AssetWithDetails } from "../../services/api";

interface AstroAssetMetadataProps {
  asset: AssetWithDetails;
  checkedOutByName: string | null;
  hideTitle?: boolean;
}

const AstroAssetMetadata = ({ asset, checkedOutByName, hideTitle = false }: AstroAssetMetadataProps) => {
  return (
    <div className="space-y-4">
      {!hideTitle && <h3 className="text-lg font-medium">{asset?.name}</h3>}
      
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Keywords</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {asset?.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Creator</div>
            <div className="text-sm text-muted-foreground">{asset?.creator}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Last Modified By</div>
            <div className="text-sm text-muted-foreground">{asset?.lastModifiedBy}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Created</div>
            <div className="text-sm text-muted-foreground">
              {new Date(asset?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Last Modified</div>
            <div className="text-sm text-muted-foreground">
              {new Date(asset?.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Version</div>
            <div className="text-sm text-muted-foreground">{asset?.version}</div>
          </div>
        </div>
        
        {asset.isCheckedOut && (
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Checked Out By</div>
              <div className="text-sm text-muted-foreground">{checkedOutByName || 'Unknown User'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstroAssetMetadata;
