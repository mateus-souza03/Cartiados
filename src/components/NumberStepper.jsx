export default function NumberStepper({ value, onChange, min = 0, max, label }) {
  const numericValue = value === '' || value === null || value === undefined ? 0 : Number(value);

  const clamp = (n) => {
    let next = n;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    return next;
  };

  const handleDecrement = () => onChange(String(clamp(numericValue - 1)));
  const handleIncrement = () => onChange(String(clamp(numericValue + 1)));

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    onChange(String(clamp(Number(raw))));
  };

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper-btn"
        onClick={handleDecrement}
        aria-label={`Diminuir ${label ?? 'valor'}`}
      >
        −
      </button>
      <input
        className="stepper-value"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={handleInputChange}
        onFocus={(e) => e.target.select()}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={handleIncrement}
        aria-label={`Aumentar ${label ?? 'valor'}`}
      >
        +
      </button>
    </div>
  );
}
