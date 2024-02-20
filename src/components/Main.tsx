"use client";

import { File } from "@prisma/client";
import { PdfRenderer } from "@/components";
import { ChatWrapper } from "@/components/chat";
import { DocumentContextProvider } from "@/context/document";

interface MainProps {
  file: File;
  plan: {
    isSubscribed: boolean;
  };
}

const Main = ({ file, plan: { isSubscribed } }: MainProps) => (
  <DocumentContextProvider>
    <div className="flex-1 xl:flex">
      <div className="h-[calc(100svh-3.5rem)] px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
        <PdfRenderer url={file.url} />
      </div>
    </div>

    <div className="shrink-0 lg:flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
      <ChatWrapper fileId={file.id} isSubscribed={isSubscribed} />
    </div>
  </DocumentContextProvider>
);

export default Main;
