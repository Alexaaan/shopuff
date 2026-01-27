'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderUserChatsProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const HeaderUserChats: React.FC<HeaderUserChatsProps> = ({
  showBackButton = true,
  onBack
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Back Button & Breadcrumbs */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="group flex items-center gap-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/25"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Retour</span>
                </button>
              )}

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  href="/"
                  className="text-slate-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Accueil
                </Link>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-purple-300 font-medium">Mes conversations</span>
              </nav>
            </div>

            {/* Center Section - Title */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Mes conversations</h1>
                  <p className="text-slate-400 text-sm">Support et suivi de commandes</p>
                </div>
              </div>
            </div>

            {/* Right Section - Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm text-slate-300 hidden sm:inline">En ligne</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};