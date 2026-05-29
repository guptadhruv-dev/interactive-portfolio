import { useState, useId } from 'react';

const TYPE_STYLES = {
  h1:   { fontSize: '2.25em',  fontWeight: 700, lineHeight: 1.2 },
  h2:   { fontSize: '1.5em',   fontWeight: 700, lineHeight: 1.3 },
  h3:   { fontSize: '1.25em',  fontWeight: 600, lineHeight: 1.3 },
  h4:   { fontSize: '1.125em', fontWeight: 600, lineHeight: 1.4 },
  h5:   { fontSize: '1em',     fontWeight: 600, lineHeight: 1.4 },
  h6:   { fontSize: '0.875em', fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: '1em',     fontWeight: 400, lineHeight: 1.4 },
};

const DEFAULT_TYPE = 'body';

function readProps(node) {
  const raw = node?.properties?.dataProps;
  if (typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function Toggle({ node, children }) {
  const props      = readProps(node);
  const label      = typeof props.label === 'string' ? props.label : '';
  const startsOpen = props.default === 'open';
  const type       = typeof props.type === 'string' && props.type in TYPE_STYLES
    ? props.type
    : DEFAULT_TYPE;
  const typeStyle  = TYPE_STYLES[type];

  const [open, setOpen] = useState(startsOpen);
  const contentId       = useId();

  return (
    <div style={{ margin: '12px 0' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.4em',
          width:      '100%',
          padding:    '6px 0',
          margin:     0,
          background: 'transparent',
          border:     'none',
          color:      'var(--color-fg-primary)',
          cursor:     'pointer',
          fontFamily: 'inherit',
          fontSize:   typeStyle.fontSize,
          fontWeight: typeStyle.fontWeight,
          lineHeight: typeStyle.lineHeight,
          textAlign:  'left',
        }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize:              '0.9em',
            color:                 'var(--color-fg-secondary)',
            transform:             open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition:            'transform var(--motion-duration) var(--motion-ease)',
            flexShrink:            0,
            fontVariationSettings: `'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24`,
          }}
        >
          chevron_right
        </span>
        <span>{label}</span>
      </button>

      <div
        id={contentId}
        aria-hidden={!open}
        style={{
          display:          'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition:       'grid-template-rows var(--motion-duration) var(--motion-ease)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{ paddingLeft: '26px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
