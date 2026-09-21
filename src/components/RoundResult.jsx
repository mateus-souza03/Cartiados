import { useState } from 'react';
import NumberStepper from './NumberStepper';

export default function RoundResult({ players, declarations, results, onUpdate, onFinalize }) {
  const [error, setError] = useState('');

  const activePlayers = players.filter((p) => p.score > 0);

  const handleFinalize = () => {
    for (const p of activePlayers) {
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
        {activePlayers.map((p) => (
          <div key={p.id} className="declaration-card">
            <div className="declaration-name">{p.name}</div>
            <div className="declaration-fields">
              <div className="field field-static">
                <span>Declarou</span>
                <div className="static-value">{declarations[p.id]?.declared ?? 0}</div>
              </div>
              <div className="field">
                <span>Pontos realizados</span>
                <NumberStepper
                  label="pontos realizados"
                  value={results[p.id] ?? ''}
                  onChange={(value) => onUpdate(p.id, value)}
                />
              </div>
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
