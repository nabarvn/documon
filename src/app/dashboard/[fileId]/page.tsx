import { db } from "@/db";
import { Main } from "@/components";
import { notFound, redirect } from "next/navigation";
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

  if (!file) notFound();

  const plan = await getUserSubscriptionPlan();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100svh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        <Main file={file} plan={plan} />
      </div>
    </div>
  );
};

export default ChatPage;
