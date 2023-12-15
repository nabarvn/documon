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

  if (!user.id) {
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

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd &&
      // check if current subscription period ends at a future date
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now() // 86400000 = 1 day
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;

  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
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
