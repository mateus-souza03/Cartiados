import { useEffect, useRef, useState } from 'react';

const move = (source, from, to) => {
  const next = [...source];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Reordenação por arraste (mouse ou toque) a partir de uma alça, com suporte
 * às setas do teclado.
 *
 * Durante o arraste os elementos NÃO mudam de lugar no DOM: o card arrastado
 * e os vizinhos só são deslocados com transform. Isso evita que o navegador
 * do celular perca o toque (e role a página) no meio do gesto. A nova ordem
 * só é aplicada ao soltar.
 *
 * - `items`: ordem real, usada para renderizar.
 * - `list`: ordem provisória enquanto arrasta (para numeração e regras).
 */
export function useDragReorder(items, onReorder) {
  const [preview, setPreview] = useState(null);
  const itemRefs = useRef({});
  const dragRef = useRef(null);
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const list = preview ? move(items, preview.from, preview.to) : items;
  const positionOf = (id) => list.findIndex((p) => p.id === id);

  const commit = (source, from, to) => {
    if (from !== to) onReorderRef.current(move(source, from, to).map((p) => p.id));
  };

  const resetStyles = (ids) => {
    ids.forEach((id) => {
      const el = itemRefs.current[id];
      if (!el) return;
      el.style.transform = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.position = '';
    });
  };

  const stopListening = useRef(() => {});
  useEffect(() => () => stopListening.current(), []);

  const start = (e, id) => {
    const from = items.findIndex((p) => p.id === id);
    const ids = items.map((p) => p.id);
    const rects = ids.map((itemId) => itemRefs.current[itemId]?.getBoundingClientRect());
    if (from < 0 || rects.some((r) => !r)) return;

    const parent = itemRefs.current[id].parentElement;
    const gap = parent ? parseFloat(getComputedStyle(parent).rowGap) || 0 : 0;
    const centers = rects.map((r) => r.top + r.height / 2);

    dragRef.current = {
      id,
      pointerId: e.pointerId,
      ids,
      source: items,
      from,
      to: from,
      startY: e.clientY,
      centers,
      size: rects[from].height + gap,
    };

    setPreview({ id, from, to: from });

    const el = itemRefs.current[id];
    el.style.transition = 'none';
    el.style.zIndex = '2';
    el.style.position = 'relative';
    ids.forEach((itemId) => {
      if (itemId !== id && itemRefs.current[itemId]) itemRefs.current[itemId].style.transition = 'transform 0.15s ease';
    });

    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      ev.preventDefault();
      const offset = ev.clientY - d.startY;
      itemRefs.current[d.id].style.transform = `translateY(${offset}px)`;

      const center = d.centers[d.from] + offset;
      let to = d.from;
      while (to < d.ids.length - 1 && center > d.centers[to + 1]) to += 1;
      while (to > 0 && center < d.centers[to - 1]) to -= 1;
      if (to === d.to) return;

      d.to = to;
      d.ids.forEach((itemId, i) => {
        if (itemId === d.id) return;
        let shift = 0;
        if (d.from < to && i > d.from && i <= to) shift = -d.size;
        if (to < d.from && i >= to && i < d.from) shift = d.size;
        itemRefs.current[itemId].style.transform = shift ? `translateY(${shift}px)` : '';
      });
      setPreview({ id: d.id, from: d.from, to });
    };

    const onEnd = (ev) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      stopListening.current();
      resetStyles(d.ids);
      dragRef.current = null;
      setPreview(null);
      if (ev.type !== 'pointercancel') commit(d.source, d.from, d.to);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    stopListening.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      stopListening.current = () => {};
    };
  };

  const handleProps = (id) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (dragRef.current) return;
      e.preventDefault();
      start(e, id);
    },
    onKeyDown: (e) => {
      const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const index = items.findIndex((p) => p.id === id);
      const target = index + delta;
      if (!delta || target < 0 || target >= items.length) return;
      e.preventDefault();
      commit(items, index, target);
    },
  });

  const itemRef = (id) => (el) => {
    itemRefs.current[id] = el;
  };

  return { items, list, positionOf, draggingId: preview?.id ?? null, handleProps, itemRef };
}
