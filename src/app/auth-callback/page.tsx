"use client";

import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { MAX_QUERY_COUNT } from "@/config/max-query";
import { redirect, useRouter, useSearchParams } from "next/navigation";

const AuthCallbackPage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // not compatible with react query v5
  const { failureCount } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        // user is synced to db
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },

    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },

    retry: MAX_QUERY_COUNT,
    retryDelay: 500,
  });

  if (failureCount >= MAX_QUERY_COUNT) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full flex justify-center mt-24">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800 dark:text-zinc-800" />

        <h3 className="font-semibold text-xl dark:text-zinc-900">
          Setting up your account...
        </h3>

        <p className="dark:text-zinc-900">
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
