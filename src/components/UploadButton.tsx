"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Dialog, DialogTrigger } from "@/components/ui/Dialog";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
    </Dialog>
  );
};

export default UploadButton;
