import { useState } from 'react';
import NumberStepper from './NumberStepper';
import NumberPicker from './NumberPicker';
import DragHandle from './DragHandle';
import { useDragReorder } from '../hooks/useDragReorder';

const isFilled = (v) => v !== '' && v !== null && v !== undefined && Number(v) >= 0;

export default function RoundDeclaration({
  players,
  declarations,
  cardsPerRound,
  onUpdate,
  onUpdateCardsPerRound,
  onConfirm,
  onReorder,
}) {
  const [error, setError] = useState('');

  // A lista já vem na ordem de jogo: o primeiro começa e o último é o pé.
  // Enquanto arrasta, só a numeração acompanha a posição provisória; o resto
  // muda ao soltar, para os cards não mudarem de altura no meio do gesto.
  const { items: activePlayers, positionOf, draggingId, handleProps, itemRef } = useDragReorder(
    players.filter((p) => p.score > 0),
    onReorder,
  );
  const lastPlayer = activePlayers[activePlayers.length - 1];
  const otherPlayers = activePlayers.slice(0, -1);

  const cards = Number(cardsPerRound);
  const hasCards = cardsPerRound !== '' && cardsPerRound !== null && cards >= 1;
  const isSingleCard = cards === 1;

  const allOthersDeclared = otherPlayers.length > 0 && otherPlayers.every((p) => isFilled(declarations[p.id]?.declared));
  const sumOthers = otherPlayers.reduce((acc, p) => acc + Number(declarations[p.id]?.declared || 0), 0);
  const forbiddenValue = cards - sumOthers;
  const hasForbidden = !isSingleCard && hasCards && allOthersDeclared && forbiddenValue >= 0;

  const declaredCount = activePlayers.filter((p) => isFilled(declarations[p.id]?.declared)).length;
  const totalDeclared = activePlayers.reduce((acc, p) => acc + Number(declarations[p.id]?.declared || 0), 0);
  const nextPlayer = activePlayers.find((p) => !isFilled(declarations[p.id]?.declared));
  const missing = activePlayers.length - declaredCount;

  const handleConfirm = () => {
    if (!hasCards) {
      setError('Informe a quantidade de cartas desta rodada.');
      return;
    }
    if (nextPlayer) {
      setError(`Falta a declaração de ${nextPlayer.name}.`);
      return;
    }
    if (hasForbidden && Number(declarations[lastPlayer.id]?.declared) === forbiddenValue) {
      setError(`${lastPlayer.name} não pode declarar ${forbiddenValue}: a soma fecharia com as cartas.`);
      return;
    }
    setError('');
    onConfirm();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Quantas cada um vai fazer?</h2>
      <p className="section-subtitle">
        Na ordem da mesa, toque no número que cada jogador declarar. O destacado é quem declara agora. Para mudar a
        ordem, segure <strong>⠿</strong> e arraste o card.
      </p>

      <div className="round-cards-row">
        <span className="round-cards-label">Cartas nesta rodada</span>
        <NumberStepper label="cartas nesta rodada" min={1} value={cardsPerRound} onChange={onUpdateCardsPerRound} />
      </div>

      <div className="declaration-list">
        {activePlayers.map((p, i) => {
          const value = declarations[p.id]?.declared ?? '';
          const isNext = nextPlayer?.id === p.id;
          const isLast = p.id === lastPlayer?.id;
          return (
            <div
              key={p.id}
              ref={itemRef(p.id)}
              className={`declaration-card ${isNext ? 'declaration-card-next' : ''} ${
                isFilled(value) ? 'declaration-card-done' : ''
              } ${draggingId === p.id ? 'card-dragging' : ''}`}
            >
              <div className="declaration-head">
                <span className="declaration-order">{positionOf(p.id) + 1}º</span>
                <span className="declaration-name">{p.name}</span>
                {isFilled(value) && <span className="declaration-value">{value}</span>}
                <DragHandle name={p.name} position={i + 1} total={activePlayers.length} {...handleProps(p.id)} />
              </div>
              <div className="declaration-badges">
                {i === 0 && <span className="badge starter-badge">🎯 Começa</span>}
                {isLast && <span className="badge badge-muted badge-small">🃏 Pé</span>}
                {isNext && <span className="badge badge-small">👉 Vez de declarar</span>}
              </div>
              <NumberPicker
                label={`pontos que ${p.name} fará`}
                max={hasCards ? cards : undefined}
                value={value}
                forbiddenValue={isLast && hasForbidden ? forbiddenValue : undefined}
                onChange={(v) => {
                  onUpdate(p.id, 'declared', v);
                  setError('');
                }}
              />
              {isLast && hasForbidden && (
                <p className="declaration-hint">
                  🚫 Como é o pé, não pode declarar <strong>{forbiddenValue}</strong> (a soma daria {cards}).
                </p>
              )}
            </div>
          );
        })}
      </div>

      {hasCards && (
        <div className="round-total">
          <span>Soma das declarações</span>
          <strong>
            {totalDeclared} de {cards} {cards === 1 ? 'carta' : 'cartas'}
          </strong>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleConfirm}>
        {missing > 0 ? `Começar rodada (faltam ${missing})` : 'Começar rodada ▶'}
      </button>
    </section>
  );
}
