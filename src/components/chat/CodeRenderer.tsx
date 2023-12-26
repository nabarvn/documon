import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import SimpleBar from "simplebar-react";

interface CodeRendererProps {
  children: ReactNode;
  className?: string;
}

const CodeRenderer = ({ children, className }: CodeRendererProps) => {
  return (
    <SimpleBar>
      <code
        className={cn(
          className,
          "block overflow-auto scrollbar-thumb-gray scrollbar-thumb-rounded scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch"
        )}
      >
        {children}
      </code>
    </SimpleBar>
  );
};

export default CodeRenderer;
