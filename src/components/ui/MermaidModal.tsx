import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MaximizeIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import type { FC } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";

interface MermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  svg: string; // The generated SVG string
  chart: string; // The original chart source
}

export const MermaidModal: FC<MermaidModalProps> = ({
  isOpen,
  onClose,
  svg,
  chart,
}) => {
  // Use a unique ID for the modal content to avoid accessibility issues
  // But VisuallyHidden Title handles accessibility requirement for DialogContent

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-md overflow-hidden border-border/50 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Mermaid Diagram Visualization</DialogTitle>
        </VisuallyHidden>
        <style>{`
            .mermaid-modal-content svg {
                width: 100% !important;
                height: auto !important;
                max-width: none !important;
                max-height: none !important;
            }
         `}</style>

        <div className="relative w-full h-full flex flex-col">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm shadow-sm"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 w-full h-full overflow-hidden bg-dot-pattern">
            {/* Using dangerouslySetInnerHTML to render the SVG string */}
            {/* We wrap it in zoom-pan-pinch for exploration */}
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={8}
              limitToBounds={false}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => zoomIn()}
                      className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm shadow-sm"
                    >
                      <ZoomInIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => zoomOut()}
                      className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm shadow-sm"
                    >
                      <ZoomOutIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => resetTransform()}
                      className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm shadow-sm"
                    >
                      <MaximizeIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="flex items-start justify-center cursor-move min-w-full min-h-full pt-10 pb-10"
                  >
                    <div
                      className="mermaid-modal-content w-full"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized by DOMPurify
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>

          <div className="p-2 border-t bg-muted/20 text-xs text-muted-foreground font-mono truncate px-4">
            {chart.slice(0, 100)}
            {chart.length > 100 ? "..." : ""}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
