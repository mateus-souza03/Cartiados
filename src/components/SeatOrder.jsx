import { useRef, useState } from 'react';

/**
 * Lista arrastável com a ordem de jogo da rodada: o primeiro começa e o
 * último é o pé (dá as cartas). Arraste pela alça ⠿ (mouse ou toque) ou use
 * as setas do teclado com a alça focada.
 */
export default function SeatOrder({ players, onReorder }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [drag, setDrag] = useState(null);
  const itemRefs = useRef({});

  const list = order ?? players;

  const commit = (next) => {
    if (next.some((p, i) => p.id !== players[i].id)) onReorder(next.map((p) => p.id));
  };

  const move = (from, to) => {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const handlePointerDown = (e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setOrder(players);
    setDrag({ id, startY: e.clientY, offset: 0 });
  };

  const handlePointerMove = (e) => {
    if (!drag) return;
    let offset = e.clientY - drag.startY;
    let startY = drag.startY;
    let current = list;
    const index = current.findIndex((p) => p.id === drag.id);
    const draggedEl = itemRefs.current[drag.id];
    const step = draggedEl ? draggedEl.offsetHeight + 8 : 60;

    // Troca de posição quando o card passa da metade do vizinho.
    if (offset > step / 2 && index < current.length - 1) {
      current = move(index, index + 1);
      startY += step;
      offset -= step;
    } else if (offset < -step / 2 && index > 0) {
      current = move(index, index - 1);
      startY -= step;
      offset += step;
    }

    if (current !== list) setOrder(current);
    setDrag({ ...drag, startY, offset });
  };

  const handlePointerUp = () => {
    if (!drag) return;
    commit(list);
    setDrag(null);
    setOrder(null);
  };

  const handleKeyDown = (e, index) => {
    const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    const target = index + delta;
    if (!delta || target < 0 || target >= players.length) return;
    e.preventDefault();
    commit(move(index, target));
  };

  return (
    <section className="seat-order">
      <button type="button" className="history-toggle" onClick={() => setOpen((o) => !o)}>
        🔀 Mudar ordem da mesa {open ? '▲' : '▼'}
      </button>

      {open && (
        <>
          <p className="section-hint">
            Segure a alça <strong>⠿</strong> e arraste para mudar a ordem. O <strong>1º</strong> começa a rodada e o{' '}
            <strong>último</strong> é o pé (dá as cartas). As próximas rodadas seguem essa sequência.
          </p>
          <ol className="seat-list">
            {list.map((p, i) => {
              const isDragging = drag?.id === p.id;
              return (
                <li
                  key={p.id}
                  ref={(el) => {
                    itemRefs.current[p.id] = el;
                  }}
                  className={`seat-item ${isDragging ? 'seat-item-dragging' : ''}`}
                  style={isDragging ? { transform: `translateY(${drag.offset}px)` } : undefined}
                >
                  <span className="declaration-order">{i + 1}º</span>
                  <span className="seat-name">{p.name}</span>
                  {i === 0 && <span className="badge starter-badge">🎯 Começa</span>}
                  {i === list.length - 1 && <span className="badge badge-muted badge-small">🃏 Pé</span>}
                  <button
                    type="button"
                    className="seat-handle"
                    aria-label={`Mover ${p.name} (posição ${i + 1} de ${list.length}). Use as setas para cima e para baixo.`}
                    onPointerDown={(e) => handlePointerDown(e, p.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                  >
                    ⠿
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
