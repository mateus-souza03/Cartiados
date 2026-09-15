import { useState } from 'react';

export default function TrucoHistory({ history }) {
  const [open, setOpen] = useState(false);

  if (!history.length) return null;

  return (
    <section className="history">
      <button type="button" className="history-toggle" onClick={() => setOpen((o) => !o)}>
        Histórico da partida {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="history-detail-list">
          {[...history].reverse().map((entry, i) => (
            <div key={history.length - i} className="history-round">
              <h3>Mão {entry.round}</h3>
              <div className="history-entry">
                <strong>{entry.teamName}</strong>
                <span>+{entry.points} pontos</span>
                <span>{entry.wonMao ? '🏆 Venceu a mão' : `Total: ${entry.scoreAfter}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
