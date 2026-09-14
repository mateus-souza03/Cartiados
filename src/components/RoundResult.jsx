import { useState } from 'react';

export default function RoundResult({ players, declarations, results, onUpdate, onFinalize }) {
  const [error, setError] = useState('');

  const handleFinalize = () => {
    for (const p of players) {
      const value = results[p.id];
      if (value === '' || value === null || value === undefined || Number(value) < 0) {
        setError(`Informe quantos pontos ${p.name} fez.`);
        return;
      }
    }
    setError('');
    onFinalize();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Resultado da rodada</h2>
      <p className="section-subtitle">Informe quantos pontos cada jogador realmente fez.</p>

      <div className="declaration-list">
        {players.map((p) => (
          <div key={p.id} className="declaration-card">
            <div className="declaration-name">{p.name}</div>
            <div className="declaration-fields">
              <div className="field field-static">
                <span>Declarou</span>
                <div className="static-value">{declarations[p.id]?.declared ?? 0}</div>
              </div>
              <label className="field">
                <span>Pontos realizados</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={results[p.id] ?? ''}
                  onChange={(e) => onUpdate(p.id, e.target.value)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleFinalize}>
        Finalizar rodada
      </button>
    </section>
  );
}
