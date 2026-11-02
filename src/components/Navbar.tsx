import Link from "next/link";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { buttonVariants } from "@/components/ui/Button";

import {
  ActionLink,
  MaxWidthWrapper,
  MobileSlideover,
  ProfileMenu,
} from "@/components";

import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  const plan = await getUserSubscriptionPlan();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>documon.</span>
          </Link>

          <MobileSlideover isAuth={!!user} isSubscribed={plan.isSubscribed} />

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <ActionLink
                  href="/pricing"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Pricing
                </ActionLink>

                <ActionLink
                  asChild
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  <LoginLink>Sign in</LoginLink>
                </ActionLink>

                <ActionLink
                  asChild
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  <RegisterLink>Try for free</RegisterLink>
                </ActionLink>
              </>
            ) : (
              <>
                <ActionLink
                  href="/dashboard"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Dashboard
                </ActionLink>

                <ProfileMenu
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
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
