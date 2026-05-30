import { GithubLogo, LinkedinLogo, EnvelopeSimple, DownloadSimple } from '@phosphor-icons/react';

const links = [
  { Icon: GithubLogo,     href: 'https://github.com/guptadhruv-dev',                       label: 'GitHub'   },
  { Icon: LinkedinLogo,   href: 'https://www.linkedin.com/in/dhruv-g-1343a5317',     label: 'LinkedIn' },
  { Icon: EnvelopeSimple, href: 'mailto:connect@guptadhruv.dev',                     label: 'Email'    },
  { Icon: DownloadSimple, href: '/Resume.pdf',                                       label: 'Resume'   },
];

const M         = 'var(--motion-duration) var(--motion-ease)';
const ICON_SIZE = 22;
const ROW_GAP   = 20;
const STEP_PCT  = 100 / (links.length - 1);
const STACK_HEIGHT = links.length * ICON_SIZE + (links.length - 1) * ROW_GAP;

const morphTransition = `top ${M}, left ${M}, transform ${M}, color ${M}`;

export default function Links({ vertical = false }) {
  return (
    <div
      style={{
        position:   'relative',
        width:      '100%',
        height:     vertical ? STACK_HEIGHT : ICON_SIZE,
        flexShrink: 0,
        transition: `height ${M}`,
      }}
    >
      {links.map(({ Icon, href, label }, i) => {
        const horizontalPct = i * STEP_PCT;
        return (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith('mailto') ? undefined : '_blank'}
            rel="noreferrer"
            style={{
              position:       'absolute',
              top:            vertical ? i * (ICON_SIZE + ROW_GAP) : 0,
              left:           vertical ? '50%' : `${horizontalPct}%`,
              transform:      vertical ? 'translateX(-50%)' : `translateX(${-horizontalPct}%)`,
              width:          ICON_SIZE,
              height:         ICON_SIZE,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          'var(--color-fg-secondary)',
              transition:     morphTransition,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-fg-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-fg-secondary)')}
          >
            <Icon size={ICON_SIZE} weight="fill" />
          </a>
        );
      })}
    </div>
  );
}
