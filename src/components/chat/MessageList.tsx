'use client';

import { forwardRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { isUserMessage } from '@/hooks/useChatMessages';

interface MessageListProps {
  messages: Message[];
  orderUserId?: number;
  onRetry: (clientId: string, text: string) => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList({ messages, orderUserId, onRetry }, ref) {
    if (messages.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-slate-400">Aucun message pour le moment</p>
          <p className="text-slate-500 text-sm mt-1">Envoyez le premier message !</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isUser={isUserMessage(msg, orderUserId)}
            onRetry={() => msg.client_id && onRetry(msg.client_id, msg.message)}
          />
        ))}
        <div ref={ref} />
      </div>
    );
  }
);
