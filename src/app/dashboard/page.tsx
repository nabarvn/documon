import { db } from "@/db";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Dashboard } from "@/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  // for new users only
  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;
