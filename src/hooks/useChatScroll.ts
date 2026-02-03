import { useCallback, useEffect, useRef } from 'react';

interface UseChatScrollOptions {
  loading: boolean;
  messagesCount: number;
}

export function useChatScroll({ loading, messagesCount }: UseChatScrollOptions) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!loading && messagesCount > 0) {
      scrollToBottom();
    }
  }, [loading, messagesCount, scrollToBottom, messagesCount]);

  return { messagesEndRef, scrollToBottom };
}
