"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  ArrowRight,
  CircleDollarSign,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
} from "lucide-react";

const MobileSlideover = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleIsOpen = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleIsOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleIsOpen();
    }
  };

  return (
    <div className='sm:hidden'>
      <Menu
        onClick={toggleIsOpen}
        className='relative z-50 h-5 w-5 text-zinc-700'
      />

      {isOpen ? (
        <div className='fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full'>
          <ul className='absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8'>
            {!isAuth ? (
              <>
                <li>
                  <Link
                    href='/sign-up'
                    onClick={() => closeOnCurrent("/sign-up")}
                    className='flex items-center w-full font-semibold text-green-600'
                  >
                    Get started
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Link>
                </li>

                <li className='h-px w-full bg-gray-300' />

                <li>
                  <Link
                    href='/sign-in'
                    onClick={() => closeOnCurrent("/sign-in")}
                    className='flex items-center w-full font-semibold'
                  >
                    <LogIn className='h-4 w-4 mr-2' />
                    Sign in
                  </Link>
                </li>

                <li className='h-px w-full bg-gray-300' />

                <li>
                  <Link
                    href='/pricing'
                    onClick={() => closeOnCurrent("/pricing")}
                    className='flex items-center w-full font-semibold'
                  >
                    <CircleDollarSign className='h-4 w-4 mr-2' />
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href='/dashboard'
                    onClick={() => closeOnCurrent("/dashboard")}
                    className='flex items-center w-full font-semibold'
                  >
                    <LayoutDashboard className='h-4 w-4 mr-2' />
                    Dashboard
                  </Link>
                </li>

                <li className='h-px w-full bg-gray-300' />

                <li>
                  <Link
                    href='/sign-out'
                    onClick={() => closeOnCurrent("/sign-out")}
                    className='flex items-center w-full font-semibold'
                  >
                    <LogOut className='h-4 w-4 mr-2' />
                    Sign out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileSlideover;
