import React from 'react';
import styles from '../css/ContentRenderer.module.css';

interface ContentSegment {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'code',
      content: match[2].trimEnd(),
      language: match[1] || undefined,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return segments;
}

interface ContentRendererProps {
  content: string;
  className?: string;
}

export default function ContentRenderer({ content, className }: ContentRendererProps) {
  const segments = parseContent(content);

  return (
    <div className={`${styles.content} ${className || ''}`}>
      {segments.map((segment, index) => {
        if (segment.type === 'code') {
          return (
            <pre key={index} className={styles.codeBlock}>
              {segment.language && (
                <span className={styles.langLabel}>{segment.language}</span>
              )}
              <code>{segment.content}</code>
            </pre>
          );
        }

        return (
          <span key={index} className={styles.textBlock}>
            {segment.content.split('\n').map((line, lineIndex, arr) => (
              <React.Fragment key={lineIndex}>
                {line}
                {lineIndex < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </div>
  );
}
