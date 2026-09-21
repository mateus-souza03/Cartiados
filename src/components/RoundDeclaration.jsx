import { useState } from 'react';
import NumberStepper from './NumberStepper';

export default function RoundDeclaration({
  players,
  declarations,
  cardsPerRound,
  dealerId,
  starterId,
  onUpdate,
  onUpdateCardsPerRound,
  onConfirm,
}) {
  const [error, setError] = useState('');

  const activePlayers = players.filter((p) => p.score > 0);
  const lastPlayer = activePlayers[activePlayers.length - 1];
  const otherPlayers = activePlayers.slice(0, -1);

  const isDeclared = (d) => d !== '' && d !== null && d !== undefined && Number(d) >= 0;

  const allOthersDeclared =
    otherPlayers.length > 0 && otherPlayers.every((p) => isDeclared(declarations[p.id]?.declared));

  const sumOthers = otherPlayers.reduce((acc, p) => acc + Number(declarations[p.id]?.declared || 0), 0);
  const forbiddenValue = Number(cardsPerRound) - sumOthers;
  const showForbidden =
    allOthersDeclared && cardsPerRound !== '' && cardsPerRound !== null && forbiddenValue >= 0;

  const handleConfirm = () => {
    if (cardsPerRound === '' || cardsPerRound === null || Number(cardsPerRound) < 1) {
      setError('Informe a quantidade de cartas desta rodada.');
      return;
    }
    for (const p of activePlayers) {
      const d = declarations[p.id];
      if (d.declared === '' || d.declared === null || Number(d.declared) < 0) {
        setError(`Informe quantos pontos ${p.name} pretende fazer.`);
        return;
      }
    }
    if (
      lastPlayer &&
      showForbidden &&
      Number(declarations[lastPlayer.id]?.declared) === forbiddenValue
    ) {
      setError(`${lastPlayer.name} não pode declarar ${forbiddenValue} (fecharia a soma com a quantidade de cartas).`);
      return;
    }
    setError('');
    onConfirm();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Declarações</h2>
      <p className="section-subtitle">Defina as cartas da rodada e quantos pontos cada jogador pretende fazer.</p>

      <div className="declaration-card declaration-card-round">
        <div className="declaration-name">Cartas nesta rodada</div>
        <div className="field">
          <NumberStepper label="cartas nesta rodada" min={1} value={cardsPerRound} onChange={onUpdateCardsPerRound} />
        </div>
      </div>

      <div className="declaration-list">
        {activePlayers.map((p) => (
          <div key={p.id} className="declaration-card">
            <div className="declaration-name">
              {p.name}
              {p.id === dealerId && <span className="badge badge-muted">🃏 Dá as cartas / Pé</span>}
              {p.id === starterId && <span className="badge starter-badge">🎯 Começa</span>}
              {p.id === lastPlayer?.id && showForbidden && (
                <span className="badge badge-danger">🚫 Não pode declarar: {forbiddenValue}</span>
              )}
            </div>
            <div className="field">
              <span>Pontos que fará</span>
              <NumberStepper
                label="pontos que fará"
                value={declarations[p.id]?.declared ?? ''}
                onChange={(value) => onUpdate(p.id, 'declared', value)}
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleConfirm}>
        Continuar
      </button>
    </section>
  );
}
