const COLOR_MAP = {
  primary:   'var(--color-fg-primary)',
  secondary: 'var(--color-fg-secondary)',
};

const WEIGHT_MAP = {
  thin:    100,
  extralight: 200,
  light:   300,
  regular: 400,
  medium:  500,
  semibold: 600,
  bold:    700,
};

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

function toNumber(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return fallback;
}

export default function Icon({ node }) {
  const { name, size, weight, color, fill } = readProps(node);

  if (typeof name !== 'string' || name.length === 0) return null;

  const fontSize  = toNumber(size, 20);
  const weightVal = typeof weight === 'string' && weight in WEIGHT_MAP
    ? WEIGHT_MAP[weight]
    : toNumber(weight, 400);
  const fillVal   = fill === true || fill === 1 || fill === 'true' || fill === '1' ? 1 : 0;

  const resolvedColor = typeof color === 'string'
    ? (COLOR_MAP[color] ?? color)
    : 'currentColor';

  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{
        fontSize:              fontSize + 'px',
        color:                 resolvedColor,
        verticalAlign:         'middle',
        fontVariationSettings: `'FILL' ${fillVal}, 'wght' ${weightVal}, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, fontSize))}`,
      }}
    >
      {name}
    </span>
  );
}
