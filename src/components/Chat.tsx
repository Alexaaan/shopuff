// Chat component - backward compatibility wrapper
import dynamic from 'next/dynamic';

const ChatPage = dynamic(() => import('./ChatPage'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Chargement du chat...</p>
      </div>
    </div>
  )
});

export default ChatPage;

// Re-export types for backward compatibility
export type { ChatPageProps as ChatProps } from './ChatPage';
