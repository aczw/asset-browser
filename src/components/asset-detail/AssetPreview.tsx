import { useState } from "react";
import LoadingIndicator from "../../components/LoadingIndicator";
import type { AssetWithDetails } from "../../services/api";

interface AssetPreviewProps {
  asset: AssetWithDetails;
}

const AssetPreview = ({ asset }: AssetPreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="lg:col-span-7 bg-secondary rounded-lg overflow-hidden">
      {!imageLoaded && (
        <div className="aspect-video w-full flex items-center justify-center">
          <LoadingIndicator size="lg" />
        </div>
      )}
      <img
        src={asset?.thumbnailUrl}
        alt={asset?.name}
        className={`w-full aspect-video object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

export default AssetPreview;
