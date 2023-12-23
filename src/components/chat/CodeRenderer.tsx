import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CodeRendererProps {
  children: ReactNode;
  className?: string;
}

const CodeRenderer = ({ children, className }: CodeRendererProps) => {
  return (
    <code
      className={cn(
        className,
        "block max-w-[15rem] md:max-w-sm lg:max-w-[19rem] xl:md:max-w-sm overflow-auto scrollbar-thumb-gray scrollbar-thumb-rounded scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch"
      )}
    >
      {children}
    </code>
  );
};

export default CodeRenderer;
