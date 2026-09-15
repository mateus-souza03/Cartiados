/**
 * Regras de pontuação do Truco: cada mão vale 1, 3, 6, 9 ou 12 pontos,
 * dependendo do quanto foi pedido (truco, seis, nove ou doze). O time que
 * atingir 12 pontos primeiro vence a mão, soma 1 no placar de partidas e a
 * pontuação da mão reinicia para 0 x 0.
 */
export const TRUCO_TARGET_SCORE = 12;
export const TRUCO_MAO_DE_ONZE_SCORE = 11;
export const TRUCO_POINT_OPTIONS = [1, 3, 6, 9, 12];

export function isMaoDeOnze(score) {
  return score === TRUCO_MAO_DE_ONZE_SCORE;
}
