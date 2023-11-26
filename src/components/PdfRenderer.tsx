"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "@/components/ui/UseToast";

// stylesheet for some edge cases to work
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// worker code is needed to properly render the pdf file
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { Button, Input } from "@/components/ui";
import { useResizeDetector } from "react-resize-detector";

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();

  return (
    <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
      <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
        <div className='flex items-center gap-1.5'>
          <Button variant='ghost' aria-label='previous page'>
            <ChevronDown className='h-4 w-4' />
          </Button>

          <div className='flex items-center gap-1.5'>
            <Input className='w-12 h-8' />

            <p className='text-zinc-700 text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 w-full max-h-screen'>
        <div ref={ref}>
          <Document
            file={url}
            className='max-h-full'
            onLoadError={() => {
              toast({
                title: "Error loading PDF",
                description: "Please try again later.",
                variant: "destructive",
              });
            }}
            loading={
              <div className='flex justify-center'>
                <Loader2 className='h-6 w-6 animate-spin my-24' />
              </div>
            }
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <Page
              width={width ? width : 1}
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='h-6 w-6 animate-spin my-24' />
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
