import { useState } from 'react';
import { isForcedToPlay } from '../utils/cachetaScoring';

export default function CachetaRoundInput({ players, participation, winnerId, onToggleParticipation, onSelectWinner, onFinalize }) {
  const [error, setError] = useState('');

  const activePlayers = players.filter((p) => p.score > 0);
  const participants = activePlayers.filter((p) => participation[p.id] !== false);

  const handleFinalize = () => {
    if (participants.length > 0 && !winnerId) {
      setError('Selecione quem bateu a rodada.');
      return;
    }
    setError('');
    onFinalize();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Rodada</h2>
      <p className="section-subtitle">Marque quem jogou esta rodada e quem bateu.</p>

      <div className="declaration-list">
        {activePlayers.map((p) => {
          const forced = isForcedToPlay(p);
          const playing = participation[p.id] !== false;

          return (
            <div key={p.id} className="declaration-card">
              <div className="declaration-name">
                {p.name}
                {forced && <span className="badge badge-muted cacheta-forced-badge">Obrigado a jogar</span>}
              </div>

              <div className="cacheta-toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${!playing ? 'toggle-btn-active' : ''}`}
                  disabled={forced}
                  onClick={() => onToggleParticipation(p.id, false)}
                >
                  Não vai jogar
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${playing ? 'toggle-btn-active' : ''}`}
                  onClick={() => onToggleParticipation(p.id, true)}
                >
                  Vai jogar
                </button>
              </div>

              {playing && (
                <button
                  type="button"
                  className={`winner-btn ${winnerId === p.id ? 'winner-btn-active' : ''}`}
                  onClick={() => onSelectWinner(p.id)}
                >
                  🏆 Bateu esta rodada
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleFinalize}>
        Finalizar rodada
      </button>
    </section>
  );
}
