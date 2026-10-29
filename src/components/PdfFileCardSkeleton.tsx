import Skeleton from "react-loading-skeleton";
import { cn } from "@/lib/utils";

const PdfFileCardSkeleton = () => (
  <ul className="grid grid-cols-1 gap-6 divide-y divide-zinc-200 lg:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <li
        key={i}
        className={cn(
          "col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow",
          i >= 3 && "hidden lg:block",
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-between space-x-6 pt-6 px-6">
            <Skeleton circle width={40} height={40} />

            <div className="flex-1 truncate">
              <Skeleton height={24} width="70%" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 place-items-center gap-5 text-sm text-zinc-500 px-6 py-2 mt-4">
          <Skeleton width={60} height={18} />
          <Skeleton width={28} height={18} />

          <div className="flex h-9 w-full items-center justify-center">
            <Skeleton width={60} height={20} />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default PdfFileCardSkeleton;
