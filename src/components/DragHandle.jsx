export default function DragHandle({ name, position, total, ...handlers }) {
  return (
    <button
      type="button"
      className="drag-handle"
      aria-label={`Mover ${name} (posição ${position} de ${total}). Use as setas para cima e para baixo.`}
      title="Segure e arraste para mudar a ordem"
      {...handlers}
    >
      ⠿
    </button>
  );
}
