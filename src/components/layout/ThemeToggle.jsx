import { useTheme } from '../../context/ThemeContext';

const MoonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3a7 7 0 1 0 11.3 11.3Z" />
  </svg>
);

const SunIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
    <path
      strokeWidth="1.8"
      strokeLinecap="round"
      d="M12 3v1.6M12 19.4V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.6M19.4 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1"
    />
  </svg>
);

export const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="relative h-8 w-14 shrink-0 rounded-full bg-[#0d0d0d] p-1 ring-1 ring-white/15"
    >
      <span
        className="theme-thumb pointer-events-none absolute top-1 left-1 h-6 w-6 rounded-full bg-[#efeae3] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isDark ? 'translateX(0)' : 'translateX(24px)' }}
      />
      <span className="relative z-10 grid h-full grid-cols-2 items-center">
        <MoonIcon
          className={`mx-auto h-3.5 w-3.5 transition-colors duration-300 ${
            isDark ? 'text-ember' : 'text-white/35'
          }`}
        />
        <SunIcon
          className={`mx-auto h-3.5 w-3.5 transition-colors duration-300 ${
            isDark ? 'text-white/35' : 'text-ember'
          }`}
        />
      </span>
    </button>
  );
};
