'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { parseInlineContent, ParsedInlineNode } from '@/lib/chat/chat-helpers';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Lightweight, safe, zero-dependency Markdown renderer for chat messages.
 * Formats bold, italics, inline code, clickable links/emails/URLs, bullet lists,
 * and paragraphs cleanly adhering to the Arctic Ice palette.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split text into blocks by line
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

    // Bullet List (- or * or •)
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
 * Recursively renders a parsed inline node into React elements.
 */
function renderNode(node: ParsedInlineNode, key: string | number): React.ReactNode {
  switch (node.type) {
    case 'code':
      return (
        <code
          key={key}
          className="bg-[#B9E7E6]/40 px-1 py-0.5 rounded text-[11px] font-mono text-[#0c282d]"
        >
          {node.content}
        </code>
      );
    case 'bold':
      return (
        <strong key={key} className="font-semibold text-[#0c282d]">
          {node.children && node.children.length > 0
            ? node.children.map((c, i) => renderNode(c, `${key}-b-${i}`))
            : node.content}
        </strong>
      );
    case 'italic':
      return (
        <em key={key} className="italic text-[#2d5a63]">
          {node.content}
        </em>
      );
    case 'link':
      return (
        <a
          key={key}
          href={node.href}
          target={node.isExternal ? '_blank' : undefined}
          rel={node.isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-0.5 font-medium text-[#0284c7] hover:text-[#0369a1] underline decoration-[#6FD4E1]/80 hover:decoration-[#0284c7] underline-offset-2 transition-colors cursor-pointer break-all"
        >
          <span>{node.content}</span>
          {node.isExternal && (
            <ExternalLink className="w-2.5 h-2.5 inline-block opacity-70 shrink-0 ml-0.5" />
          )}
        </a>
      );
    case 'text':
    default:
      return node.content;
  }
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and links without breaking underscores.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes = parseInlineContent(text);
  return nodes.map((node, idx) => renderNode(node, idx));
}
