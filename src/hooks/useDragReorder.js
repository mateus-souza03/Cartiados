import { useRef, useState } from 'react';

/**
 * Reordenação por arraste (mouse ou toque) a partir de uma alça, com suporte
 * às setas do teclado. Enquanto arrasta, `list` reflete a ordem provisória;
 * ao soltar, `onReorder` recebe os ids na nova ordem (só se algo mudou).
 */
export function useDragReorder(items, onReorder) {
  const [order, setOrder] = useState(null);
  const [drag, setDrag] = useState(null);
  const itemRefs = useRef({});

  const list = order ?? items;

  const move = (source, from, to) => {
    const next = [...source];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const commit = (next) => {
    if (next.some((p, i) => p.id !== items[i].id)) onReorder(next.map((p) => p.id));
  };

  const finish = () => {
    if (!drag) return;
    commit(list);
    setDrag(null);
    setOrder(null);
  };

  const handleProps = (id, index) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setOrder(items);
      setDrag({ id, startY: e.clientY, offset: 0 });
    },
    onPointerMove: (e) => {
      if (!drag) return;
      let offset = e.clientY - drag.startY;
      let startY = drag.startY;
      let current = list;
      const el = itemRefs.current[drag.id];
      const height = (id) => itemRefs.current[id]?.offsetHeight ?? 60;
      const gap = el?.parentElement ? parseFloat(getComputedStyle(el.parentElement).rowGap) || 0 : 0;

      // Troca de posição a cada vizinho cuja metade o card ultrapassar
      // (vários de uma vez se o movimento for rápido).
      for (;;) {
        const i = current.findIndex((p) => p.id === drag.id);
        if (offset > 0 && i < current.length - 1) {
          const neighborHeight = height(current[i + 1].id);
          if (offset <= neighborHeight / 2) break;
          current = move(current, i, i + 1);
          startY += neighborHeight + gap;
          offset -= neighborHeight + gap;
        } else if (offset < 0 && i > 0) {
          const neighborHeight = height(current[i - 1].id);
          if (-offset <= neighborHeight / 2) break;
          current = move(current, i, i - 1);
          startY -= neighborHeight + gap;
          offset += neighborHeight + gap;
        } else {
          break;
        }
      }

      if (current !== list) setOrder(current);
      setDrag({ ...drag, startY, offset });
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onKeyDown: (e) => {
      const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const target = index + delta;
      if (!delta || target < 0 || target >= items.length) return;
      e.preventDefault();
      commit(move(items, index, target));
    },
  });

  const itemProps = (id) => ({
    ref: (el) => {
      itemRefs.current[id] = el;
    },
    style: drag?.id === id ? { transform: `translateY(${drag.offset}px)`, zIndex: 2, position: 'relative' } : undefined,
  });

  return { list, draggingId: drag?.id ?? null, handleProps, itemProps };
}
