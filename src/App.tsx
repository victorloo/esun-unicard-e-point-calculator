import { useState } from 'react';
import PlanSelector, { type Plan } from './components/PlanSelector';
import AmountInput from './components/AmountInput';
import ModeToggle from './components/ModeToggle';
import ResultTable from './components/ResultTable';
import styles from './App.module.css';

function App() {
  const [plan, setPlan] = useState<Plan>('simple');
  const [amount, setAmount] = useState('');
  const [detailed, setDetailed] = useState(false);

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>玉山 Unicard 最佳扣點計算機</h1>
      <PlanSelector selected={plan} onChange={setPlan} />
      <AmountInput value={amount} onChange={setAmount} />
      <ModeToggle detailed={detailed} onChange={setDetailed} />
      <ResultTable amount={Number(amount)} plan={plan} detailed={detailed} />
    </div>
  );
}

export default App;
