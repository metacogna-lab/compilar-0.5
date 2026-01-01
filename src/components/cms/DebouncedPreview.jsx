import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from './MarkdownComponents';

// Memoized preview component to prevent unnecessary re-renders
const DebouncedPreview = memo(({ content }) => {
  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className="flex-1 overflow-y-auto bg-white border border-white/10 rounded-lg p-8">
      <article className="max-w-none prose prose-slate">
        <ReactMarkdown components={markdownComponents}>
          {debouncedContent || '*Start typing to see preview...*'}
        </ReactMarkdown>
      </article>
    </div>
  );
});

DebouncedPreview.displayName = 'DebouncedPreview';

export default DebouncedPreview;