import ThemeToggle from './ThemeToggle';
import { getGameType } from '../utils/gameTypes';

export default function GameHeader({
  round,
  roundLabel = 'Rodada',
  cardsPerRound,
  gameType,
  dealerName,
  starterName,
  peName,
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
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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
        {dealerName && <span className="badge badge-muted">🃏 Dá as cartas: {dealerName}</span>}
        {starterName && <span className="badge badge-muted">🎯 Começa: {starterName}</span>}
        {peName && <span className="badge badge-muted">🦶 Pé: {peName}</span>}
        {canUndo && (
          <button type="button" className="link-button" onClick={onUndo}>
            Desfazer última rodada
          </button>
        )}
        <button type="button" className="link-button" onClick={onNewGame}>
          Nova partida
        </button>
      </div>
    </header>
  );
}
