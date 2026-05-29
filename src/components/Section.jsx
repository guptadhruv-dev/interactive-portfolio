import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkShortcodes, { normalizeShortcodes } from '../plugins/remarkShortcodes';
import { shortcodeComponents } from './shortcodes';

const REMARK_PLUGINS = [remarkGfm, remarkShortcodes];

export default function Section({
  id,
  label,
  content,
  isFirst = false,
}) {
  const normalized = useMemo(() => normalizeShortcodes(content), [content]);

  return (
    <section
      id={id}
      style={{
        minHeight:     '100vh',
        paddingTop:    isFirst ? '80px' : '60px',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          padding:    '0 40px',
        }}
      >
        {label ? (
          <h1
            style={{
              fontFamily:    'var(--font-family)',
              fontSize:      '42px',
              fontWeight:    700,
              lineHeight:    1.15,
              letterSpacing: '-0.02em',
              color:         'var(--color-fg-primary)',
              margin:        '0 0 32px 0',
            }}
          >
            {label}
          </h1>
        ) : null}

        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={REMARK_PLUGINS}
            components={shortcodeComponents}
          >
            {normalized}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
