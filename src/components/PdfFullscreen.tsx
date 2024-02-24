"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import { Button } from "@/components/ui";
import { Document, Page } from "react-pdf";
import { Expand, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/UseToast";
import { useResizeDetector } from "react-resize-detector";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";

interface PdfFullscreenProps {
  fileUrl: string;
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();

  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        // `v` stands for visibility
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[21rem] md:max-w-2xl xl:max-w-5xl w-full">
        <SimpleBar
          autoHide={false}
          className="max-h-[calc(100svh-10rem)] max-w-[21rem] md:max-w-2xl xl:max-w-5xl mt-6"
        >
          <div ref={ref}>
            <Document
              file={fileUrl}
              className="max-h-full"
              loading={
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin my-24" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later.",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
