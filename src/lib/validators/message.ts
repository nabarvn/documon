import { z } from "zod";
import { MAX_INPUT_LENGTH } from "@/config/chat";

export const MessageValidator = z.object({
  fileId: z.string(),
  message: z.string().min(1).max(MAX_INPUT_LENGTH),
});
