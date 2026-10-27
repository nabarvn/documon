import { db } from "@/db";
import Stripe from "stripe";
import { PLANS } from "@/config/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user?.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  /*
    Paid plan applies only while the current subscription period is in the future
  */
  const paidPlan =
    dbUser.stripeCurrentPeriodEnd &&
    dbUser.stripeCurrentPeriodEnd.getTime() > Date.now()
      ? PLANS.find(
          (plan) =>
            plan.price.priceIds.test &&
            plan.price.priceIds.test === dbUser.stripePriceId,
        )
      : undefined;

  const plan = paidPlan ?? PLANS[0];
  const isSubscribed = Boolean(paidPlan);

  let isCanceled = false;

  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId,
    );

    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
