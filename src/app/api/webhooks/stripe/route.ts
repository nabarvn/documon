import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

/*
  Only these statuses grant Pro
  (e.g. `incomplete`, `unpaid`, `canceled` do not)
*/
const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  "active",
  "trialing",
  "past_due",
];

const getSubscriptionData = (subscription: Stripe.Subscription) => ({
  stripePriceId: ACTIVE_STATUSES.includes(subscription.status)
    ? subscription.items.data[0]?.price.id
    : null,
  stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    // validate if this event actually comes from Stripe
    // no user should be able to trigger this event
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (!session.metadata?.userId) return new Response(null, { status: 200 });

    // retrieve the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // for new subscription
    await db.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        ...getSubscriptionData(subscription),
      },
    });
  }

  // renewals, cancellations and failed payments all arrive as subscription updates
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;

    // `updateMany` does not throw if the checkout event has not been processed yet
    await db.user.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: getSubscriptionData(subscription),
    });
  }

  return new Response(null, { status: 200 });
}
