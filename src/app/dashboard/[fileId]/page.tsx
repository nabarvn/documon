import { db } from "@/db";
import { Main } from "@/components";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

interface ChatPageProps {
  params: {
    fileId: string;
  };
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const { fileId } = params;

  const { getUser } = getKindeServerSession();
  const user = getUser();

  // guard clause
  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
  });

  if (!file) redirect("/dashboard");

  const plan = await getUserSubscriptionPlan();

  return (
    <div className="lg:h-[calc(100svh-3.5rem)]">
      <Main file={file} plan={plan} />
    </div>
  );
};

export default ChatPage;
