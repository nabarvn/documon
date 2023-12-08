import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

// infer the type of data we get back from any route in tRPC
type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
