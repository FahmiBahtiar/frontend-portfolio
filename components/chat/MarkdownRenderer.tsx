'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Lightweight, safe, zero-dependency Markdown renderer for chat messages.
 * Formats bold, italics, inline code, bullet lists, and paragraphs cleanly
 * adhering to the Arctic Ice palette.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split text into blocks by double newline (or single if bullet list)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let elementKey = 0;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag key={`list-${elementKey++}`} className="space-y-1.5 my-2 pl-1">
        {currentList.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 leading-relaxed">
            {currentList?.type === 'ul' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FD4E1] mt-1.5 shrink-0 shadow-xs" />
            ) : (
              <span className="text-[11px] font-semibold text-[#2d5a63] shrink-0 mt-0.5">
                {idx + 1}.
              </span>
            )}
            <div className="flex-1 min-w-0">{renderInline(item)}</div>
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule
    if (/^---+$|^\*\*\*+$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${elementKey++}`} className="my-2.5 border-[#B9E7E6]" />);
      continue;
    }

    // Bullet List (- or *)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (currentList && currentList.type !== 'ul') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered List (1. or 2.)
    const numberMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numberMatch) {
      if (currentList && currentList.type !== 'ol') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // Normal line or heading
    flushList();

    // Markdown Heading (## or ###)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${elementKey++}`} className="font-bold text-xs text-[#0c282d] mt-2.5 mb-1">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${elementKey++}`} className="font-bold text-sm text-[#0c282d] mt-3 mb-1.5">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
    } else {
      elements.push(
        <p key={`p-${elementKey++}`} className="leading-relaxed my-1">
          {renderInline(trimmed)}
        </p>
      );
    }
  }

  flushList();

  return <div className="space-y-1 text-xs text-[#0c282d] break-words">{elements}</div>;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and plain text.
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex splitting by bold (**...**), italic (*...* or _..._), and code (`...`)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|_.*?_)/g;
  const segments = text.split(regex);

  segments.forEach((seg, idx) => {
    if (!seg) return;

    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      parts.push(
        <strong key={idx} className="font-semibold text-[#0c282d]">
          {seg.slice(2, -2)}
        </strong>
      );
    } else if (
      (seg.startsWith('*') && seg.endsWith('*') && seg.length >= 2) ||
      (seg.startsWith('_') && seg.endsWith('_') && seg.length >= 2)
    ) {
      parts.push(
        <em key={idx} className="italic text-[#2d5a63]">
          {seg.slice(1, -1)}
        </em>
      );
    } else if (seg.startsWith('`') && seg.endsWith('`') && seg.length >= 2) {
      parts.push(
        <code
          key={idx}
          className="bg-[#B9E7E6]/40 px-1 py-0.5 rounded text-[11px] font-mono text-[#0c282d]"
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(seg);
    }
  });

  return parts;
}
