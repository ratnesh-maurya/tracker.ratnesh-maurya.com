export type Theme = 'light' | 'dark';

const KEY = 'theme';
// Older builds stored a boolean under this key.
const LEGACY_KEY = 'darkMode';

// Runs before first paint (inlined in app/layout.tsx) so the page never flashes
// the wrong theme. Dark is the default; the server always renders dark.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){var l=localStorage.getItem('${LEGACY_KEY}');t=l==='false'?'light':'dark';localStorage.setItem('${KEY}',t);localStorage.removeItem('${LEGACY_KEY}')}document.documentElement.dataset.theme=t}catch(e){}})();`;

export function getTheme(): Theme {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    document
        .querySelector('meta[name="theme-color"]:not([media])')
        ?.setAttribute('content', theme === 'dark' ? '#0E0D0B' : '#FBFAF7');
    try {
        localStorage.setItem(KEY, theme);
    } catch {}
}
