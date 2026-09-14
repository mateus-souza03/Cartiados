import { GAME_TYPES } from '../utils/gameTypes';

export default function SelectGameType({ onSelect, onBack }) {
  return (
    <div className="new-game">
      <h1 className="page-title">Escolher jogo</h1>
      <p className="section-subtitle">Selecione as regras que valem para esta partida.</p>

      <div className="game-type-list">
        {GAME_TYPES.map((g) => (
          <button
            key={g.id}
            type="button"
            className="game-type-card"
            onClick={() => onSelect(g.id)}
          >
            <span className="game-type-icon">{g.icon}</span>
            <span className="game-type-info">
              <span className="game-type-name">{g.name}</span>
              <span className="game-type-tagline">{g.tagline}</span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-ghost btn-block" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
