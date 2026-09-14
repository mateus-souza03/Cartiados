import { useState } from 'react';
import { END_CONDITIONS, END_CONDITION_LABELS } from '../utils/gameRules';

export default function NewGame({ onCreate, onCancel, canCancel }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['', '']);
  const [initialScore, setInitialScore] = useState(5);
  const [cardsPerRound, setCardsPerRound] = useState(3);
  const [endCondition, setEndCondition] = useState(END_CONDITIONS.ZERO_SCORE);
  const [endConditionValue, setEndConditionValue] = useState(10);
  const [allowNegative, setAllowNegative] = useState(false);
  const [error, setError] = useState('');

  const needsEndConditionValue =
    endCondition === END_CONDITIONS.MAX_ROUNDS || endCondition === END_CONDITIONS.TARGET_SCORE;

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
    if (cardsPerRound < 1) {
      setError('A quantidade de cartas deve ser pelo menos 1.');
      return;
    }
    if (needsEndConditionValue && (!endConditionValue || endConditionValue < 1)) {
      setError('Informe um valor válido para a condição de encerramento.');
      return;
    }

    setError('');
    onCreate({
      players: names.map((n) => n.trim()),
      initialScore: Number(initialScore),
      cardsPerRound: Number(cardsPerRound),
      allowNegative,
      endCondition,
      endConditionValue: Number(endConditionValue),
    });
  };

  return (
    <div className="new-game">
      <h1 className="page-title">Nova Partida</h1>

      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Pontuação inicial</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={initialScore}
            onChange={(e) => setInitialScore(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Quantidade de jogadores</span>
          <input
            type="number"
            min="2"
            max="12"
            inputMode="numeric"
            value={playerCount}
            onChange={(e) => handlePlayerCountChange(e.target.value)}
          />
        </label>

        <div className="player-name-list">
          {names.map((name, i) => (
            <label className="field" key={i}>
              <span>Jogador {i + 1}</span>
              <input
                type="text"
                value={name}
                placeholder={`Nome do jogador ${i + 1}`}
                onChange={(e) => handleNameChange(i, e.target.value)}
              />
            </label>
          ))}
        </div>

        <label className="field">
          <span>Quantidade de cartas por rodada</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={cardsPerRound}
            onChange={(e) => setCardsPerRound(e.target.value)}
          />
        </label>

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
          <label className="field">
            <span>
              {endCondition === END_CONDITIONS.MAX_ROUNDS ? 'Número de rodadas' : 'Pontuação alvo'}
            </span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={endConditionValue}
              onChange={(e) => setEndConditionValue(e.target.value)}
            />
          </label>
        )}

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={allowNegative}
            onChange={(e) => setAllowNegative(e.target.checked)}
          />
          <span>Permitir pontuação negativa</span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          Começar partida
        </button>
        {canCancel && (
          <button type="button" className="btn btn-ghost btn-block" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}
