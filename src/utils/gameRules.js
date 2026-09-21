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

/**
 * Jogador que distribui as cartas nesta rodada, rotacionando em ordem fixa.
 * Pula jogadores eliminados (pontuação zerada).
 */
export function getRoundDealer(players, round) {
  return getRoundStarter(players, round);
}

/**
 * Jogador que começa a jogar a rodada: o próximo ativo após o distribuidor.
 */
export function getRoundStarterAfterDealer(players, round) {
  if (!players.length) return null;
  const n = players.length;
  const dealer = getRoundDealer(players, round);
  const dealerIndex = players.findIndex((p) => p.id === dealer.id);

  for (let i = 1; i <= n; i++) {
    const candidate = players[(dealerIndex + i) % n];
    if (candidate.score > 0) return candidate;
  }

  return players[(dealerIndex + 1) % n];
}

/**
 * "Pé" da rodada: o último a jogar, ativo, imediatamente antes do distribuidor.
 */
export function getRoundPe(players, round) {
  if (!players.length) return null;
  const n = players.length;
  const dealer = getRoundDealer(players, round);
  const dealerIndex = players.findIndex((p) => p.id === dealer.id);

  for (let i = 1; i <= n; i++) {
    const candidate = players[(dealerIndex - i + n * 2) % n];
    if (candidate.score > 0) return candidate;
  }

  return players[(dealerIndex - 1 + n) % n];
}

/**
 * Reordena a lista para começar pelo jogador informado, mantendo a ordem
 * de mesa a partir dali (dá a volta para os que vêm antes dele).
 */
export function rotateToStart(players, startPlayerId) {
  const index = players.findIndex((p) => p.id === startPlayerId);
  if (index <= 0) return players;
  return [...players.slice(index), ...players.slice(0, index)];
}
