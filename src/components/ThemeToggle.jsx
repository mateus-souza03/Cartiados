export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Alternar tema"
      title="Alternar tema claro/escuro"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
