/**
 * Regra de pontuação: o jogador deve acertar exatamente a quantidade declarada.
 * Qualquer diferença, para mais ou para menos, gera penalidade igual à diferença absoluta.
 */
export function calculateRoundScore(declared, achieved) {
  const d = Number(declared);
  const a = Number(achieved);
  const penalty = Math.abs(d - a);

  return {
    declared: d,
    achieved: a,
    penalty,
    scoreChange: -penalty,
    success: d === a,
  };
}

export function applyScoreChange(currentScore, scoreChange, allowNegative = false) {
  const next = currentScore + scoreChange;
  if (!allowNegative && next < 0) return 0;
  return next;
}
