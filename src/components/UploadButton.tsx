"use client";

import { cn } from "@/lib/utils";
import Dropzone from "react-dropzone";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/UseToast";
import { Button, Progress } from "@/components/ui";
import { useUploadThing } from "@/lib/uploadthing";
import { Cloud, File, Loader2 } from "lucide-react";
import { MAX_QUERY_COUNT } from "@/config/max-query";
import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";

interface UploadDropzoneProps {
  isSubscribed: boolean;
  isUploading: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsUploading: Dispatch<SetStateAction<boolean>>;
}

const UploadDropzone = ({
  isSubscribed,
  isUploading,
  setIsOpen,
  setIsUploading,
}: UploadDropzoneProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { startUpload } = useUploadThing(
    isSubscribed ? "proPlanUploader" : "freePlanUploader"
  );

  const { data } = trpc.getQuotaLimit.useQuery();

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: MAX_QUERY_COUNT,
    retryDelay: 500,
  });

  // creating a determinate progress bar
  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }

        return prevProgress + 5;
      });
    }, 900);

    return interval;
  };

  return (
    <Dropzone
      // we want users to drop only one file at a time
      multiple={false}
      noClick={true}
      noKeyboard={true}
      disabled={isUploading}
      accept={{
        "application/pdf": [".pdf"],
      }}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);

        const progressInterval = startSimulatedProgress();

        if (data?.isQuotaExceeded) {
          return toast({
            title: "Quota Error",
            description: `You've exceeded the ${data.planName} plan quota limit.`,
            variant: "destructive",
          });
        }

        // handle file uploading
        const res = await startUpload(acceptedFile);

        if (!res) {
          setIsOpen(false);
          setIsUploading(false);

          return toast({
            title: "PDF Upload Error",
            description:
              "Please ensure your file size is within the specified limit and try again.",
            variant: "destructive",
          });
        }

        // destructuring the first array element from response
        const [fileResponse] = res;

        if (fileResponse.serverData?.duplicate) {
          setIsOpen(false);
          setIsUploading(false);

          return toast({
            title: "Identical File Detected",
            description:
              "Uh-oh! It appears that the PDF you're trying to upload is already in your dashboard. You can either use the existing file or delete it before attempting to upload again.",
            variant: "destructive",
          });
        }

        if (fileResponse.serverData?.error === "PineconeBadRequestError") {
          setIsOpen(false);
          setIsUploading(false);

          router.refresh();

          return toast({
            title: "Pinecone Index Error",
            description:
              "Documon has reached the namespace limit of its current vector database plan. Our team is working on this issue. Please try again later.",
            variant: "destructive",
          });
        }

        if (fileResponse.serverData?.error === "UploadThingError") {
          setIsOpen(false);
          setIsUploading(false);

          return toast({
            title: "UploadThing Error",
            description:
              "We encountered an issue while accessing the uploaded file. Our team has been notified and it will be resolved soon. Please try again shortly.",
            variant: "destructive",
          });
        }

        // key is generated by uploadthing
        const key = fileResponse?.key;

        if (!key) {
          setIsOpen(false);
          setIsUploading(false);

          return toast({
            title: "Something went wrong",
            description: "Please try again later.",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        // asking the api if the file is there in the database
        // check if the pdf has been uploaded successfully
        startPolling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 border-dashed border-gray-300 rounded-lg m-4"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className={cn(
                "flex flex-col items-center justify-center w-full h-full rounded-lg bg-gray-50",
                {
                  "cursor-not-allowed": isUploading,
                  "cursor-pointer hover:bg-gray-100": !isUploading,
                }
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />

                <p className="text-sm text-zinc-700 mb-2">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop.
                </p>

                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? "16" : "4"}MB)
                </p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-[14rem] md:max-w-[18rem] bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="h-full grid place-items-center px-3 py-2">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>

                  <div className="h-full text-sm truncate px-3 py-2">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full max-w-[14rem] md:max-w-[18rem] mx-auto mt-4">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                  />

                  {uploadProgress < 95 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </div>
                  ) : uploadProgress < 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Almost there...
                    </div>
                  ) : (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  )}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v && !isUploading) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent
        isUploading={isUploading}
        className="max-w-[21rem] md:max-w-[25rem]"
      >
        <UploadDropzone
          isSubscribed={isSubscribed}
          isUploading={isUploading}
          setIsOpen={setIsOpen}
          setIsUploading={setIsUploading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
