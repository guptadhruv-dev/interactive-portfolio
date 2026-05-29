import { useState, useEffect } from 'react';

const GIST_URL =
  'https://gist.githubusercontent.com/dhrvgpta/a6836ceaa780a75069224c00aaa77fd4/raw/profile.md';

const SECTION_RE = /::section\{((?:[^"}]|"(?:[^"\\]|\\.)*")*)\}/g;
const FENCE_RE   = /^(`{3,}|~{3,})/;
const ID_RE      = /\bid\s*:\s*(\d+)/;
const LABEL_RE   = /\blabel\s*:\s*"((?:[^"\\]|\\.)*)"/;

function parseSectionProps(input) {
  const out = { id: null, label: null };
  if (typeof input !== 'string') return out;

  const idMatch = input.match(ID_RE);
  if (idMatch) out.id = idMatch[1];

  const labelMatch = input.match(LABEL_RE);
  if (labelMatch) out.label = labelMatch[1].replace(/\\(["\\])/g, '$1');

  return out;
}

function findSectionMarkers(raw) {
  const lines  = raw.split('\n');
  const markers = [];
  let inFence   = false;
  let fenceChar = '';
  let offset    = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const fence   = trimmed.match(FENCE_RE);

    if (fence) {
      if (!inFence) {
        inFence   = true;
        fenceChar = fence[1][0];
      } else if (trimmed.startsWith(fenceChar.repeat(3))) {
        inFence = false;
      }
    } else if (!inFence) {
      SECTION_RE.lastIndex = 0;
      let m;
      while ((m = SECTION_RE.exec(line)) !== null) {
        markers.push({
          start: offset + m.index,
          end:   offset + m.index + m[0].length,
          inner: m[1],
        });
      }
    }

    offset += line.length + 1;
  }

  return markers;
}

function parseContent(raw) {
  const markers  = findSectionMarkers(raw);
  const sections = [];

  for (let i = 0; i < markers.length; i++) {
    const { end, inner }  = markers[i];
    const nextStart       = i + 1 < markers.length ? markers[i + 1].start : raw.length;
    const { id, label }   = parseSectionProps(inner);
    if (id == null || label == null) continue;

    const content = raw.slice(end, nextStart).trim();
    sections.push({ id, label, content });
  }

  return sections.sort((a, b) => Number(a.id) - Number(b.id));
}

export function useContent() {
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(GIST_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch content (' + res.status + ')');
        return res.text();
      })
      .then(raw => {
        setSections(parseContent(raw));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { sections, loading };
}
