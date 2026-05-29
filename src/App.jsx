import { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Section from './components/Section';
import { useContent } from './hooks/useContent';

const TRIGGER_RATIO = 0.35;
const SNAP_DURATION = 800;

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export default function App() {
  const { sections, loading } = useContent();
  const [activeSection, setActiveSection] = useState('');
  const scrollRef = useRef(null);
  const lockedRef = useRef(false);
  const rafRef    = useRef(null);

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

    container.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      container.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  const animateToSection = useCallback((id) => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector('#' + CSS.escape(id));
    if (!target) return;

    const from = container.scrollTop;
    const to   = target.offsetTop;
    if (Math.abs(from - to) < 1) return;

    cancelAnimationFrame(rafRef.current);
    lockedRef.current = true;
    setActiveSection(id);

    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / SNAP_DURATION, 1);
      container.scrollTop = from + (to - from) * easeInOutQuart(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        container.scrollTop = to;
        lockedRef.current   = false;
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const handleNavClick = useCallback((id) => {
    animateToSection(id);
  }, [animateToSection]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sections.length === 0) return;

    const onWheel = (e) => {
      if (lockedRef.current) {
        e.preventDefault();
        return;
      }

      const sectionEls = sections
        .map(s => container.querySelector('#' + CSS.escape(s.id)))
        .filter(Boolean);

      const containerTop = container.getBoundingClientRect().top;
      let idx = 0;
      for (let i = 0; i < sectionEls.length; i++) {
        if (sectionEls[i].getBoundingClientRect().top - containerTop <= container.clientHeight * 0.5) {
          idx = i;
        } else {
          break;
        }
      }

      const el = sectionEls[idx];
      if (!el) return;

      if (e.deltaY > 0 && idx < sections.length - 1) {
        const atBottom =
          container.scrollTop + container.clientHeight >= el.offsetTop + el.offsetHeight - 2;
        if (atBottom) {
          e.preventDefault();
          animateToSection(sections[idx + 1].id);
        }
      } else if (e.deltaY < 0 && idx > 0) {
        const atTop = container.scrollTop <= el.offsetTop + 2;
        if (atTop) {
          e.preventDefault();
          animateToSection(sections[idx - 1].id);
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [sections, animateToSection]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

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
            label={section.label}
            content={section.content}
            isFirst={index === 0}
          />
        ))}
      </main>
    </div>
  );
}
