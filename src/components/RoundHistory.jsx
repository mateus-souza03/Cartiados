import { useState } from 'react';

export default function RoundHistory({ history, players }) {
  const [open, setOpen] = useState(false);

  if (!history.length) return null;

  return (
    <section className="history">
      <button type="button" className="history-toggle" onClick={() => setOpen((o) => !o)}>
        Histórico da partida {open ? '▲' : '▼'}
      </button>

      {open && (
        <>
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rodada</th>
                  {players.map((p) => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((round) => (
                  <tr key={round.round}>
                    <td>{round.round}</td>
                    {players.map((p) => {
                      const entry = round.entries.find((e) => e.playerId === p.id);
                      return (
                        <td key={p.id} className={entry?.success ? 'row-success' : 'row-fail'}>
                          {entry ? (entry.success ? '0' : `-${entry.penalty}`) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="history-detail-list">
            {history.map((round) => (
              <div key={round.round} className="history-round">
                <h3>
                  Rodada {round.round}: {round.cardsPerRound} {round.cardsPerRound === 1 ? 'carta' : 'cartas'}
                </h3>
                {round.entries.map((e) => (
                  <div key={e.playerId} className="history-entry">
                    <strong>{e.playerName}</strong>
                    <span>Declarou: {e.declared}</span>
                    <span>Fez: {e.achieved}</span>
                    <span>Resultado: {e.success ? '0' : `-${e.penalty}`}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
