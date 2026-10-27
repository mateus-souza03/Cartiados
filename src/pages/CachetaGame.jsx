import { useState } from 'react';
import GameHeader from '../components/GameHeader';
import ScoreBoard from '../components/ScoreBoard';
import CachetaRoundInput, { CACHETA_INPUT_STEPS } from '../components/CachetaRoundInput';
import CachetaRoundSummary from '../components/CachetaRoundSummary';
import RoundHistory from '../components/RoundHistory';
import StepIndicator from '../components/StepIndicator';
import SeatOrder from '../components/SeatOrder';
import { CACHETA_PHASES } from '../hooks/useGame';
import { getRoundDealer, getRoundStarterAfterDealer, rotateToStart } from '../utils/gameRules';

const STEPS = ['Quem joga', 'Quem bateu', 'Placar'];

export default function CachetaGame({ game, actions, theme, onToggleTheme, onViewFinalResult, onNewGame }) {
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [inputStep, setInputStep] = useState({ round: game.round, step: CACHETA_INPUT_STEPS.PARTICIPATION });

  const currentInputStep = inputStep.round === game.round ? inputStep.step : CACHETA_INPUT_STEPS.PARTICIPATION;
  const changeInputStep = (step) => setInputStep({ round: game.round, step });
  const handleFinalize = () => {
    changeInputStep(CACHETA_INPUT_STEPS.PARTICIPATION);
    actions.finalizeCachetaRound();
  };

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

      <StepIndicator steps={STEPS} current={game.phase === CACHETA_PHASES.SUMMARY ? 2 : currentInputStep} />

      {game.phase === CACHETA_PHASES.ROUND && (
        <CachetaRoundInput
          players={orderedPlayers}
          participation={game.participation}
          winnerId={game.winnerId}
          dealerId={dealer?.id}
          starterId={starter?.id}
          step={currentInputStep}
          onChangeStep={changeInputStep}
          onToggleParticipation={actions.updateParticipation}
          onSelectWinner={actions.setWinner}
          onFinalize={handleFinalize}
        />
      )}

      {game.phase === CACHETA_PHASES.ROUND && (
        <SeatOrder players={orderedPlayers.filter((p) => p.score > 0)} onReorder={actions.reorderPlayers} />
      )}

      {game.phase === CACHETA_PHASES.SUMMARY && (
        <CachetaRoundSummary
          round={lastRound}
          players={game.players}
          finished={game.finished}
          onNextRound={actions.nextCachetaRound}
          onFinish={onViewFinalResult}
        />
      )}

      <ScoreBoard players={game.players} />
      <RoundHistory history={game.history} players={game.players} />
    </div>
  );
}
