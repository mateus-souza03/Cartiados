/**
 * Regra de pontuação da Cacheta (variante da casa):
 * - Quem não joga a rodada perde 1 ponto.
 * - Quem joga e não bate perde 2 pontos.
 * - Quem bate não perde pontos.
 * - Jogadores com exatamente 1 ponto são obrigados a jogar.
 */
export function isForcedToPlay(player) {
  return player.score === 1;
}

export function calculateCachetaRound(activePlayers, participation, winnerId) {
  return activePlayers.map((player) => {
    const playing = participation[player.id] !== false;

    if (!playing) {
      return {
        playerId: player.id,
        playerName: player.name,
        playing: false,
        won: false,
        scoreChange: -1,
      };
    }

    const won = player.id === winnerId;
    return {
      playerId: player.id,
      playerName: player.name,
      playing: true,
      won,
      scoreChange: won ? 0 : -2,
    };
  });
}
