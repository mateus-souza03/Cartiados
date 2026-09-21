import { useState } from 'react';
import GameHeader from '../components/GameHeader';
import ScoreBoard from '../components/ScoreBoard';
import RoundDeclaration from '../components/RoundDeclaration';
import RoundResult from '../components/RoundResult';
import RoundSummary from '../components/RoundSummary';
import RoundHistory from '../components/RoundHistory';
import { PHASES } from '../hooks/useGame';
import { getRoundDealer, getRoundStarterAfterDealer, rotateToStart } from '../utils/gameRules';

export default function Game({ game, actions, theme, onToggleTheme, onViewFinalResult, onNewGame }) {
  const [confirmUndo, setConfirmUndo] = useState(false);

  const lastRound = game.history[game.history.length - 1];
  const dealer = getRoundDealer(game.players, game.round);
  const starter = getRoundStarterAfterDealer(game.players, game.round);
  const orderedPlayers = rotateToStart(game.players, starter?.id);

  const handleUndoClick = () => setConfirmUndo(true);
  const handleUndoConfirm = () => {
    actions.undoLastRound();
    setConfirmUndo(false);
  };

  return (
    <div className="game-page">
      <GameHeader
        round={game.round}
        cardsPerRound={game.cardsPerRound}
        gameType={game.gameType}
        dealerName={dealer?.name}
        starterName={starter?.name}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onUndo={handleUndoClick}
        canUndo={game.history.length > 0}
        onNewGame={onNewGame}
        title="Cartiado"
      />

      {confirmUndo && (
        <div className="confirm-banner">
          <p>Tem certeza que deseja desfazer a última rodada?</p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-danger" onClick={handleUndoConfirm}>
              Sim, desfazer
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmUndo(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {game.phase === PHASES.DECLARATION && (
        <RoundDeclaration
          players={orderedPlayers}
          declarations={game.declarations}
          cardsPerRound={game.cardsPerRound}
          dealerId={dealer?.id}
          starterId={starter?.id}
          onUpdate={actions.updateDeclaration}
          onUpdateCardsPerRound={actions.updateCardsPerRound}
          onConfirm={actions.confirmDeclarations}
        />
      )}

      {game.phase === PHASES.PLAYING && (
        <section className="round-step playing-step">
          <div className="playing-icon">🃏</div>
          <h2 className="section-title">Rodada em andamento</h2>
          <p className="section-subtitle">
            {game.cardsPerRound} {game.cardsPerRound === 1 ? 'carta' : 'cartas'}
          </p>
          <p className="section-hint">Quando a rodada terminar, informe quantos pontos cada jogador fez.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={actions.startResultEntry}>
            Informar resultado
          </button>
        </section>
      )}

      {game.phase === PHASES.RESULT && (
        <RoundResult
          players={orderedPlayers}
          declarations={game.declarations}
          results={game.results}
          dealerId={dealer?.id}
          starterId={starter?.id}
          onUpdate={actions.updateResult}
          onFinalize={actions.finalizeRound}
        />
      )}

      {game.phase === PHASES.SUMMARY && (
        <RoundSummary
          round={lastRound}
          players={game.players}
          finished={game.finished}
          onNextRound={actions.nextRound}
          onFinish={onViewFinalResult}
        />
      )}

      <ScoreBoard players={game.players} />
      <RoundHistory history={game.history} players={game.players} />
    </div>
  );
}
