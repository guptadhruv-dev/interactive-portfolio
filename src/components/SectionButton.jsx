const M = 'var(--motion-duration) var(--motion-ease)';

export default function SectionButton({ label, isActive, onClick, align = 'left' }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    'var(--font-family)',
        fontSize:      'var(--text-nav-size)',
        fontWeight:    isActive ? '600' : 'var(--text-nav-weight)',
        lineHeight:    'var(--text-nav-lh)',
        color:         isActive ? 'var(--color-fg-primary)' : 'var(--color-fg-secondary)',
        background:    'none',
        border:        'none',
        cursor:        'pointer',
        padding:       '0',
        textAlign:     align,
        transition:    `color ${M}, opacity ${M}, font-weight ${M}`,
        display:       'block',
        width:         '100%',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => {
        if (!isActive) e.target.style.color = 'var(--color-fg-primary)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.target.style.color = 'var(--color-fg-secondary)';
      }}
    >
      {label}
    </button>
  );
}
