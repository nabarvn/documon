"use client";

import { trpc } from "@/app/_trpc/client";
import { ActionLink } from "@/components";
import { useRouter } from "next/navigation";
import { ChatInput, Messages } from "@/components/chat";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { ChatContextProvider } from "@/context/chat";

interface ChatWrapperProps {
  fileId: string;
  planName: string;
  pagesPerPdf: number;
}

const ChatWrapper = ({ fileId, planName, pagesPerPdf }: ChatWrapperProps) => {
  const router = useRouter();

  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      retry: false,
      onError: () => router.replace("/dashboard"),
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    },
  );

  if (isLoading)
    return (
      <div className="relative h-[calc(100svh-3.5rem)] lg:min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 py-20">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>

            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative h-[calc(100svh-3.5rem)] lg:min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 py-20">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative h-[calc(100svh-3.5rem)] lg:min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 py-20">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>

            <p className="text-zinc-500 text-sm">
              Your&nbsp;
              <span className="font-medium">{planName}</span>
              &nbsp;plan supports upto&nbsp;
              {pagesPerPdf} pages per PDF.
            </p>

            <ActionLink
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </ActionLink>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative h-[calc(100svh-3.5rem)] bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col">
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
