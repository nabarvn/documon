import Link from "next/link";
import { ReactNode } from "react";

interface LinkRendererProps {
  children: ReactNode;
  link: string | undefined;
}

const LinkRenderer = ({ children, link }: LinkRendererProps) => {
  if (!link) {
    return <>{children}</>;
  }

  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 break-words underline underline-offset-2"
    >
      {children}
    </Link>
  );
};

export default LinkRenderer;
