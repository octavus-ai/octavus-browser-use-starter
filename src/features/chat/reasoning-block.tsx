'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasoningBlockProps {
  content: string;
  isStreaming: boolean;
}

/**
 * Collapsible block for displaying AI reasoning/thinking.
 * Expanded when streaming, collapsed when done. Auto-scrolls while streaming.
 */
export function ReasoningBlock({ content, isStreaming }: ReasoningBlockProps) {
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevIsStreamingRef = useRef(isStreaming);

  useEffect(() => {
    if (prevIsStreamingRef.current !== isStreaming) {
      prevIsStreamingRef.current = isStreaming;
      setUserOverride(null);
    }
  }, [isStreaming]);

  const isExpanded = userOverride ?? isStreaming;

  function handleToggle() {
    setUserOverride(!isExpanded);
  }

  // Auto-scroll content while streaming
  useEffect(() => {
    if (isStreaming && isExpanded && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming, isExpanded]);

  return (
    <div className="reasoning-block mb-2">
      <div
        className={cn(
          'overflow-hidden rounded-lg border',
          isStreaming
            ? 'border-violet-500/30 bg-violet-500/10'
            : 'border-violet-500/20 bg-violet-500/5'
        )}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-violet-500/10"
        >
          <Lightbulb
            className={cn('h-4 w-4 text-violet-400', isStreaming && 'animate-pulse')}
          />
          <span className="text-sm font-medium text-violet-400">
            {isStreaming ? 'Thinking...' : 'Thought process'}
          </span>
          {!isStreaming && <Check className="h-3 w-3 text-emerald-400" />}
          {isExpanded ? (
            <ChevronDown className="ml-auto h-3 w-3 text-violet-400" />
          ) : (
            <ChevronRight className="ml-auto h-3 w-3 text-violet-400" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-violet-500/20 px-3 py-2">
            <div ref={contentRef} className="max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-violet-300/80">
                {content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
