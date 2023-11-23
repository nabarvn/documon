import { db } from "@/db";
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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
