import { TRUCO_POINT_OPTIONS } from '../utils/trucoScoring';

export default function TrucoScoreBoard({ players, onAddPoints }) {
  return (
    <section className="truco-board">
      {players.map((team) => (
        <div key={team.id} className="truco-team-card">
          <h2 className="truco-team-name">{team.name}</h2>
          <div className="truco-team-score">{team.score}</div>
          <span className="badge truco-team-wins">🏆 {team.matchWins}</span>

          <div className="truco-point-buttons" role="group" aria-label={`Pontos de ${team.name}`}>
            {TRUCO_POINT_OPTIONS.map((points) => (
              <button
                key={points}
                type="button"
                className="truco-point-btn"
                onClick={() => onAddPoints(team.id, points)}
              >
                {points}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
