'use client';

import { Check, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  msg: Message;
  isUser: boolean;
  onRetry: () => void;
}

function StatusIcon({ status }: { status: string | undefined }) {
  if (!status) return null;

  const iconClass = 'w-3 h-3';

  switch (status) {
    case 'sending':
      return <Loader2 className={`${iconClass} animate-spin text-white/70`} />;
    case 'sent':
      return <Check className={`${iconClass} text-white/70`} />;
    case 'delivered':
      return <CheckCheck className={`${iconClass} text-white/70`} />;
    case 'read':
      return <CheckCheck className={`${iconClass} text-blue-300`} />;
    case 'failed':
      return <AlertCircle className={`${iconClass} text-red-300`} />;
    default:
      return null;
  }
}

export function MessageBubble({ msg, isUser, onRetry }: MessageBubbleProps) {
  const isFailed = msg.status === 'failed';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
            : 'bg-slate-700/50 text-slate-200 rounded-bl-sm border border-slate-600/50'
        } ${isFailed ? 'border border-red-400/50' : ''}`}
      >
        {isFailed && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${isUser ? 'text-purple-100' : 'text-purple-300'}`}>
            {msg.users ? `${msg.users.prenom} ${msg.users.nom}` : 'Vous'}
          </span>
          <StatusIcon status={msg.status} />
        </div>

        <p className="text-sm leading-relaxed">{msg.message}</p>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <p className={`text-xs ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Paris'
            })}
          </p>
          {isFailed && (
            <button onClick={onRetry} className="text-xs text-purple-300 hover:text-purple-200 underline">
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
