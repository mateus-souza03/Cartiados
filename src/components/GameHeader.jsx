import ThemeToggle from './ThemeToggle';
import { getGameType } from '../utils/gameTypes';

export default function GameHeader({
  round,
  roundLabel = 'Rodada',
  cardsPerRound,
  gameType,
  dealerName,
  starterName,
  theme,
  onToggleTheme,
  onUndo,
  canUndo,
  onNewGame,
  title,
}) {
  const gameTypeInfo = getGameType(gameType);

  return (
    <header className="game-header">
      <div className="game-header-top">
        <h1 className="game-title">{title}</h1>
        <div className="game-header-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={onNewGame}>
            Nova partida
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
      <p className="game-header-subtitle">
        {gameTypeInfo.icon} {gameTypeInfo.name}
      </p>
      <div className="game-header-meta">
        <span className="badge">{roundLabel} {round}</span>
        {cardsPerRound !== undefined && (
          <span className="badge badge-muted">
            🃏 {cardsPerRound} {cardsPerRound === 1 ? 'carta' : 'cartas'}
          </span>
        )}
        {dealerName && <span className="badge badge-muted">🃏 Dá as cartas / Pé: {dealerName}</span>}
        {starterName && <span className="badge badge-muted">🎯 Começa: {starterName}</span>}
        {canUndo && (
          <button type="button" className="link-button" onClick={onUndo}>
            Desfazer última rodada
          </button>
        )}
      </div>
    </header>
  );
}
