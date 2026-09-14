import { useState } from 'react';
import NumberStepper from './NumberStepper';

export default function RoundDeclaration({ players, declarations, onUpdate, onConfirm }) {
  const [error, setError] = useState('');

  const handleConfirm = () => {
    for (const p of players) {
      const d = declarations[p.id];
      if (d.declared === '' || d.declared === null || Number(d.declared) < 0) {
        setError(`Informe quantos pontos ${p.name} pretende fazer.`);
        return;
      }
    }
    setError('');
    onConfirm();
  };

  return (
    <section className="round-step">
      <h2 className="section-title">Declarações</h2>
      <p className="section-subtitle">Cada jogador informa quantos pontos pretende fazer nesta rodada.</p>

      <div className="declaration-list">
        {players.map((p) => (
          <div key={p.id} className="declaration-card">
            <div className="declaration-name">{p.name}</div>
            <div className="field">
              <span>Pontos que fará</span>
              <NumberStepper
                label="pontos que fará"
                value={declarations[p.id]?.declared ?? ''}
                onChange={(value) => onUpdate(p.id, 'declared', value)}
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn btn-primary btn-block" onClick={handleConfirm}>
        Continuar
      </button>
    </section>
  );
}
