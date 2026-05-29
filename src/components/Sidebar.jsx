import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SectionButton from './SectionButton';
import Divider from './Divider';
import Links from './Links';
import ThemeToggle from './ThemeToggle';

const avatarModules = import.meta.glob(
  '../assets/avatar.{png,jpg,jpeg,webp,svg,gif,avif}',
  { eager: true, import: 'default' }
);
const avatarSrc = Object.values(avatarModules)[0] ?? null;

const M                = 'var(--motion-duration) var(--motion-ease)';
const MOBILE_QUERY     = '(max-width: 767px)';
const TOP_BTN_SIZE     = 32;
const TOP_GAP          = 20;
const COLUMN_MAX_WIDTH = 280;
const AVATAR_MIN_SIZE  = 48;
const AVATAR_MAX_SIZE  = COLUMN_MAX_WIDTH;
const DIVIDER_HEIGHT   = 2.5;
const MIN_CONTENT_GAP  = 12;
const CONTENT_GAP      = 'clamp(12px, 2vh, 20px)';

function detectMobile() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

function fadeTransition(visible) {
  return `opacity ${M}, transform ${M}, visibility 0s linear ${visible ? '0s' : 'var(--motion-duration)'}`;
}

function readPx(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function Sidebar({ activeSection, onNavClick, sections = [] }) {
  const [isMobile,  setIsMobile]  = useState(detectMobile);
  const [collapsed, setCollapsed] = useState(false);
  const [avatarSize, setAvatarSize] = useState(AVATAR_MAX_SIZE);

  const middleRef          = useRef(null);
  const expandedContentRef = useRef(null);
  const identityRef        = useRef(null);
  const titleRef           = useRef(null);
  const navRef             = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      setCollapsed(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    const middle   = middleRef.current;
    const content  = expandedContentRef.current;
    const identity = identityRef.current;
    const title    = titleRef.current;
    const nav      = navRef.current;

    if (!middle || !content || !identity || !title || !nav) return;

    let frame = 0;

    const measure = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;

        const contentStyle  = window.getComputedStyle(content);
        const identityStyle = window.getComputedStyle(identity);
        const contentGap    = readPx(contentStyle.rowGap || contentStyle.gap, MIN_CONTENT_GAP);
        const identityGap   = readPx(identityStyle.rowGap || identityStyle.gap, MIN_CONTENT_GAP);

        const fixedHeight =
          title.offsetHeight +
          nav.offsetHeight +
          DIVIDER_HEIGHT * 2 +
          contentGap * 3 +
          identityGap;

        const widthLimit = Math.min(middle.clientWidth, AVATAR_MAX_SIZE);
        const available  = middle.clientHeight - fixedHeight;
        const nextSize   = Math.round(
          Math.max(AVATAR_MIN_SIZE, Math.min(widthLimit, AVATAR_MAX_SIZE, available))
        );

        setAvatarSize((prev) => (Math.abs(prev - nextSize) > 1 ? nextSize : prev));
      });
    };

    measure();

    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(measure)
      : null;

    if (observer) {
      observer.observe(middle);
      observer.observe(content);
      observer.observe(identity);
      observer.observe(title);
      observer.observe(nav);
    }

    window.addEventListener('resize', measure);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [sections.length, collapsed, isMobile]);

  const toggleSidebar = () => setCollapsed((v) => !v);

  const navigate = (id) => {
    onNavClick(id);
    if (isMobile && !collapsed) setCollapsed(true);
  };

  const expandedWidth = isMobile ? '100vw' : 'var(--sidebar-width)';
  const sidebarWidth  = collapsed ? 'var(--sidebar-collapsed-width)' : expandedWidth;
  const sidebarPad    = collapsed ? '48px 16px' : '48px 28px';

  const morphTransition = `top ${M}, left ${M}, transform ${M}`;

  return (
    <aside
      style={{
        width:           sidebarWidth,
        minWidth:        sidebarWidth,
        height:          '100vh',
        position:        'sticky',
        top:             0,
        backgroundColor: 'var(--color-bg-secondary)',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'space-evenly',
        alignItems:      'center',
        padding:         sidebarPad,
        flexShrink:      0,
        zIndex:          10,
        overflow:        'hidden',
        gap:             '25px',
        transition:      `width ${M}, min-width ${M}, padding ${M}`,
      }}
    >
      <div style={{
        position:   'relative',
        width:      '100%',
        maxWidth:   COLUMN_MAX_WIDTH,
        height:     collapsed ? TOP_BTN_SIZE * 2 + TOP_GAP : TOP_BTN_SIZE,
        flexShrink: 0,
        transition: `height ${M}`,
      }}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position:       'absolute',
            top:            0,
            left:           collapsed ? '50%' : 0,
            transform:      collapsed ? 'translateX(-50%)' : 'translateX(0)',
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          TOP_BTN_SIZE,
            height:         TOP_BTN_SIZE,
            padding:        0,
            background:     'transparent',
            border:         'none',
            borderRadius:   6,
            cursor:         'pointer',
            color:          'var(--color-fg-secondary)',
            transition:     `${morphTransition}, color ${M}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-fg-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-secondary)'; }}
        >
          <span style={{ display: 'inline-grid', placeItems: 'center' }}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                gridArea:              '1 / 1',
                fontSize:              '24px',
                lineHeight:            1,
                opacity:               collapsed ? 0 : 1,
                transform:             collapsed ? 'rotate(-90deg) scale(0.7)' : 'rotate(0deg) scale(1)',
                transition:            `opacity ${M}, transform ${M}`,
                fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              chevron_left
            </span>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                gridArea:              '1 / 1',
                fontSize:              '24px',
                lineHeight:            1,
                opacity:               collapsed ? 1 : 0,
                transform:             collapsed ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.7)',
                transition:            `opacity ${M}, transform ${M}`,
                fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              menu
            </span>
          </span>
        </button>

        <div style={{
          position:   'absolute',
          top:        collapsed ? TOP_BTN_SIZE + TOP_GAP : 0,
          left:       collapsed ? '50%' : '100%',
          transform:  collapsed ? 'translateX(-50%)' : 'translateX(-100%)',
          transition: morphTransition,
        }}>
          <ThemeToggle />
        </div>
      </div>

      <div style={{
        position: 'relative',
        width:    '100%',
        maxWidth: COLUMN_MAX_WIDTH,
        flex:     1,
        minHeight: 0,
      }}
      ref={middleRef}
      >
        <div
          ref={expandedContentRef}
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'space-evenly',
            gap:            CONTENT_GAP,
            opacity:        collapsed ? 0 : 1,
            transform:      collapsed ? 'scale(0.94)' : 'scale(1)',
            visibility:     collapsed ? 'hidden' : 'visible',
            pointerEvents:  collapsed ? 'none' : 'auto',
            overflow:       'hidden',
            transition:     fadeTransition(!collapsed),
          }}
        >
          <div
            ref={identityRef}
            style={{
              width:         '100%',
              minHeight:     0,
              flex:          '0 1 auto',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           CONTENT_GAP,
            }}
          >
            <div style={{
              width:           avatarSize,
              height:          avatarSize,
              maxWidth:        '100%',
              maxHeight:       avatarSize,
              aspectRatio:     '1/1',
              flexShrink:      0,
              borderRadius:    '14px',
              overflow:        'hidden',
              backgroundColor: avatarSrc ? 'transparent' : 'var(--color-fg-secondary)',
              opacity:         avatarSrc ? 1 : 0.15,
            }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Dhruv Gupta"
                  style={{
                    width:     '100%',
                    height:    '100%',
                    objectFit: 'cover',
                    display:   'block',
                  }}
                />
              ) : null}
            </div>
            <h1
              ref={titleRef}
              style={{
                fontFamily:    'var(--font-family)',
                fontSize:      '24px',
                fontWeight:    '800',
                color:         'var(--color-fg-primary)',
                margin:        0,
                textAlign:     isMobile ? 'center' : 'left',
                width:         '100%',
                flexShrink:    0,
              }}
            >
              DHRUV<br />GUPTA
            </h1>
          </div>

          <Divider style={{ flexShrink: 0, width: avatarSize }} />

          <nav
            ref={navRef}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           CONTENT_GAP,
              width:         '100%',
              flexShrink:    0,
            }}
          >
            {sections.map(({ id, label }) => (
              <SectionButton
                key={id}
                label={label}
                isActive={activeSection === id}
                onClick={() => navigate(id)}
                align={isMobile ? 'center' : 'left'}
              />
            ))}
          </nav>

          <Divider style={{ flexShrink: 0, width: avatarSize }} />
        </div>

        <nav style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            CONTENT_GAP,
          width:          '100%',
          minHeight:      0,
          opacity:        collapsed ? 1 : 0,
          transform:      collapsed ? 'scale(1)' : 'scale(0.94)',
          visibility:     collapsed ? 'visible' : 'hidden',
          pointerEvents:  collapsed ? 'auto' : 'none',
          overflow:       'hidden',
          transition:     fadeTransition(collapsed),
        }}>
          <Divider style={{ flexShrink: 0 }} />
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent: 'center',
            gap:           CONTENT_GAP,
            width:         '100%',
            minHeight:     0,
            flex:          '0 1 auto',
          }}>
            {sections.map(({ id }) => (
              <SectionButton
                key={id}
                label={id}
                isActive={activeSection === id}
                onClick={() => navigate(id)}
                align="center"
              />
            ))}
          </div>
          <Divider style={{ flexShrink: 0 }} />
        </nav>
      </div>

      <div style={{ width: avatarSize, flexShrink: 0 }}>
        <Links vertical={collapsed} />
      </div>
    </aside>
  );
}
