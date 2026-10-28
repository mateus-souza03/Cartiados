import { useRef, useState } from 'react';
import { END_CONDITIONS, END_CONDITION_LABELS } from '../utils/gameRules';
import { getGameType } from '../utils/gameTypes';
import NumberStepper from '../components/NumberStepper';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 12;

let rowSeq = 0;
const makeRowId = () => `row-${(rowSeq += 1)}`;

export default function NewGame({ gameType, onCreate, onCancel }) {
  const gameTypeInfo = getGameType(gameType);
  const isCacheta = gameTypeInfo.id === 'cacheta';
  const isTruco = gameTypeInfo.id === 'truco';

  const [players, setPlayers] = useState(() =>
    (isTruco ? ['Nós', 'Eles'] : ['', '']).map((name) => ({ id: makeRowId(), name })),
  );
  const inputRefs = useRef({});
  const focusOnMount = useRef(null);
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

  const canAdd = !isTruco && players.length < MAX_PLAYERS;
  const canRemove = !isTruco && players.length > MIN_PLAYERS;

  const handleNameChange = (id, value) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));
    setError('');
  };

  const handleAddPlayer = () => {
    if (!canAdd) return;
    const id = makeRowId();
    focusOnMount.current = id;
    setPlayers((prev) => [...prev, { id, name: '' }]);
  };

  const handleRemovePlayer = (id) => {
    if (!canRemove) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Enter num nome pula para o próximo; no último, cria um novo jogador
  // (em vez de enviar o formulário pela metade).
  const handleNameKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const next = players[index + 1];
    if (next) {
      inputRefs.current[next.id]?.focus();
    } else if (players[index].name.trim()) {
      handleAddPlayer();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emptyIndex = players.findIndex((p) => !p.name.trim());
    if (emptyIndex >= 0) {
      setError(
        isTruco
          ? 'Preencha o nome dos dois times.'
          : `Preencha o nome do Jogador ${emptyIndex + 1}${canRemove ? ' ou remova-o (✕)' : ''}.`,
      );
      inputRefs.current[players[emptyIndex].id]?.focus();
      return;
    }
    const seen = new Set();
    const duplicate = players.find((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (duplicate) {
      setError(`Tem dois jogadores chamados "${duplicate.name.trim()}". Use nomes diferentes.`);
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
      players: players.map((p) => p.name.trim()),
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

        <div className="player-name-list">
          {!isTruco && (
            <div className="player-name-list-header">
              <span>Jogadores</span>
              <span className="badge badge-small">{players.length}</span>
            </div>
          )}

          {players.map((player, i) => {
            const showRoles = !isTruco;
            const isDealer = showRoles && i === 0;
            const isStarter = showRoles && i === 1;
            const inputId = `player-name-${player.id}`;

            return (
              <div className="field" key={player.id}>
                <label htmlFor={inputId}>
                  {isTruco ? `Time ${i + 1}` : `Jogador ${i + 1}`}
                  {isDealer && <span className="badge badge-muted"> 🃏 Dá as cartas / Pé</span>}
                  {isStarter && <span className="badge starter-badge"> 🎯 Começa</span>}
                </label>
                <div className="player-name-row">
                  <input
                    id={inputId}
                    ref={(el) => {
                      inputRefs.current[player.id] = el;
                      if (el && focusOnMount.current === player.id) {
                        focusOnMount.current = null;
                        el.focus();
                      }
                    }}
                    type="text"
                    value={player.name}
                    enterKeyHint={i === players.length - 1 && canAdd ? 'enter' : 'next'}
                    autoCapitalize="words"
                    placeholder={isTruco ? `Nome do time ${i + 1}` : `Nome do jogador ${i + 1}`}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    onKeyDown={(e) => handleNameKeyDown(e, i)}
                  />
                  {canRemove && (
                    <button
                      type="button"
                      className="player-remove-btn"
                      aria-label={`Remover ${player.name.trim() || `jogador ${i + 1}`}`}
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!isTruco &&
            (canAdd ? (
              <button type="button" className="add-player-btn" onClick={handleAddPlayer}>
                + Jogador
              </button>
            ) : (
              <p className="section-hint">Limite de {MAX_PLAYERS} jogadores.</p>
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
