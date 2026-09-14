import { getRankedPlayers } from '../utils/gameRules';

export default function RoundSummary({ round, players, finished, onNextRound, onFinish }) {
  const ranked = getRankedPlayers(players);

  return (
    <section className="round-step round-summary">
      <h2 className="section-title">Resultado da rodada {round.round}</h2>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Declarou</th>
              <th>Fez</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {round.entries.map((e) => (
              <tr key={e.playerId} className={e.success ? 'row-success' : 'row-fail'}>
                <td>{e.playerName}</td>
                <td>{e.declared}</td>
                <td>{e.achieved}</td>
                <td>{e.success ? '✅ 0' : `-${e.penalty}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-scores">
        {ranked.map((p) => (
          <div key={p.id} className="summary-score-row">
            <span>{p.name}</span>
            <strong>{p.score} pontos</strong>
          </div>
        ))}
      </div>

      {finished ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onFinish}>
          Ver resultado final
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={onNextRound}>
          Próxima rodada
        </button>
      )}
    </section>
  );
}
