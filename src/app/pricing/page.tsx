import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { MaxWidthWrapper, UpgradeButton } from "@/components";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

import { PLANS } from "@/config/stripe";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { redirect } from "next/navigation";

const PricingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  const plan = await getUserSubscriptionPlan();

  if (plan.isSubscribed) redirect("/dashboard/billing");

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: PLANS.find((p) => p.slug === "free")!.quota,
      features: [
        {
          text: "5 pages per PDF",
          footnote: "The maximum amount of pages per PDF file.",
        },
        {
          text: "4MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote:
            "Better algorithmic responses for enhanced content quality.",
          negative: true,
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For larger projects with higher needs.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        {
          text: "25 pages per PDF",
          footnote: "The maximum amount of pages per PDF file.",
        },
        {
          text: "16MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote:
            "Better algorithmic responses for enhanced content quality.",
        },
        {
          text: "Priority support",
        },
      ],
    },
  ];

  return (
    <>
      <MaxWidthWrapper className='text-center max-w-5xl mb-8 mt-24'>
        <div className='mx-auto sm:max-w-lg mb-10'>
          <h1 className='text-6xl font-bold sm:text-7xl'>Pricing</h1>

          <p className='text-gray-600 sm:text-lg mt-5 mx-5 md:mx-0'>
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2 pt-12'>
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-blue-600 shadow-blue-200": plan === "Pro",
                    "border border-gray-200": plan !== "Pro",
                  })}
                >
                  {plan === "Pro" && (
                    <div className='absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-sm font-medium text-white px-3 py-2'>
                      Upgrade now
                    </div>
                  )}

                  <div className='p-5'>
                    <h3 className='text-center font-display text-3xl font-bold my-3'>
                      {plan}
                    </h3>

                    <p className='text-gray-500'>{tagline}</p>

                    <p className='font-display text-6xl font-semibold my-5'>
                      ${price}
                    </p>

                    <p className='text-gray-500'>per month</p>
                  </div>

                  <div className='flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50'>
                    <div className='flex items-center space-x-1'>
                      <p>{quota.toLocaleString()} PDFs/mo included</p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className='cursor-default ml-1.5'>
                          <HelpCircle className='h-4 w-4 text-zinc-500' />
                        </TooltipTrigger>

                        <TooltipContent className='w-80 p-2'>
                          Number of PDFs you can upload per month.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className='space-y-5 my-10 px-8'>
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className='flex space-x-5'>
                        <div className='flex-shrink-0'>
                          {negative ? (
                            <Minus className='h-6 w-6 text-gray-300' />
                          ) : (
                            <Check className='h-6 w-6 text-blue-500' />
                          )}
                        </div>

                        {footnote ? (
                          <div className='flex items-center space-x-1'>
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": negative,
                              })}
                            >
                              {text}
                            </p>

                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className='cursor-default ml-1.5'>
                                <HelpCircle className='h-4 w-4 text-zinc-500' />
                              </TooltipTrigger>

                              <TooltipContent className='w-80 p-2'>
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-gray-600", {
                              "text-gray-400": negative,
                            })}
                          >
                            {text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className='border-t border-gray-200' />

                  <div className='p-5'>
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className='h-5 w-5 ml-1.5' />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href='/sign-in'
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className='h-5 w-5 ml-1.5' />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default PricingPage;
