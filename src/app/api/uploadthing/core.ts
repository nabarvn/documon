import { db } from "@/db";
import { createHash } from "crypto";
import { File } from "@prisma/client";
import { pinecone } from "@/lib/pinecone";
import { getMonthlyFileCount } from "@/lib/quota";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const f = createUploadthing();

/*
  36KB leaves room for the PDF fields stored beside the page text.
  Pinecone caps metadata at 40KB.
*/
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 36_000,
  chunkOverlap: 200,
  lengthFunction: (text) => Buffer.byteLength(text, "utf8"),
});

// set permissions and file types for this file route
const createMiddleware = (requiresPro: boolean) => async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  // the client picks the route, so the plan must be verified here
  if (requiresPro && !subscriptionPlan.isSubscribed)
    throw new Error("Pro plan required");

  if ((await getMonthlyFileCount(user.id)) >= subscriptionPlan.quota)
    throw new Error("Quota exceeded");

  // whatever is returned here is accessible in `onUploadComplete` as `metadata`
  return { subscriptionPlan, userId: user.id };
};

// this code RUNS ON SERVER after upload
const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<ReturnType<typeof createMiddleware>>>;
  file: {
    key: string;
    name: string;
    ufsUrl: string;
  };
}) => {
  let createdFile: File | null = null;

  try {
    // to access the PDF file in memory
    const response = await fetch(file.ufsUrl);

    if (!response.ok) return { error: "UploadThingError" };

    // get raw binary data of the file as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // calculate the SHA-256 hash
    const fileHash = createHash("sha256")
      .update(new Uint8Array(arrayBuffer))
      .digest("hex");

    const isFileExist = await db.file.findFirst({
      where: {
        hash: fileHash,
        userId: metadata.userId,
      },
    });

    if (!!isFileExist) return { duplicate: true };

    createdFile = await db.file.create({
      data: {
        key: file.key,
        name: file.name,
        hash: fileHash,
        userId: metadata.userId,
        url: file.ufsUrl,
        uploadStatus: "PROCESSING",
      },
    });

    // convert ArrayBuffer to Blob
    const blob = new Blob([arrayBuffer], {
      type: "application/pdf",
    });

    // loading the PDF into memory
    const loader = new PDFLoader(blob);

    // extracting the page-level text of the PDF
    const pageLevelDocs = await loader.load();

    // each document in the array is a page
    const pagesAmt = pageLevelDocs.length;

    // enforce page limit
    if (pagesAmt > metadata.subscriptionPlan.pagesPerPdf) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });

      return;
    }

    // vectorize and index entire document
    const pineconeIndex = pinecone.Index("documon");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const docs = await splitter.splitDocuments(pageLevelDocs);

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
      maxRetries: 3,
    });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (error) {
    createdFile &&
      (await db.file.delete({
        where: {
          id: createdFile.id,
        },
      }));

    return { error: "PineconeBadRequestError" };
  }
};

// `FileRouter` for the app, can contain multiple file routes
// one can define as many file routes as they would like, each with a unique `routeSlug`
export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(createMiddleware(false))
    .onUploadComplete(onUploadComplete),

  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(createMiddleware(true))
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
