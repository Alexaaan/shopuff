'use client';

import { X, ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  orderId: number;
  isConnected: boolean;
  canCancel: boolean;
  onClose: () => void;
  onCancelOrder: () => void;
}

export function ChatHeader({ orderId, isConnected, canCancel, onClose, onCancelOrder }: ChatHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-purple-500/50 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Retour</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">Commande #{orderId}</h3>
            <p className="text-xs text-slate-400">Support client</p>
          </div>
        </div>

        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={onCancelOrder}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50 active:scale-95"
              title="Annuler la commande"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Annuler</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
