import { getRankedPlayers, getWinner } from '../utils/gameRules';

export default function GameSummary({ game, onNewGame }) {
  const winner = getWinner(game);
  const ranked = getRankedPlayers(game.players);

  return (
    <div className="game-over">
      <div className="trophy">🏆</div>
      <h1>Fim de jogo</h1>
      <p className="winner-line">{winner?.name} venceu!</p>

      <div className="final-scores">
        <h2 className="section-title">Pontuação final</h2>
        {ranked.map((p, i) => (
          <div key={p.id} className={`summary-score-row ${i === 0 ? 'scoreboard-leader' : ''}`}>
            <span>{p.name}</span>
            <strong>{p.score}</strong>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={onNewGame}>
        Nova partida
      </button>
    </div>
  );
}
