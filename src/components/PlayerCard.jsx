export default function PlayerCard({ player, declaration, resultEntry, rank }) {
  const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

  return (
    <div className={`player-card ${resultEntry?.success ? 'player-card-success' : ''}`}>
      <div className="player-card-name">
        {medal && <span className="medal">{medal}</span>}
        {player.name}
      </div>

      <div className="player-card-score">
        <span className="score-star">⭐</span>
        <span className="score-value">{player.score}</span>
        <span className="score-label">pontos</span>
      </div>

      {declaration && (
        <div className="player-card-declaration">
          <span>Declarou: {declaration.declared}</span>
          <span>Cartas: {declaration.cards}</span>
        </div>
      )}

      {resultEntry && (
        <div className={`player-card-result ${resultEntry.success ? 'result-success' : 'result-fail'}`}>
          <div className="result-line">
            Declarou: {resultEntry.declared} | Fez: {resultEntry.achieved}
          </div>
          {resultEntry.success ? (
            <div className="result-tag result-tag-success">✅ Acertou! 0 pontos perdidos</div>
          ) : (
            <div className="result-tag result-tag-fail">
              Penalidade: -{resultEntry.penalty} {resultEntry.penalty === 1 ? 'ponto' : 'pontos'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
