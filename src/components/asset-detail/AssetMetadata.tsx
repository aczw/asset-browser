import type { AssetWithDetails } from "@/lib/types";
import { GitCommit, Info, Lock, Tag, User } from "lucide-react";
import { Badge } from "../../components/ui/badge";

interface AssetMetadataProps {
  asset: AssetWithDetails;
  hideTitle?: boolean;
}

const AssetMetadata = ({ asset, hideTitle = false }: AssetMetadataProps) => {
  return (
    <div className="space-y-4 text-left">
      {!hideTitle && <h3 className="text-lg font-medium text-left">{asset?.name}</h3>}

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-left">
            <div className="text-sm font-medium">Creator</div>
            <div className="text-sm text-muted-foreground">{asset?.creator}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-left">
            <div className="text-sm font-medium">Last Modified</div>
            <div className="text-sm text-muted-foreground">{asset?.lastModifiedBy}</div>
            <div className="text-sm text-muted-foreground">
              {asset?.updatedAt
                ? new Date(
                    // If the date ends with +HH or -HH (two digits, no :00), append :00
                    asset.updatedAt.replace(/([+-]\d{2})$/, "$1:00")
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        </div>

        {asset?.isCheckedOut && asset.checkedOutBy && (
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Checked Out By</div>
              <div className="text-sm text-muted-foreground">{asset.checkedOutBy}</div>
            </div>
          </div>
        )}

        {asset?.keywords && asset.keywords.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Keywords</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {asset.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-left">
            <div className="text-sm font-medium">Materials Available</div>
            <div className="text-sm text-muted-foreground">{asset?.materials ? "Yes" : "No"}</div>
          </div>
        </div>

        {asset?.description && (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-muted-foreground">{asset.description}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetMetadata;
