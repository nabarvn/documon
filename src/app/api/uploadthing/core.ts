import { db } from "@/db";
import { createHash } from "crypto";
import { File } from "@prisma/client";
import { PLANS } from "@/config/stripe";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const f = createUploadthing();

// set permissions and file types for this file route
const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  // whatever is returned here is accessible in `onUploadComplete` as `metadata`
  return { subscriptionPlan, userId: user.id };
};

// this code RUNS ON SERVER after upload
const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  let createdFile: File | null = null;

  try {
    // to access the PDF file in memory
    const response = await fetch(file.url);

    if (!response.ok) return { error: "UploadThingError" };

    // get raw binary data of the file as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);

    // calculate the SHA-256 hash
    const fileHash = createHash("sha256").update(buffer).digest("hex");

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
        url: file.url,
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
    const {
      subscriptionPlan: { isSubscribed },
    } = metadata;

    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;

    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // vectorize and index entire document
    const pineconeIndex = pinecone.Index("documon");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
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
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
