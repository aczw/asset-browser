import { Button } from "@/components/ui/button";
import { loadModelViewer } from "@/lib/model-viewer";
import type { AssetWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import * as Portal from "@radix-ui/react-portal";
import { EyeIcon, ImageIcon, MaximizeIcon, MinimizeIcon } from "lucide-react";
import { useRef, useState } from "react";

type ModelViewerState = {
  visible: boolean;
  display: "window" | "fullscreen";
};

const AssetPreview = ({ asset }: { asset: AssetWithDetails }) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [portalOpen, setPortalOpen] = useState(false);
  const [state, setState] = useState<ModelViewerState>({
    visible: false,
    display: "window",
  });

  const windowCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);

  function closeFullscreen() {
    setState({ visible: true, display: "window" });
    setTimeout(() => setPortalOpen(false), 130);
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeFullscreen();
      window.removeEventListener("keydown", handleEscape);
    }
  }

  const portalState = state.display === "fullscreen" ? "open" : "closed";

  return (
    <div className="lg:col-span-7 bg-secondary rounded-xl overflow-hidden h-fit relative">
      <img
        src={asset.thumbnailUrl}
        alt={asset.name}
        loading="eager"
        className={cn("w-full aspect-square object-cover")}
      />

      <canvas
        id="window-model-viewer"
        className={cn(
          "inset-0 bg-red-500 absolute block w-full h-full",
          state.visible ? "" : "hidden"
        )}
        ref={windowCanvasRef}
      />

      <Portal.Root className={cn(portalOpen ? "" : "hidden")}>
        <div
          data-state={portalState}
          className="inset-0 fixed bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <div
          data-state={portalState}
          className="fixed data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 top-1/2 bg-card rounded-2xl overflow-hidden left-1/2 w-full h-full max-h-[calc(100vh-5rem)] max-w-[calc(100vw-5rem)] translate-x-[-50%] translate-y-[-50%] shadow-xl"
        >
          <canvas
            id="fullscreen-model-viewer"
            className="block w-full h-full bg-purple-500"
            ref={fullscreenCanvasRef}
          />

          <Button
            className="top-5 right-5 absolute"
            onClick={() => {
              closeFullscreen();
              window.removeEventListener("keydown", handleEscape);
            }}
          >
            <MinimizeIcon />
            Minimize (Esc)
          </Button>
        </div>
      </Portal.Root>

      <div className="absolute bottom-5 inset-x-0 w-full px-5 flex items-center justify-center">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl gap-3 p-3",
            state.visible ? "bg-card/30 backdrop-blur-lg" : "bg-card"
          )}
        >
          <Button
            onClick={() => {
              if (isFirstLoad) {
                setIsFirstLoad(false);
                loadModelViewer(windowCanvasRef.current!);
              }
              setState({ visible: !state.visible, display: "window" });
            }}
            className="w-[225px]"
          >
            {state.visible ? (
              <>
                <ImageIcon /> Return to thumbnail
              </>
            ) : (
              <>
                <EyeIcon /> Preview model in browser
              </>
            )}
          </Button>

          {state.visible ? (
            <Button
              variant="outline"
              onClick={() => {
                setPortalOpen(true);
                setState({ visible: true, display: "fullscreen" });
                window.addEventListener("keydown", handleEscape);
              }}
            >
              <MaximizeIcon /> Fullscreen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AssetPreview;
