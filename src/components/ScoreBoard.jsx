import { getRankedPlayers } from '../utils/gameRules';

export default function ScoreBoard({ players }) {
  const ranked = getRankedPlayers(players);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section className="scoreboard">
      <h2 className="section-title">Placar</h2>
      <ol className="scoreboard-list">
        {ranked.map((p, i) => (
          <li key={p.id} className={`scoreboard-item ${i === 0 ? 'scoreboard-leader' : ''}`}>
            <span className="scoreboard-rank">{medals[i] || `${i + 1}º`}</span>
            <span className="scoreboard-name">{p.name}</span>
            <span className="scoreboard-score">{p.score} pontos</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
