"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import { Message } from "@/components/chat";
import { ChatContext } from "@/context/chat";
import { MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { useIntersection } from "@mantine/hooks";
import { DocumentContext } from "@/context/document";
import { useContext, useEffect, useLayoutEffect, useRef } from "react";

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { numPages } = useContext(DocumentContext);
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: "10",
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      },
    );

  // using `flatMap` here so that we don't have to map around the data twice
  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    id: "loading-message",
    isUserMessage: false,
    createdAt: new Date().toISOString(),
    text: (
      <div className="flex items-center space-x-1.5 text-base">
        <p className="animate-pulse text-zinc-600">Thinking</p>

        <span className="mt-1 flex items-center gap-x-1">
          <span className="animate-flashing inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />

          <span
            className="animate-flashing inline-block h-1.5 w-1.5 rounded-full bg-zinc-600"
            style={{ animationDelay: "0.2s" }}
          />

          <span
            className="animate-flashing inline-block h-1.5 w-1.5 rounded-full bg-zinc-600"
            style={{ animationDelay: "0.4s" }}
          />
        </span>
      </div>
    ),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const scrollerRef = useRef<HTMLDivElement>(null);

  const latest = combinedMessages[0];
  const latestSize = typeof latest?.text === "string" ? latest.text.length : 0;

  /*
    This list is drawn bottom-up, so `scrollTop` 0 is the latest message.
    It snaps back there when the user sends a message, while the AI is
    thinking, and as the reply streams in. Loading older messages leaves
    the latest one alone, so reading back through history stays put.
  */
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = 0;
  }, [latest?.id, latestSize, isAiThinking]);

  // to track the last message of each page
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // check if the `div` is intersecting with screen
  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div
      ref={scrollerRef}
      className="flex max-h-[calc(100svh-3.5rem-5.18rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 overflow-y-auto overflow-anchor-none p-3 chat-scrollbar-thumb-gray chat-scrollbar-thumb-rounded chat-scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch"
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSameOrigin =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                key={message.id}
                message={message}
                isNextMessageSameOrigin={isNextMessageSameOrigin}
              />
            );
          } else
            return (
              <Message
                key={message.id}
                message={message}
                isNextMessageSameOrigin={isNextMessageSameOrigin}
              />
            );
        })
      ) : isLoading || !numPages ? (
        Array.from({ length: 6 }).map((_, i) => {
          const isUserMessage = i % 2 !== 0;

          return (
            <div
              key={i}
              className={cn("flex items-end", {
                "justify-end": isUserMessage,
              })}
            >
              <div
                className={cn(
                  "relative flex shrink-0 h-6 w-6 aspect-square items-center justify-center rounded-sm overflow-hidden",
                  {
                    "order-2": isUserMessage,
                    "order-1": !isUserMessage,
                  },
                )}
              >
                <Skeleton
                  width={24}
                  height={24}
                  containerClassName="flex h-full w-full leading-none"
                />
              </div>

              <div
                className={cn(
                  "mx-2 flex min-w-0 flex-col space-y-2 text-base",
                  {
                    "order-1 max-w-max items-end": isUserMessage,
                    "order-2 flex-1 items-start": !isUserMessage,
                  },
                )}
              >
                <div
                  className={cn("rounded-lg px-4 py-2 bg-white shadow-sm", {
                    "inline-block rounded-br-none": isUserMessage,
                    "block w-full min-w-0 rounded-bl-none": !isUserMessage,
                  })}
                >
                  {isUserMessage ? (
                    <Skeleton width={160} height={18} />
                  ) : (
                    <>
                      <Skeleton height={16} count={2} />
                      <Skeleton width="65%" height={16} />
                    </>
                  )}

                  <div className="text-xs select-none w-full text-right mt-2">
                    <Skeleton width={32} height={12} />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>

          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
