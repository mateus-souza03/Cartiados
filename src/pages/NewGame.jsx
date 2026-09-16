import { useState } from 'react';
import { END_CONDITIONS, END_CONDITION_LABELS } from '../utils/gameRules';
import { getGameType } from '../utils/gameTypes';
import NumberStepper from '../components/NumberStepper';

export default function NewGame({ gameType, onCreate, onCancel }) {
  const gameTypeInfo = getGameType(gameType);
  const isCacheta = gameTypeInfo.id === 'cacheta';
  const isTruco = gameTypeInfo.id === 'truco';

  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(() => (isTruco ? ['Nós', 'Eles'] : ['', '']));
  const [initialScore, setInitialScore] = useState(isCacheta ? 7 : 5);
  const [cardsPerRound, setCardsPerRound] = useState(1);
  const [endCondition, setEndCondition] = useState(END_CONDITIONS.LAST_SURVIVOR);
  const [endConditionValue, setEndConditionValue] = useState(10);
  const [allowNegative, setAllowNegative] = useState(false);
  const [error, setError] = useState('');

  const needsEndConditionValue =
    !isCacheta &&
    !isTruco &&
    (endCondition === END_CONDITIONS.MAX_ROUNDS || endCondition === END_CONDITIONS.TARGET_SCORE);

  const handlePlayerCountChange = (value) => {
    const count = Math.max(2, Math.min(12, Number(value) || 2));
    setPlayerCount(count);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('');
      return next.slice(0, count);
    });
  };

  const handleNameChange = (index, value) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (playerCount < 2) {
      setError('A partida precisa de pelo menos 2 jogadores.');
      return;
    }
    if (names.some((n) => !n.trim())) {
      setError('Preencha o nome de todos os jogadores.');
      return;
    }
    if (initialScore < 0) {
      setError('A pontuação inicial não pode ser negativa.');
      return;
    }
    if (!isCacheta && !isTruco && cardsPerRound < 1) {
      setError('A quantidade de cartas deve ser pelo menos 1.');
      return;
    }
    if (needsEndConditionValue && (!endConditionValue || endConditionValue < 1)) {
      setError('Informe um valor válido para a condição de encerramento.');
      return;
    }

    setError('');
    onCreate({
      gameType: gameTypeInfo.id,
      players: names.map((n) => n.trim()),
      initialScore: isTruco ? 0 : Number(initialScore),
      cardsPerRound: isCacheta || isTruco ? undefined : Number(cardsPerRound),
      allowNegative: isTruco ? false : allowNegative,
      endCondition: isTruco ? 'manual' : isCacheta ? END_CONDITIONS.LAST_SURVIVOR : endCondition,
      endConditionValue: isTruco ? 0 : Number(endConditionValue),
    });
  };

  return (
    <div className="new-game">
      <p className="game-type-eyebrow">
        {gameTypeInfo.icon} {gameTypeInfo.name}
      </p>
      <h1 className="page-title">Nova Partida</h1>

      <form onSubmit={handleSubmit} className="form">
        {!isTruco && (
          <div className="field">
            <span>Pontuação inicial</span>
            <NumberStepper label="pontuação inicial" min={0} value={initialScore} onChange={setInitialScore} />
          </div>
        )}

        {!isTruco && (
          <div className="field">
            <span>Quantidade de jogadores</span>
            <NumberStepper
              label="quantidade de jogadores"
              min={2}
              max={12}
              value={playerCount}
              onChange={handlePlayerCountChange}
            />
          </div>
        )}

        <div className="player-name-list">
          {names.map((name, i) => (
            <label className="field" key={i}>
              <span>{isTruco ? `Time ${i + 1}` : `Jogador ${i + 1}`}</span>
              <input
                type="text"
                value={name}
                placeholder={isTruco ? `Nome do time ${i + 1}` : `Nome do jogador ${i + 1}`}
                onChange={(e) => handleNameChange(i, e.target.value)}
              />
            </label>
          ))}
        </div>

        {!isCacheta && !isTruco && (
          <div className="field">
            <span>Quantidade de cartas por rodada</span>
            <NumberStepper label="quantidade de cartas por rodada" min={1} value={cardsPerRound} onChange={setCardsPerRound} />
          </div>
        )}

        {isCacheta ? (
          <p className="section-hint">
            A Cacheta termina quando restar apenas um jogador com pontos. Jogadores com 1 ponto são
            obrigados a jogar a rodada.
          </p>
        ) : isTruco ? (
          <p className="section-hint">
            Cada mão vale 1, 3, 6, 9 ou 12 pontos. Quem fizer 12 primeiro vence a mão e soma 1 no placar da
            partida — jogue quantas mãos quiser e use &quot;Nova partida&quot; quando encerrar.
          </p>
        ) : (
          <>
            <label className="field">
              <span>Condição de encerramento</span>
              <select value={endCondition} onChange={(e) => setEndCondition(e.target.value)}>
                {Object.values(END_CONDITIONS).map((c) => (
                  <option key={c} value={c}>
                    {END_CONDITION_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            {needsEndConditionValue && (
              <div className="field">
                <span>
                  {endCondition === END_CONDITIONS.MAX_ROUNDS ? 'Número de rodadas' : 'Pontuação alvo'}
                </span>
                <NumberStepper
                  label={endCondition === END_CONDITIONS.MAX_ROUNDS ? 'número de rodadas' : 'pontuação alvo'}
                  min={1}
                  value={endConditionValue}
                  onChange={setEndConditionValue}
                />
              </div>
            )}
          </>
        )}

        {!isTruco && (
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={allowNegative}
              onChange={(e) => setAllowNegative(e.target.checked)}
            />
            <span>Permitir pontuação negativa</span>
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          Começar partida
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={onCancel}>
          Voltar
        </button>
      </form>
    </div>
  );
}
