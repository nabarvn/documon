"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
} from "lucide-react";

const MobileSlideover = ({ isAuth }: { isAuth: boolean }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleIsOpen = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div ref={menuRef} className='sm:hidden'>
        <Menu
          onClick={toggleIsOpen}
          className='relative z-40 h-5 w-5 text-zinc-700'
        />

        {isOpen ? (
          <div className='fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-30 w-full'>
            <ul className='absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8'>
              {!isAuth ? (
                <>
                  <li>
                    <Link
                      href='/sign-up'
                      onClick={() => setIsOpen(false)}
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
                      onClick={() => setIsOpen(false)}
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
                      onClick={() => setIsOpen(false)}
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
                      onClick={() => setIsOpen(false)}
                      className='flex items-center w-full font-semibold'
                    >
                      <LayoutDashboard className='h-4 w-4 mr-2' />
                      Dashboard
                    </Link>
                  </li>

                  <li className='h-px w-full bg-gray-300' />

                  <li>
                    <Link
                      href='/dashboard/billing'
                      onClick={() => setIsOpen(false)}
                      className='flex items-center w-full font-semibold'
                    >
                      <CreditCard className='h-4 w-4 mr-2' />
                      Manage Subscription
                    </Link>
                  </li>

                  <li className='h-px w-full bg-gray-300' />

                  <li>
                    <Link
                      href='/sign-out'
                      onClick={() => setIsOpen(false)}
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

      <div
        onClick={() => setIsOpen(false)}
        className={cn("md:hidden fixed inset-0 z-20 bg-gray-900/25", {
          hidden: !isOpen,
        })}
        style={{ height: "100svh" }}
      />
    </>
  );
};

export default MobileSlideover;
