export default function StepIndicator({ steps, current }) {
  return (
    <ol className="steps" aria-label="Etapas da rodada">
      {steps.map((label, i) => {
        const state = i < current ? 'step-done' : i === current ? 'step-current' : '';
        return (
          <li key={label} className={`step ${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="step-dot">{i < current ? '✓' : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
