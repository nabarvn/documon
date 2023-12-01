import { Send } from "lucide-react";
import { Button, Textarea } from "@/components/ui";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
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
                placeholder='Enter your question...'
                className='resize-none text-base scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch pr-12 py-3'
              />

              <Button
                aria-label='send message'
                className='absolute bottom-1.5 right-[8px]'
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
