import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type DisplayOptions, type ViewController, initModelViewers } from "@/lib/model-viewer";
import type { AssetWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import * as Portal from "@radix-ui/react-portal";
import { EyeIcon, ImageIcon, MaximizeIcon, MinimizeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ModelViewerState = {
  visible: boolean;
  display: DisplayOptions;
};

const AssetPreview = ({ asset }: { asset: AssetWithDetails }) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [portalOpen, setPortalOpen] = useState(false);

  const [state, setState] = useState<ModelViewerState>({
    visible: false,
    display: "window",
  });
  const stateRef = useRef<ModelViewerState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const windowCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ViewController>({
    switchTo: () => console.log("Fake controller called switchTo()!"),
  });

  function openFullscreen() {
    controller.current.switchTo("fullscreen");
    setState({ visible: true, display: "fullscreen" });
    setPortalOpen(true);
  }

  function closeFullscreen() {
    controller.current.switchTo("window");
    setState({ visible: true, display: "window" });
    setTimeout(() => setPortalOpen(false), 130);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!stateRef.current.visible) return;

    if (stateRef.current.display === "fullscreen" && event.key === "Escape") {
      closeFullscreen();
    }

    const noModifiers =
      !event.getModifierState("Control") &&
      !event.getModifierState("Shift") &&
      !event.getModifierState("Alt") &&
      !event.getModifierState("Meta");

    if (stateRef.current.display === "window" && noModifiers && event.code === "KeyF") {
      openFullscreen();
    }
  }

  const portalState = state.display === "fullscreen" ? "open" : "closed";

  return (
    <div className="w-[80vh] h-[80vh] bg-secondary rounded-xl overflow-hidden relative">
      <img
        src={asset.thumbnailUrl}
        alt={asset.name}
        loading="eager"
        className={cn("w-full h-full object-cover")}
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
            variant="secondary"
            className="top-5 right-5 absolute w-[160px]"
            onClick={closeFullscreen}
          >
            <MinimizeIcon />
            Minimize <Badge variant="outline">Esc</Badge>
          </Button>
        </div>
      </Portal.Root>

      <div className="absolute bottom-5 inset-x-0 w-full px-5 flex items-center justify-center">
        <div className="flex items-center justify-center rounded-2xl gap-3">
          <Button
            className="w-[225px]"
            onClick={async () => {
              if (isFirstLoad) {
                setIsFirstLoad(false);

                if (windowCanvasRef.current && fullscreenCanvasRef.current) {
                  controller.current = await initModelViewers(
                    windowCanvasRef.current,
                    fullscreenCanvasRef.current
                  );
                } else {
                  console.error("[DEBUG] Could not find window/fullscreen <canvas> elements!");
                }

                controller.current.switchTo("window");
                window.addEventListener("keydown", handleKeyDown);
              }

              setState({ visible: !state.visible, display: "window" });
            }}
          >
            {state.visible ? (
              <>
                <ImageIcon /> View thumbnail
              </>
            ) : (
              <>
                <EyeIcon /> Preview model in browser
              </>
            )}
          </Button>
        </div>
      </div>

      {state.visible ? (
        <Button
          variant="secondary"
          onClick={openFullscreen}
          className="absolute top-5 right-5 w-[160px]"
        >
          <MaximizeIcon />
          Fullscreen <Badge variant="outline">F</Badge>
        </Button>
      ) : null}
    </div>
  );
};

export default AssetPreview;
