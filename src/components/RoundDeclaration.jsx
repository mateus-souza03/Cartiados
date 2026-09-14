import { useState } from 'react';
import NumberStepper from './NumberStepper';

export default function RoundDeclaration({ players, declarations, onUpdate, onConfirm }) {
  const [error, setError] = useState('');

  const handleConfirm = () => {
    for (const p of players) {
      const d = declarations[p.id];
      if (d.cards === '' || d.cards === null || Number(d.cards) < 0) {
        setError(`Informe a quantidade de cartas de ${p.name}.`);
        return;
      }
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
      <p className="section-subtitle">Cada jogador informa as cartas na mão e quantos pontos pretende fazer.</p>

      <div className="declaration-list">
        {players.map((p) => (
          <div key={p.id} className="declaration-card">
            <div className="declaration-name">{p.name}</div>
            <div className="declaration-fields">
              <div className="field">
                <span>Cartas na mão</span>
                <NumberStepper
                  label="cartas na mão"
                  value={declarations[p.id]?.cards ?? ''}
                  onChange={(value) => onUpdate(p.id, 'cards', value)}
                />
              </div>
              <div className="field">
                <span>Pontos que fará</span>
                <NumberStepper
                  label="pontos que fará"
                  value={declarations[p.id]?.declared ?? ''}
                  onChange={(value) => onUpdate(p.id, 'declared', value)}
                />
              </div>
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
