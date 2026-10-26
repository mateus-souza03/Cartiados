export default function SummaryScoreRow({ player, before }) {
  const delta = before === undefined ? 0 : player.score - before;
  const eliminated = player.score <= 0 && before > 0;

  return (
    <div className={`summary-score-row ${eliminated ? 'summary-score-row-out' : ''}`}>
      <span>
        {player.name}
        {eliminated && <span className="badge badge-danger badge-small">Eliminado</span>}
      </span>
      <strong>
        {player.score} pontos
        {delta !== 0 && <span className="summary-delta"> ({delta > 0 ? `+${delta}` : `−${-delta}`})</span>}
      </strong>
    </div>
  );
}
