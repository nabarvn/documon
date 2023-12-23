"use client";

import React from "react";
import { Ghost } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { UploadButton, PdfFileCard, MaxWidthWrapper } from "@/components";

interface DashboardProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const Dashboard = ({ subscriptionPlan }: DashboardProps) => {
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  return (
    <MaxWidthWrapper className='max-w-5xl xl:max-w-7xl mb-8 mt-24'>
      <div className='flex flex-col items-start justify-between gap-4 border-b border-gray-200 sm:flex-row sm:items-center sm:gap-0 pb-5 my-8'>
        <h1 className='font-bold text-5xl text-gray-900 mb-3'>My Files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className='grid grid-cols-1 gap-6 divide-y divide-zinc-200 lg:grid-cols-2 xl:grid-cols-3'>
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <React.Fragment key={file.id}>
                <PdfFileCard file={file} />
              </React.Fragment>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className='h-32 mb-6' count={3} />
      ) : (
        <div className='flex flex-col items-center gap-2 mt-16'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default Dashboard;
