import React from 'react';

// Memoized ReactMarkdown components for optimal performance
// Defined once outside render to prevent unnecessary DOM reconstruction
export const markdownComponents = {
  h1: ({children}) => (
    <h1 className="text-4xl font-bold mb-6 text-gray-900 leading-tight">
      {children}
    </h1>
  ),
  h2: ({children}) => (
    <h2 className="text-3xl font-semibold mt-12 mb-4 text-gray-900 leading-snug">
      {children}
    </h2>
  ),
  h3: ({children}) => (
    <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 leading-snug">
      {children}
    </h3>
  ),
  p: ({children}) => (
    <p className="text-base leading-relaxed mb-4 text-gray-700">
      {children}
    </p>
  ),
  blockquote: ({children}) => (
    <blockquote className="border-l-4 border-violet-500 pl-4 py-2 my-6 italic text-gray-700 bg-violet-50">
      {children}
    </blockquote>
  ),
  ul: ({children}) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({children}) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700">
      {children}
    </ol>
  ),
  li: ({children}) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  strong: ({children}) => (
    <strong className="font-semibold text-gray-900">
      {children}
    </strong>
  ),
  em: ({children}) => (
    <em className="italic text-gray-800">
      {children}
    </em>
  ),
  code: ({inline, children}) => 
    inline ? (
      <code className="px-1.5 py-0.5 bg-gray-100 text-violet-600 rounded text-sm font-mono">
        {children}
      </code>
    ) : (
      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono">
        {children}
      </code>
    ),
  a: ({href, children}) => (
    <a href={href} className="text-violet-600 hover:text-violet-700 underline">
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-gray-200" />
};