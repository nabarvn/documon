"use client";

import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ActionLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href"
> & {
  href?: React.ComponentPropsWithoutRef<typeof Link>["href"];
  asChild?: boolean;
  disabled?: boolean;
};

const ActionLink = ({
  href,
  asChild,
  disabled,
  onClick,
  className,
  children,
  ...props
}: ActionLinkProps) => {
  const pathname = usePathname();
  const [locked, setLocked] = useState(false);
  const isDisabled = locked || disabled;

  useEffect(() => {
    setLocked(false);
  }, [pathname]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    onClick?.(e);

    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    const targetPath =
      typeof href === "string" ? href.split("?")[0] : undefined;

    if (targetPath && targetPath === pathname) return;
    setLocked(true);
  };

  const sharedProps = {
    ...props,
    onClick: handleClick,
    "aria-disabled": isDisabled || undefined,
    tabIndex: isDisabled ? -1 : props.tabIndex,
    className: cn(className, isDisabled && "pointer-events-none opacity-50"),
  };

  if (asChild) {
    return <Slot {...sharedProps}>{children}</Slot>;
  }

  return (
    <Link href={href!} {...sharedProps}>
      {children}
    </Link>
  );
};

export default ActionLink;
