import {
  ChevronDown,
  ChevronUp,
  Expand,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";

import { Button, Input } from "@/components/ui";
import { ChatInput } from "@/components/chat";

const FileLoading = () => (
  <div className="lg:h-[calc(100svh-3.5rem)]">
    <div className="flex w-full flex-col lg:h-full lg:flex-row">
      {/* Left: PdfRenderer shell */}
      <div className="h-[calc(100svh-3.5rem)] w-full p-4 sm:p-6 lg:h-full lg:w-3/5 lg:shrink-0 lg:py-6 lg:pl-8 lg:pr-6 xl:pl-6">
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-md bg-white shadow">
          <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" aria-label="previous page" disabled>
                <ChevronDown className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1.5">
                <Input
                  defaultValue="1"
                  disabled
                  className="w-12 h-8"
                  aria-label="current page"
                />

                <p className="text-zinc-700 text-sm space-x-1">
                  <span>/</span>
                  <span>x</span>
                </p>
              </div>

              <Button variant="ghost" aria-label="next page" disabled>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                className="gap-1.5"
                aria-label="zoom"
                variant="ghost"
                disabled
              >
                <Search className="hidden md:block h-4 w-4" />
                100%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>

              <Button
                variant="ghost"
                aria-label="rotate 90 degrees"
                className="hidden md:block"
                disabled
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                className="gap-1.5"
                aria-label="fullscreen"
                disabled
              >
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative min-h-0 w-full flex-1">
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin my-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: ChatWrapper initial loading shell */}
      <div className="min-w-0 flex-1 border-t border-gray-200 lg:border-l lg:border-t-0">
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
      </div>
    </div>
  </div>
);

export default FileLoading;
