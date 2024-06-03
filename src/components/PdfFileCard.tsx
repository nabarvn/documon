"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { File } from "@prisma/client";
import { Button } from "@/components/ui";
import { trpc } from "@/app/_trpc/client";
import { Loader2, MessageSquare, Plus, Trash } from "lucide-react";

type CustomFile = Omit<File, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

interface PdfFileCardProps {
  file: CustomFile;
}

const PdfFileCard = ({ file }: PdfFileCardProps) => {
  const utils = trpc.useContext();

  const { data } = trpc.getFileMessages.useQuery({
    fileId: file.id,
    limit: "all",
  });

  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      // force refresh
      utils.getUserFiles.invalidate();
    },

    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },

    onSettled() {
      setCurrentlyDeletingFile(null);
    },
  });

  return (
    <li className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg">
      <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between space-x-6 pt-6 px-6">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />

          <div className="flex-1 truncate">
            <div className="flex items-center space-x-3">
              <h3 className="truncate text-lg font-medium text-zinc-900">
                {file.name}
              </h3>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-3 place-items-center gap-5 text-sm text-zinc-500 px-6 py-2 mt-4">
        <div className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          {format(new Date(file.createdAt), "MMM yyyy")}
        </div>

        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />

          {data ? (
            data?.messages.length
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteFile({ id: file.id })}
          className="flex items-center text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive gap-1 w-full"
        >
          {currentlyDeletingFile === file.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
          Delete
        </Button>
      </div>
    </li>
  );
};

export default PdfFileCard;
