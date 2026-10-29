"use client";

import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { ChatContext } from "@/context/chat";
import { MAX_INPUT_LENGTH } from "@/config/chat";
import { Button, Textarea } from "@/components/ui";
import { useContext, useEffect, useRef } from "react";

interface ChatInputProps {
  isDisabled?: boolean;
}

const hasFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const isTooLong = message.length > MAX_INPUT_LENGTH;

  useEffect(() => {
    if (isDisabled || !hasFinePointer()) return;
    textareaRef.current?.focus();
  }, [isDisabled]);

  const focusTextarea = () => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 10);
  };

  return (
    <div className="absolute bottom-0 left-0 bg-zinc-50 w-full">
      <form className="mx-2 flex flex-row gap-3 md:mx-4">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                maxRows={4}
                ref={textareaRef as never}
                disabled={isLoading || isDisabled}
                onChange={handleInputChange}
                value={message}
                aria-invalid={isTooLong}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    hasFinePointer() &&
                    !isTooLong &&
                    textareaRef.current?.value.trim() !== ""
                  ) {
                    e.preventDefault();
                    addMessage();
                    focusTextarea();
                  }
                }}
                placeholder="Enter your question..."
                className={cn(
                  "resize-none text-base chat-scrollbar-thumb-gray chat-scrollbar-thumb-rounded chat-scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch pr-14 py-3",
                  isTooLong && "focus-visible:ring-red-500",
                )}
              />

              <Button
                size="sm"
                type="submit"
                aria-label="send message"
                disabled={isLoading || isDisabled || isTooLong}
                onClick={(e) => {
                  e.preventDefault();

                  if (textareaRef.current?.value.trim() !== "") {
                    addMessage();
                    focusTextarea();
                  }
                }}
                className="absolute bottom-[7px] right-[7px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isTooLong ? (
              <p
                role="alert"
                className="mt-2 flex justify-between text-xs text-destructive-foreground"
              >
                <span>Message is too long.</span>

                <span>
                  {message.length}/{MAX_INPUT_LENGTH}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
