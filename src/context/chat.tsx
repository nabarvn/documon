import { trpc } from "@/app/_trpc/client";
import { useMutation } from "@tanstack/react-query";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "@/components/ui/UseToast";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  // defining fallback values
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface ChatContextProps {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: ChatContextProps) => {
  const { toast } = useToast();

  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // with this we can implement the optimistic updates feature
  const utils = trpc.useContext();
  const backupMessage = useRef("");

  // tRPC is not used here because we want to stream back a response from the API [not JSON]
  // P.S. - there might be an experimental version of tRPC that allows streaming back of API response
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        // this triggers the `onError` method
        throw new Error("Failed to send message");
      }

      // to be used in `onSuccess` method
      return response.body;
    },

    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // step 1: cancel any outgoing refetches to prevent overwriting of optimistic updates
      await utils.getFileMessages.cancel();

      // step 2: snapshot the previous value
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // step 3: optimistically insert the new value right away
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: "10" },
        // accessing old data in the callback fn
        (old) => {
          if (!old) {
            return {
              // these properties are required because React Query handles infinite query utilizing them
              // we have to comply with the expected object structure
              pages: [],
              pageParams: [],
            };
          }

          // cloning the old pages
          let newPages = [...old.pages];

          // contains all latest number of messages set by `limit` in the chat
          let latestPage = newPages[0]!;

          // inserting the latest message by user
          latestPage.messages = [
            {
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
              createdAt: new Date().toISOString(),
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      // setting the loading state of AI response after optimistically updating user's latest message
      setIsLoading(true);

      return {
        // can be accessed as `context`
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },

    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again.",
          variant: "destructive",
        });
      }

      // prep for reading the stream content
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let done = false;

      // accumulated response
      let accResponse = "";

      // read the stream in real-time
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: "10" },
          // accessing old data in the callback fn
          (old) => {
            if (!old) {
              return {
                // these properties are required because React Query handles infinite query utilizing them
                // we have to comply with the expected object structure
                pages: [],
                pageParams: [],
              };
            }

            // check if the last message is an AI response
            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            let updatedPages = old.pages.map((page) => {
              // check if the concerned page is first one in array (last in this case as we are displaying them in reverse)
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  // not an AI response - create a new message for incoming chunks
                  updatedMessages = [
                    {
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false,
                      createdAt: new Date().toISOString(),
                    },
                    ...page.messages,
                  ];
                } else {
                  // AI response - add chunks to the existing message instead of creating a new one
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }

                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              // return all the other pages as they were
              return page;
            });

            return { ...old, pages: updatedPages };
          }
        );
      }
    },

    onError: (_, __, context) => {
      // pull out the optimistically updated message from chat window and put it back into the textbox
      setMessage(backupMessage.current);

      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },

    onSettled: async () => {
      setIsLoading(false);

      // successful or not - refresh data
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  // whatever is passed here can be accessed in `mutationFn` and `onMutate` methods
  const addMessage = () => sendMessage({ message });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};
