"use client";

import { File } from "@prisma/client";
import { PdfRenderer } from "@/components";
import { ChatWrapper } from "@/components/chat";
import { DocumentContextProvider } from "@/context/document";

interface MainProps {
  file: File;
  plan: {
    name: string;
    pagesPerPdf: number;
  };
}

const Main = ({ file, plan: { name, pagesPerPdf } }: MainProps) => (
  <DocumentContextProvider>
    <div className="flex w-full flex-col lg:h-full lg:flex-row">
      <div className="h-[calc(100svh-3.5rem)] w-full p-4 sm:p-6 lg:h-full lg:w-3/5 lg:shrink-0 lg:py-6 lg:pl-8 lg:pr-6 xl:pl-6">
        <PdfRenderer url={file.url} />
      </div>

      <div className="min-w-0 flex-1 border-t border-gray-200 lg:border-l lg:border-t-0">
        <ChatWrapper
          fileId={file.id}
          planName={name}
          pagesPerPdf={pagesPerPdf}
        />
      </div>
    </div>
  </DocumentContextProvider>
);

export default Main;
