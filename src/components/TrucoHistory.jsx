import { useState } from 'react';
import { TRUCO_TARGET_SCORE } from '../utils/trucoScoring';

function groupByMao(history, players) {
  const groups = [];
  history.forEach((entry) => {
    let group = groups[groups.length - 1];
    if (!group || group.round !== entry.round) {
      group = { round: entry.round, entries: [], winner: null };
      groups.push(group);
    }
    const placar = players
      .map((p) => {
        const score = p.id === entry.teamId ? entry.scoreAfter : entry.scoresBefore[p.id] ?? 0;
        return Math.min(score, TRUCO_TARGET_SCORE);
      })
      .join(' x ');
    group.entries.push({ ...entry, placar });
    if (entry.wonMao) group.winner = entry.teamName;
  });
  return groups.reverse();
}

export default function TrucoHistory({ history, players }) {
  const [open, setOpen] = useState(false);

  if (!history.length) return null;

  const groups = groupByMao(history, players);

  return (
    <section className="history">
      <button type="button" className="history-toggle" onClick={() => setOpen((o) => !o)}>
        Histórico da partida {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="history-detail-list">
          {groups.map((group) => (
            <div key={group.round} className="history-round">
              <div className="truco-history-header">
                <h3>Mão {group.round}</h3>
                <span className={`truco-history-status${group.winner ? ' is-done' : ''}`}>
                  {group.winner ? `🏆 ${group.winner}` : 'Em andamento'}
                </span>
              </div>
              {group.entries.map((entry, i) => (
                <div key={i} className="history-entry truco-history-entry">
                  <strong>{entry.teamName}</strong>
                  <span>+{entry.points}</span>
                  <span className="history-entry-result">{entry.placar}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
