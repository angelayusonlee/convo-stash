
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        'animate-fade-in-up w-full py-8 border-b border-chat-border transition-all',
        isUser ? 'message-user' : 'message-assistant'
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        <div className={cn(
          "rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary text-white" : "bg-muted"
        )}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold mb-1">
            {isUser ? 'You' : 'Assistant'}
          </p>
          <div className="prose max-w-none">
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
