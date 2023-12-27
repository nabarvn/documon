"use client";

import { Send } from "lucide-react";
import { useContext, useRef } from "react";
import { ChatContext } from "@/context/chat";
import { Button, Textarea } from "@/components/ui";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const focusTextarea = () => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 10);
  };

  return (
    <div className='absolute bottom-0 left-0 w-full'>
      <form className='flex flex-row gap-3 mx-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl'>
        <div className='relative flex h-full flex-1 items-stretch md:flex-col'>
          <div className='relative flex flex-col w-full flex-grow p-4'>
            <div className='relative'>
              <Textarea
                rows={1}
                maxRows={4}
                autoFocus
                ref={textareaRef}
                disabled={isLoading || isDisabled}
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    textareaRef.current?.value.trim() !== ""
                  ) {
                    e.preventDefault();
                    addMessage();
                    focusTextarea();
                  }
                }}
                placeholder='Enter your question...'
                className='resize-none text-base scrollbar-thumb-gray scrollbar-thumb-rounded scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch pr-12 py-3'
              />

              <Button
                size='sm'
                type='submit'
                aria-label='send message'
                disabled={isLoading || isDisabled}
                onClick={(e) => {
                  e.preventDefault();

                  if (textareaRef.current?.value.trim() !== "") {
                    addMessage();
                    focusTextarea();
                  }
                }}
                className='absolute bottom-[7px] right-[7px]'
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
