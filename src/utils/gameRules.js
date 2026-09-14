/**
 * Regras de encerramento de partida, desacopladas da lógica de pontuação
 * para permitir novas condições no futuro sem reescrever a aplicação.
 */
export const END_CONDITIONS = {
  LAST_SURVIVOR: 'last_survivor',
  ZERO_SCORE: 'zero_score',
  MAX_ROUNDS: 'max_rounds',
  TARGET_SCORE: 'target_score',
};

export const END_CONDITION_LABELS = {
  [END_CONDITIONS.LAST_SURVIVOR]: 'Terminar no último sobrevivente (demais zerados)',
  [END_CONDITIONS.ZERO_SCORE]: 'Terminar quando um jogador zerar os pontos',
  [END_CONDITIONS.MAX_ROUNDS]: 'Terminar após um número fixo de rodadas',
  [END_CONDITIONS.TARGET_SCORE]: 'Terminar quando alguém atingir uma pontuação alvo',
};

const strategies = {
  [END_CONDITIONS.ZERO_SCORE]: (game) => {
    const loser = game.players.find((p) => p.score <= 0);
    return Boolean(loser);
  },
  [END_CONDITIONS.MAX_ROUNDS]: (game) => {
    const completedRounds = game.history.length;
    return completedRounds >= (game.endConditionValue || 1);
  },
  [END_CONDITIONS.TARGET_SCORE]: (game) => {
    return game.players.some((p) => p.score >= (game.endConditionValue || 0));
  },
  [END_CONDITIONS.LAST_SURVIVOR]: (game) => {
    if (game.players.length < 2) return false;
    const survivors = game.players.filter((p) => p.score > 0);
    return survivors.length <= 1;
  },
};

export function isGameOver(game) {
  if (!game) return false;
  const strategy = strategies[game.endCondition];
  if (!strategy) return false;
  return strategy(game);
}

export function getWinner(game) {
  if (!game || game.players.length === 0) return null;
  return [...game.players].sort((a, b) => b.score - a.score)[0];
}

export function getRankedPlayers(players) {
  return [...players].sort((a, b) => b.score - a.score);
}

/**
 * Jogador que começa a rodada, rotacionando em ordem fixa a cada rodada.
 * Pula jogadores eliminados (pontuação zerada), mantendo a sequência entre
 * os que ainda estão na partida.
 */
export function getRoundStarter(players, round) {
  if (!players.length) return null;
  const n = players.length;
  const startIndex = (round - 1) % n;

  for (let i = 0; i < n; i++) {
    const candidate = players[(startIndex + i) % n];
    if (candidate.score > 0) return candidate;
  }

  return players[startIndex];
}
