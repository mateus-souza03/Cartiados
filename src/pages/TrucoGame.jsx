import { useState } from 'react';
import GameHeader from '../components/GameHeader';
import TrucoScoreBoard from '../components/TrucoScoreBoard';
import TrucoHistory from '../components/TrucoHistory';
import { isMaoDeOnze } from '../utils/trucoScoring';

export default function TrucoGame({ game, actions, theme, onToggleTheme, onNewGame }) {
  const [confirmUndo, setConfirmUndo] = useState(false);

  const handleUndoClick = () => setConfirmUndo(true);
  const handleUndoConfirm = () => {
    actions.undoLastRound();
    setConfirmUndo(false);
  };

  const maoDeOnzeTeam = game.players.find((p) => isMaoDeOnze(p.score));

  return (
    <div className="game-page">
      <GameHeader
        round={game.round}
        roundLabel="Mão"
        gameType={game.gameType}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onUndo={handleUndoClick}
        canUndo={game.history.length > 0}
        onNewGame={onNewGame}
        title="Cartiado"
      />

      {confirmUndo && (
        <div className="confirm-banner">
          <p>Tem certeza que deseja desfazer o último lançamento?</p>
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

      {maoDeOnzeTeam && (
        <div className="truco-mao-onze-banner">
          <strong>Mão de 11!</strong>
          <p>
            {maoDeOnzeTeam.name} está com 11 pontos. Essa mão vale a partida inteira: nenhum time pode fugir
            e quem fizer o próximo ponto vence o jogo.
          </p>
        </div>
      )}

      <TrucoScoreBoard players={game.players} onAddPoints={actions.addTrucoPoints} />

      <TrucoHistory history={game.history} />
    </div>
  );
}
