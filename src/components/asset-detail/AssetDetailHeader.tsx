import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

interface AssetDetailHeaderProps {
  title: string;
}

const AssetDetailHeader = ({ title }: AssetDetailHeaderProps) => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="mb-6 text-left">
      <Button
        variant="ghost"
        className="flex items-center gap-1 mb-4 hover:bg-secondary/80 transition-all"
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assets
      </Button>

      <h1 className="text-3xl font-bold animate-fade-in text-left">{title}</h1>
    </div>
  );
};

export default AssetDetailHeader;
