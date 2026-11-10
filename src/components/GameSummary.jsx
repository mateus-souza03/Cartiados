import { getWinner } from '../utils/gameRules';
import Fireworks from './Fireworks';

export default function GameSummary({ game, onNewGame }) {
  const winner = getWinner(game);

  return (
    <div className="game-over">
      <Fireworks />
      <h1>Fim de jogo</h1>
      <div className="winner-spotlight">
        <div className="trophy">🏆</div>
        <p className="winner-label">Vencedor</p>
        <p className="winner-name">{winner?.name}</p>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={onNewGame}>
        Nova partida
      </button>
    </div>
  );
}
