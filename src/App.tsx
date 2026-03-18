import { useState } from 'react';
import PlanSelector, { type Plan } from './components/PlanSelector';
import AmountInput from './components/AmountInput';
import styles from './App.module.css';

function App() {
  const [plan, setPlan] = useState<Plan>('simple');
  const [amount, setAmount] = useState('');

  console.log('狀態:', { plan, amount });

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>玉山 Unicard 最佳扣點計算機</h1>
      <PlanSelector selected={plan} onChange={setPlan} />
      <AmountInput value={amount} onChange={setAmount} />
    </div>
  );
}

export default App;
