const GAME_KEY = 'cartiado_game_v1';
const THEME_KEY = 'cartiado_theme_v1';

export function loadGame() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGame(game) {
  try {
    if (game === null) {
      localStorage.removeItem(GAME_KEY);
    } else {
      localStorage.setItem(GAME_KEY, JSON.stringify(game));
    }
  } catch {
    // Armazenamento indisponível (modo privado, cota excedida etc.) — falha silenciosa.
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
