"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        setIsRedirecting(true);
        window.location.href = url ?? "/dashboard/billing";
      },
    });

  const isBusy = isLoading || isRedirecting;

  return (
    <Button
      disabled={isBusy}
      onClick={() => createStripeSession()}
      className="w-full"
    >
      {isBusy ? <Loader2 className="h-5 w-5 animate-spin mr-1.5" /> : null}
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
