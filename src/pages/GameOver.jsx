import GameSummary from '../components/GameSummary';
import RoundHistory from '../components/RoundHistory';

export default function GameOver({ game, onNewGame }) {
  return (
    <div className="game-over-page">
      <GameSummary game={game} onNewGame={onNewGame} />
      <RoundHistory history={game.history} players={game.players} />
    </div>
  );
}
