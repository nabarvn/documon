"use client";

import { trpc } from "@/app/_trpc/client";
import { Message } from "@/components/chat";
import { ChatContext } from "@/context/chat";
import Skeleton from "react-loading-skeleton";
import { useIntersection } from "@mantine/hooks";
import { Loader2, MessageSquare } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      }
    );

  // using `flatMap` here so that we don't have to map around the data twice
  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    id: "loading-message",
    isUserMessage: false,
    createdAt: new Date().toISOString(),
    text: (
      <span className='flex h-full items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </span>
    ),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

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
    <div className='flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 overflow-y-auto p-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
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
      ) : isLoading ? (
        <div className='w-full flex flex-col gap-2'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center gap-2'>
          <MessageSquare className='h-8 w-8 text-blue-500' />
          <h3 className='font-semibold text-xl'>You&apos;re all set!</h3>

          <p className='text-zinc-500 text-sm'>
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
