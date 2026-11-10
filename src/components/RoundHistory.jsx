import { useState } from 'react';

// Eliminado na rodada em que a pontuação passa de positiva para zero (ou menos).
function wasEliminated(round, entry) {
  const before = round.scoresBefore?.[entry.playerId];
  if (before === undefined) return false;
  return before > 0 && before + entry.scoreChange <= 0;
}

export default function RoundHistory({ history }) {
  const [open, setOpen] = useState(false);

  if (!history.length) return null;

  return (
    <section className="history">
      <button type="button" className="history-toggle" onClick={() => setOpen((o) => !o)}>
        Histórico da partida {open ? '▲' : '▼'}
      </button>

      {open && (
          <div className="history-detail-list">
            {history.map((round) => (
              <div key={round.round} className="history-round">
                <h3>
                  Rodada {round.round}
                  {round.cardsPerRound
                    ? `: ${round.cardsPerRound} ${round.cardsPerRound === 1 ? 'carta' : 'cartas'}`
                    : ''}
                </h3>
                {round.entries.map((e) => (
                  <div key={e.playerId} className="history-entry">
                    <strong>{e.playerName}</strong>
                    <span>
                      {e.declared !== undefined
                        ? `Declarou ${e.declared} · Fez ${e.achieved}`
                        : e.playing
                          ? e.won
                            ? '🏆 Bateu'
                            : 'Jogou, não bateu'
                          : 'Não jogou'}
                      {wasEliminated(round, e) && <span className="eliminated-badge">💀 Eliminado</span>}
                    </span>
                    <span className={`history-entry-result ${e.scoreChange === 0 ? 'row-success' : 'row-fail'}`}>
                      {e.scoreChange === 0 ? '0' : e.scoreChange}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
      )}
    </section>
  );
}
