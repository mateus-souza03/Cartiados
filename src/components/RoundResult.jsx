import { useState } from 'react';
import NumberPicker from './NumberPicker';

const isFilled = (v) => v !== '' && v !== null && v !== undefined && Number(v) >= 0;

export default function RoundResult({
  players,
  declarations,
  results,
  cardsPerRound,
  dealerId,
  starterId,
  onUpdate,
  onFinalize,
  onBack,
}) {
  const [error, setError] = useState('');
  const [confirmMismatch, setConfirmMismatch] = useState(false);

  const activePlayers = players.filter((p) => p.score > 0);
  const cards = Number(cardsPerRound);
  const isSingleCard = cards === 1;

  const filledCount = activePlayers.filter((p) => isFilled(results[p.id])).length;
  const totalAchieved = activePlayers.reduce((acc, p) => acc + Number(results[p.id] || 0), 0);
  const allFilled = filledCount === activePlayers.length;
  const sumMismatch = allFilled && !isSingleCard && totalAchieved !== cards;

  const update = (playerId, value) => {
    onUpdate(playerId, value);
    setError('');
    setConfirmMismatch(false);
  };

  const handleFinalize = () => {
    const pending = activePlayers.find((p) => !isFilled(results[p.id]));
    if (pending) {
      setError(`Falta informar quantas ${pending.name} fez.`);
      return;
    }
    if (sumMismatch && !confirmMismatch) {
      setConfirmMismatch(true);
      return;
    }
    setError('');
    onFinalize();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Quantas cada um fez?</h2>
      <p className="section-subtitle">
        Toque em <strong>✅ Acertou</strong> para quem fez exatamente o que declarou, ou escolha o número que fez.
      </p>

      <div className="declaration-list">
        {activePlayers.map((p) => {
          const declared = Number(declarations[p.id]?.declared ?? 0);
          const value = results[p.id] ?? '';
          const filled = isFilled(value);
          const diff = filled ? Math.abs(Number(value) - declared) : null;
          return (
            <div key={p.id} className={`declaration-card ${filled ? 'declaration-card-done' : ''}`}>
              <div className="declaration-head">
                <span className="declaration-name">{p.name}</span>
                {filled && (
                  <span className={`outcome-tag ${diff === 0 ? 'result-tag-success' : 'result-tag-fail'}`}>
                    {diff === 0 ? '✅ Acertou' : `−${diff} ${diff === 1 ? 'ponto' : 'pontos'}`}
                  </span>
                )}
              </div>
              <div className="declaration-badges">
                <span className="badge badge-small">Declarou {declared}</span>
                {p.id === starterId && <span className="badge starter-badge">🎯 Começa</span>}
                {p.id === dealerId && <span className="badge badge-muted badge-small">🃏 Pé</span>}
              </div>
              <button
                type="button"
                className={`hit-btn ${filled && diff === 0 ? 'hit-btn-active' : ''}`}
                onClick={() => update(p.id, String(declared))}
              >
                ✅ Acertou ({declared})
              </button>
              <span className="picker-caption">ou fez:</span>
              <NumberPicker
                label={`pontos que ${p.name} fez`}
                max={isSingleCard ? activePlayers.length : cards || undefined}
                value={value}
                onChange={(v) => update(p.id, v)}
              />
            </div>
          );
        })}
      </div>

      {!isSingleCard && (
        <div className={`round-total ${sumMismatch ? 'round-total-warn' : ''}`}>
          <span>Total de vazas marcadas</span>
          <strong>
            {totalAchieved} de {cards}
          </strong>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      {confirmMismatch && (
        <p className="form-error">
          A soma ({totalAchieved}) não bate com as {cards} cartas da rodada. Confira os valores ou toque de novo para
          finalizar assim mesmo.
        </p>
      )}

      <button type="button" className="btn btn-primary btn-block" onClick={handleFinalize}>
        {confirmMismatch
          ? 'Finalizar assim mesmo'
          : allFilled
            ? 'Finalizar rodada'
            : `Finalizar rodada (faltam ${activePlayers.length - filledCount})`}
      </button>
      {onBack && (
        <button type="button" className="link-button link-button-center" onClick={onBack}>
          ← Voltar para as declarações
        </button>
      )}
    </section>
  );
}
