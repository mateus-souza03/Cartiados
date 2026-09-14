import ThemeToggle from '../components/ThemeToggle';

export default function Home({ theme, onToggleTheme, onNewGame, onContinue, hasSavedGame }) {
  return (
    <div className="home">
      <div className="home-top">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="home-content">
        <div className="home-emblem">🃏</div>
        <h1 className="home-title">Cartiado</h1>
        <p className="home-subtitle">Marcador de pontos para jogos de cartas ao estilo Truco</p>

        <div className="home-actions">
          {hasSavedGame && (
            <button type="button" className="btn btn-primary btn-block" onClick={onContinue}>
              Continuar partida
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-block" onClick={onNewGame}>
            Nova partida
          </button>
        </div>
      </div>
    </div>
  );
}
