'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

export function StartChatButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-lg font-medium text-white transition-all hover:bg-emerald-500 hover:gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          Start Chatting
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
