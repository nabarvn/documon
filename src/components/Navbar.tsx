import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { MaxWidthWrapper, MobileSlideover, ProfileMenu } from "@/components";

import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";

import { CreditCard, Gem } from "lucide-react";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all px-4'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link href='/' className='flex z-40 font-semibold'>
            <span>documon.</span>
          </Link>

          <div className='flex md:hidden items-center gap-2'>
            {subscriptionPlan?.isSubscribed ? (
              <Link
                href='/dashboard/billing'
                className={buttonVariants({
                  size: "sm",
                  variant: "ghost",
                  className: "z-40",
                })}
              >
                <CreditCard className='h-4 w-4' />
              </Link>
            ) : (
              <Link
                href='/pricing'
                className={buttonVariants({
                  size: "sm",
                  variant: "ghost",
                  className: "z-40",
                })}
              >
                <Gem className='text-blue-600 h-4 w-4' />
              </Link>
            )}

            <MobileSlideover isAuth={!!user} />
          </div>

          <div className='hidden items-center space-x-4 sm:flex'>
            {!user ? (
              <>
                <Link
                  href='/pricing'
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Pricing
                </Link>

                <LoginLink
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign in
                </LoginLink>

                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Try for free
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Dashboard
                </Link>

                <ProfileMenu
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
