'use client';

import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  sending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  sending,
  disabled = false,
  placeholder = 'Tapez votre message...'
}: ChatInputProps) {
  const isEmpty = !value.trim();

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm border-t border-purple-500/20 px-4 py-4 safe-area-bottom">
      <div className="flex gap-3 items-end">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyPress={onKeyPress}
          disabled={disabled || sending}
          className={`flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 min-h-[48px] ${
            sending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Message"
        />
        <button
          onClick={onSend}
          disabled={isEmpty || disabled || sending}
          className={`min-w-[56px] h-[48px] flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 touch-manipulation ${
            sending ? 'animate-pulse' : ''
          }`}
          aria-label="Envoyer le message"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
