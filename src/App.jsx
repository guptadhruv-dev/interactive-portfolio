import { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Section from './components/Section';
import { useContent } from './hooks/useContent';

const TRIGGER_RATIO = 0.35;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const { sections, loading } = useContent();
  const [activeSection, setActiveSection] = useState('');
  const scrollRef      = useRef(null);
  const lockedRef      = useRef(false);
  const lockTimeoutRef = useRef(null);

  useEffect(() => {
    if (sections.length && !activeSection) setActiveSection(sections[0].id);
  }, [sections, activeSection]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sections.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      if (lockedRef.current) return;

      const containerTop  = container.getBoundingClientRect().top;
      const triggerOffset = container.clientHeight * TRIGGER_RATIO;
      const els           = container.querySelectorAll('section[id]');
      if (els.length === 0) return;

      const atBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 2;

      let currentId = els[0].id;
      if (atBottom) {
        currentId = els[els.length - 1].id;
      } else {
        for (const el of els) {
          if (el.getBoundingClientRect().top - containerTop <= triggerOffset) {
            currentId = el.id;
          } else {
            break;
          }
        }
      }

      setActiveSection(prev => (prev === currentId ? prev : currentId));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onScrollEnd = () => {
      lockedRef.current = false;
      update();
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('scrollend', onScrollEnd);
    update();

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('scrollend', onScrollEnd);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  const handleNavClick = useCallback((id) => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector('#' + CSS.escape(id));
    if (!target) return;

    lockedRef.current = true;
    setActiveSection(id);
    container.scrollTo({
      top:      target.offsetTop,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });

    clearTimeout(lockTimeoutRef.current);
    lockTimeoutRef.current = setTimeout(() => { lockedRef.current = false; }, 1000);
  }, []);

  useEffect(() => () => clearTimeout(lockTimeoutRef.current), []);

  if (loading) {
    return (
      <div style={{
        height:          '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: 'var(--color-bg-primary)',
        color:           'var(--color-fg-secondary)',
        fontFamily:      'var(--font-family)',
        fontSize:        '14px',
        letterSpacing:   '0.05em',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      display:         'flex',
      height:          '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      overflow:        'hidden',
    }}>
      <Sidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        sections={sections}
      />
      <main
        ref={scrollRef}
        className="content-scroll"
        style={{
          flex:            1,
          height:          '100vh',
          overflowY:       'auto',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        {sections.map((section, index) => (
          <Section
            key={section.id}
            id={section.id}
            vars={section.vars}
            content={section.content}
            isFirst={index === 0}
          />
        ))}
      </main>
    </div>
  );
}
