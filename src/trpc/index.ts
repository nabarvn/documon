import { z } from "zod";
import { db } from "@/db";
import { PLANS } from "@/config/stripe";
import { TRPCError } from "@trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();

    // accessing the logged in user
    const user = getUser();

    // guard clause
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if the user already exists in db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (
      (subscriptionPlan.isSubscribed || subscriptionPlan.isCanceled) &&
      dbUser.stripeCustomerId
    ) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const files = await db.file.findMany({
      where: {
        userId,
      },
    });

    return files;
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getQuotaLimit: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    const fileCount = await db.file.count({
      where: {
        userId: userId,
      },
    });

    const proLimit = PLANS.find((plan) => plan.name === "Pro")!.quota;
    const freeLimit = PLANS.find((plan) => plan.name === "Free")!.quota;

    const isProQuotaExceeded = fileCount >= proLimit;
    const isFreeQuotaExceeded = fileCount >= freeLimit;

    return {
      fileCount: fileCount,
      planName: subscriptionPlan.name,
      quotaLimit: subscriptionPlan.isSubscribed ? proLimit : freeLimit,
      isQuotaExceeded: subscriptionPlan.isSubscribed
        ? isProQuotaExceeded
        : isFreeQuotaExceeded,
    };
  }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
        limit: z.enum(["10", "20", "all"]).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // logic for infinite query
      const messages = await db.message.findMany({
        take: limit === "all" ? undefined : Number(limit) + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (limit !== "all" && messages.length > Number(limit)) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          userId,
          id: input.id,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
});

export type AppRouter = typeof appRouter;
