import { z } from "zod";

export const MessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
});
