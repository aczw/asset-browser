import type { AssetWithDetails } from "@/lib/types";
import { useState } from "react";

const AssetPreview = ({ asset }: { asset: AssetWithDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="lg:col-span-7 bg-secondary rounded-lg overflow-hidden h-fit">
      <img
        src={asset.thumbnailUrl}
        alt={asset.name}
        className={`w-full aspect-square object-cover transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

export default AssetPreview;
