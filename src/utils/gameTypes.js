/**
 * Registro dos jogos suportados pelo app. Cada tipo de jogo tem seu próprio
 * conjunto de regras de pontuação e encerramento — hoje só "F#dinha" está
 * implementado, mas novos tipos (ex: Cacheta) entram aqui futuramente.
 */
export const GAME_TYPES = [
  {
    id: 'fodinha',
    name: 'F#dinha',
    icon: '🃏',
    tagline: 'Declare quantos pontos vai fazer e acerte exatamente — nem mais, nem menos.',
  },
];

export function getGameType(id) {
  return GAME_TYPES.find((g) => g.id === id) ?? GAME_TYPES[0];
}
