"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "@/components/ui/UseToast";

// stylesheet for some edge cases to work
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// worker code is needed to properly render the pdf file
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResizeDetector } from "react-resize-detector";

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);

  const PageNumberValidator = z.object({
    page: z
      .string() // whatever we type in an input field is a string value by default
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TPageNumberValidator = z.infer<typeof PageNumberValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TPageNumberValidator>({
    defaultValues: {
      page: "1",
    },
    // links `useForm` to `PageNumberValidator`
    resolver: zodResolver(PageNumberValidator),
  });

  return (
    <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
      <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
        <div className='flex items-center gap-1.5'>
          <Button
            variant='ghost'
            aria-label='previous page'
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
          >
            <ChevronDown className='h-4 w-4' />
          </Button>

          <div className='flex items-center gap-1.5'>
            <Input className='w-12 h-8' />

            <p className='text-zinc-700 text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            variant='ghost'
            aria-label='next page'
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(currPage + 1));
            }}
          >
            <ChevronUp className='h-4 w-4' />
          </Button>
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
              pageNumber={currPage}
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
