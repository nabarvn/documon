import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PdfRenderer } from "@/components";
import { ChatWrapper } from "@/components/chat";
import { getUserSubscriptionPlan } from "@/lib/stripe";

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
    <div className='flex-1 justify-between flex flex-col h-[calc(100svh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        {/* left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='h-[calc(100svh-3.5rem)] px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            {/* main area */}
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          <ChatWrapper fileId={file.id} isSubscribed={plan.isSubscribed} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
