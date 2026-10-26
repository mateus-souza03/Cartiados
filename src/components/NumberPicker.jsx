import NumberStepper from './NumberStepper';

const MAX_CHIPS = 12;

/**
 * Seletor de número por toque: mostra um botão para cada valor de 0 até `max`.
 * Para faixas grandes (ou sem limite) cai no stepper tradicional.
 */
export default function NumberPicker({ value, onChange, max, label, forbiddenValue }) {
  if (max === undefined || max === '' || Number(max) > MAX_CHIPS) {
    return <NumberStepper label={label} max={max || undefined} value={value} onChange={onChange} />;
  }

  const options = Array.from({ length: Number(max) + 1 }, (_, i) => i);
  const selected = value === '' || value === null || value === undefined ? null : Number(value);

  return (
    <div className="picker" role="radiogroup" aria-label={label}>
      {options.map((n) => {
        const forbidden = n === forbiddenValue;
        const isSelected = n === selected;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={forbidden}
            title={forbidden ? 'Valor proibido para o pé' : undefined}
            className={`picker-option ${isSelected ? 'picker-option-selected' : ''} ${
              forbidden ? 'picker-option-forbidden' : ''
            }`}
            onClick={() => onChange(String(n))}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
