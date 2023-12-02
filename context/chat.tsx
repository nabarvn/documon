import { useMutation } from "@tanstack/react-query";
import { ReactNode, createContext, useState } from "react";

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
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    // TODO: implement rest of the required methods
  });

  // whatever is passed here can be accessed in `mutationFn` method
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
