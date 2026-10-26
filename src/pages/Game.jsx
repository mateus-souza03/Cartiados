import { useState } from 'react';
import GameHeader from '../components/GameHeader';
import ScoreBoard from '../components/ScoreBoard';
import RoundDeclaration from '../components/RoundDeclaration';
import RoundResult from '../components/RoundResult';
import RoundSummary from '../components/RoundSummary';
import RoundHistory from '../components/RoundHistory';
import StepIndicator from '../components/StepIndicator';
import { PHASES } from '../hooks/useGame';
import { getRoundDealer, getRoundStarterAfterDealer, rotateToStart } from '../utils/gameRules';

const STEPS = ['Declarar', 'Jogar', 'Marcar', 'Placar'];
const STEP_BY_PHASE = {
  [PHASES.DECLARATION]: 0,
  [PHASES.PLAYING]: 1,
  [PHASES.RESULT]: 2,
  [PHASES.SUMMARY]: 3,
};

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

      <StepIndicator steps={STEPS} current={STEP_BY_PHASE[game.phase] ?? 0} />

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
          <h2 className="section-title">Bora jogar!</h2>
          <p className="section-subtitle">
            {game.cardsPerRound} {game.cardsPerRound === 1 ? 'carta' : 'cartas'} · {starter?.name} começa
          </p>

          <ul className="playing-declarations">
            {orderedPlayers
              .filter((p) => p.score > 0)
              .map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <strong>vai fazer {game.declarations[p.id]?.declared}</strong>
                </li>
              ))}
          </ul>

          <p className="section-hint">Quando a última carta for jogada, toque abaixo para marcar quantas cada um fez.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={actions.startResultEntry}>
            Rodada acabou: marcar resultado
          </button>
          <button type="button" className="link-button link-button-center" onClick={actions.editDeclarations}>
            ← Corrigir declarações
          </button>
        </section>
      )}

      {game.phase === PHASES.RESULT && (
        <RoundResult
          players={orderedPlayers}
          declarations={game.declarations}
          results={game.results}
          cardsPerRound={game.cardsPerRound}
          dealerId={dealer?.id}
          starterId={starter?.id}
          onUpdate={actions.updateResult}
          onFinalize={actions.finalizeRound}
          onBack={actions.editDeclarations}
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
