import { db } from "@/db";
import { NextRequest } from "next/server";
import { MessageValidator } from "@/lib/validators/message";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const POST = async (req: NextRequest) => {
  // endpoint for asking questions to a PDF file

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  // renaming to avoid conflict later
  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = MessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // TODO: implement OpenAI and Langchain APIs
};
