import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { forwardRef } from "react";
import remarkGfm from "remark-gfm";
import { Icons } from "@/components";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { ExtendedMessage } from "@/types/message";
import { CodeRenderer, LinkRenderer } from "@/components/chat";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSameOrigin: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSameOrigin }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
      >
        <div
          className={cn(
            "relative flex shrink-0 h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
              "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
              invisible: isNextMessageSameOrigin,
            },
          )}
        >
          {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
          )}
        </div>

        <div
          className={cn("mx-2 flex min-w-0 flex-col space-y-2 text-base", {
            "order-1 max-w-max items-end": message.isUserMessage,
            "order-2 flex-1 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("rounded-lg px-4 py-2", {
              "inline-block bg-blue-600 text-white": message.isUserMessage,
              "bg-gray-200 text-gray-900": !message.isUserMessage,
              "block w-full min-w-0":
                !message.isUserMessage && message.id !== "loading-message",
              "inline-block": message.id === "loading-message",
              "rounded-br-none":
                !isNextMessageSameOrigin && message.isUserMessage,
              "rounded-bl-none":
                !isNextMessageSameOrigin && !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                rehypePlugins={[[rehypeHighlight], [remarkGfm]]}
                components={{
                  code: ({ children, className, node, ref, ...rest }) => (
                    <CodeRenderer className={className} {...rest}>
                      {children}
                    </CodeRenderer>
                  ),
                  a: ({ href, children }) => (
                    <LinkRenderer link={href}>{children}</LinkRenderer>
                  ),
                }}
                className={cn("prose", {
                  "max-w-none": !message.isUserMessage,
                  "text-zinc-50": message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}

            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none w-full text-right mt-2", {
                  "text-blue-300": message.isUserMessage,
                  "text-zinc-500": !message.isUserMessage,
                })}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);
Message.displayName = "Message";

export default Message;
