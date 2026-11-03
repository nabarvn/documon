import { Button } from "@/components/ui";
import { MaxWidthWrapper, PdfFileCardSkeleton } from "@/components";

const DashboardLoading = () => (
  <MaxWidthWrapper className="max-w-5xl xl:max-w-7xl mb-8 mt-24">
    <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 sm:flex-row sm:items-center sm:gap-0 pb-5 my-8">
      <h1 className="font-bold text-5xl text-gray-900 dark:text-zinc-900 mb-3">
        My Files
      </h1>

      <Button disabled>Upload PDF</Button>
    </div>

    <PdfFileCardSkeleton />
  </MaxWidthWrapper>
);

export default DashboardLoading;
