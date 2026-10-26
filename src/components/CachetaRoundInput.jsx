import { useState } from 'react';
import { isForcedToPlay } from '../utils/cachetaScoring';

export const CACHETA_INPUT_STEPS = {
  PARTICIPATION: 0,
  WINNER: 1,
};

export default function CachetaRoundInput({
  players,
  participation,
  winnerId,
  dealerId,
  starterId,
  step,
  onChangeStep,
  onToggleParticipation,
  onSelectWinner,
  onFinalize,
}) {
  const [error, setError] = useState('');

  const activePlayers = players.filter((p) => p.score > 0);
  const participants = activePlayers.filter((p) => participation[p.id] !== false);
  const sitOuts = activePlayers.length - participants.length;
  const winner = participants.find((p) => p.id === winnerId);

  const handleContinue = () => {
    setError('');
    if (participants.length === 0) {
      onFinalize();
      return;
    }
    onChangeStep(CACHETA_INPUT_STEPS.WINNER);
  };

  const handleFinalize = () => {
    if (!winner) {
      setError('Toque em quem bateu a rodada.');
      return;
    }
    setError('');
    onFinalize();
  };

  if (step === CACHETA_INPUT_STEPS.WINNER) {
    return (
      <section className="round-step">
        <h2 className="section-title">Quem bateu?</h2>
        <p className="section-subtitle">Toque no jogador que bateu. Quem bateu não perde nada; os outros que jogaram perdem 2.</p>

        <div className="choice-list" role="radiogroup" aria-label="Quem bateu">
          {participants.map((p) => {
            const selected = p.id === winnerId;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`choice-row ${selected ? 'choice-row-winner' : ''}`}
                onClick={() => {
                  if (!selected) onSelectWinner(p.id);
                  setError('');
                }}
              >
                <span className="choice-icon">{selected ? '🏆' : '○'}</span>
                <span className="choice-name">{p.name}</span>
                {winner && (
                  <span className={`outcome-tag ${selected ? 'result-tag-success' : 'result-tag-fail'}`}>
                    {selected ? '0' : '−2'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {sitOuts > 0 && (
          <p className="section-hint">
            {sitOuts} {sitOuts === 1 ? 'jogador passou e perde' : 'jogadores passaram e perdem'} 1 ponto.
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <button type="button" className="btn btn-primary btn-block" onClick={handleFinalize}>
          {winner ? `Confirmar: ${winner.name} bateu` : 'Finalizar rodada'}
        </button>
        <button
          type="button"
          className="link-button link-button-center"
          onClick={() => onChangeStep(CACHETA_INPUT_STEPS.PARTICIPATION)}
        >
          ← Voltar para quem joga
        </button>
      </section>
    );
  }

  return (
    <section className="round-step">
      <h2 className="section-title">Quem vai jogar esta rodada?</h2>
      <p className="section-subtitle">Todos começam jogando. Toque em quem vai <strong>passar</strong> (perde 1 ponto).</p>

      <div className="choice-list">
        {activePlayers.map((p) => {
          const forced = isForcedToPlay(p);
          const playing = participation[p.id] !== false;

          return (
            <button
              key={p.id}
              type="button"
              role="switch"
              aria-checked={playing}
              disabled={forced}
              className={`choice-row ${playing ? 'choice-row-on' : 'choice-row-off'}`}
              onClick={() => onToggleParticipation(p.id, !playing)}
            >
              <span className="choice-main">
                <span className="choice-name">{p.name}</span>
                <span className="choice-badges">
                  {p.id === starterId && <span className="badge starter-badge">🎯 Começa</span>}
                  {p.id === dealerId && <span className="badge badge-muted badge-small">🃏 Pé</span>}
                  {forced && <span className="badge badge-muted badge-small">🔒 1 ponto: obrigado a jogar</span>}
                </span>
              </span>
              <span className={`choice-pill ${playing ? 'choice-pill-on' : 'choice-pill-off'}`}>
                {playing ? '✋ Joga' : '💤 Passa −1'}
              </span>
            </button>
          );
        })}
      </div>

      <p className="section-hint">
        {participants.length} {participants.length === 1 ? 'vai jogar' : 'vão jogar'}
        {sitOuts > 0 && ` · ${sitOuts} ${sitOuts === 1 ? 'passa' : 'passam'}`}
      </p>

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleContinue}>
        {participants.length === 0 ? 'Ninguém joga: finalizar rodada' : 'Continuar: quem bateu? ▶'}
      </button>
    </section>
  );
}
