// Fixed scenes for screenshots, driven by the page's query string: ?shot=cover renders one cover
// alone (main.js exposes the exported PNG as window.__coverPNG), ?shot=editor opens the studio
// with a scene already loaded. Every field falls back to a sensible default, and
// window.__shotReady is set once the scene has painted.

const SIZES = ['1080x1080', '1080x1350', '1920x1080'];
const TEMPLATES = ['grid', 'strips', 'slash'];
const THEMES = ['sunset', 'neon', 'gold', 'midnight'];

/** Picks the query's value when it is one of the allowed ones, else the fallback. */
function pick(query, key, allowed, fallback) {
  const value = query.get(key);
  return allowed.includes(value) ? value : fallback;
}

/**
 * Reads a screenshot scene out of the query string, or returns null when the page was opened
 * without ?shot= (the normal editor). Photos are sample names: ?photos=pier,boulevard.
 */
export function parseShotScene(query) {
  const mode = query.get('shot');
  if (mode !== 'cover' && mode !== 'editor') return null;
  const photos = (query.get('photos') || 'pier,boulevard')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    mode,
    size: pick(query, 'size', SIZES, '1080x1080'),
    template: pick(query, 'template', TEMPLATES, 'grid'),
    theme: pick(query, 'theme', THEMES, 'sunset'),
    photos,
    title: query.get('title') || 'Vice Heat',
    subtitle: query.get('subtitle') ?? 'Welcome back to Leonida',
    gap: Number(query.get('gap')) || 10,
  };
}
