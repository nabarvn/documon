import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const f = createUploadthing();

// `FileRouter` for the app, can contain multiple file routes
export const ourFileRouter = {
  // one can define as many file routes as they would like, each with a unique `routeSlug`
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // set permissions and file types for this file route
    .middleware(() => {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !user.id) throw new Error("Unauthorized");

      // whatever is returned here is accessible in `onUploadComplete` as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // this code RUNS ON SERVER after upload

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        // to access the PDF file in memory
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );

        // we need the PDF as blob to be able to index it
        const blob = await response.blob();

        // loading the PDF into memory
        const loader = new PDFLoader(blob);

        // extracting the page-level text of the PDF
        const pageLevelDocs = await loader.load();

        // each document in the array is a page
        const pagesAmt = pageLevelDocs.length;

        // TODO: business logic for subscription plan

        // vectorize and index entire document
        const pineconeIndex = pinecone.Index("documon");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
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
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
