import styles from './PlanSelector.module.css';

export type Plan = 'simple' | 'custom' | 'up';

interface PlanSelectorProps {
  selected: Plan;
  onChange: (plan: Plan) => void;
}

const plans: { value: Plan; label: string; description: string }[] = [
  { value: 'simple', label: '簡單選', description: '+2%，上限 1,000 點' },
  { value: 'custom', label: '任意選', description: '+2.5%，上限 1,000 點' },
  { value: 'up', label: 'UP 選', description: '+3.5%，上限 5,000 點' },
];

function PlanSelector({ selected, onChange }: PlanSelectorProps) {
  return (
    <div className={styles.container}>
      {plans.map((plan) => (
        <label key={plan.value} className={styles.option}>
          <input
            type="radio"
            name="plan"
            value={plan.value}
            checked={selected === plan.value}
            onChange={() => onChange(plan.value)}
          />
          <span className={styles.label}>{plan.label}</span>
          <span className={styles.description}>{plan.description}</span>
        </label>
      ))}
    </div>
  );
}

export default PlanSelector;
