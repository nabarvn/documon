"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useToast } from "@/components/ui/UseToast";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";

// stylesheet for some edge cases to work
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// worker code is needed to properly render the pdf file
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { PdfFullscreen } from "@/components";
import { Button, Input } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResizeDetector } from "react-resize-detector";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

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

  const handlePageSubmit = ({ page }: TPageNumberValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

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
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />

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

        <div className='flex space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='gap-1.5' aria-label='zoom' variant='ghost'>
                <Search className='hidden md:block h-4 w-4' />
                {scale * 100}%
                <ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant='ghost'
            aria-label='rotate 90 degrees'
            className='hidden md:block'
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className='h-4 w-4' />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className='flex-1 w-full max-h-screen'>
        <SimpleBar autoHide={false} className='max-h-[calc(100svh-10rem)]'>
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
              {isLoading && renderedScale ? (
                <Page
                  key={"@" + renderedScale}
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                />
              ) : null}

              <Page
                key={"@" + scale}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                className={cn(isLoading && "hidden")}
                onRenderSuccess={() => setRenderedScale(scale)}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='h-6 w-6 animate-spin my-24' />
                  </div>
                }
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
