import { useMemo } from 'react';
import { calcTotal, calcRedemptionTable } from '../lib/calculator';
import { type Plan } from './PlanSelector';
import styles from './ResultTable.module.css';

interface ResultTableProps {
  amount: number;
  plan: Plan;
}

const BONUS_RATES: Record<Plan, number> = {
  simple: 0.02,
  custom: 0.025,
  up: 0.035,
};

const R_BASE = 0.01;

function ResultTable({ amount, plan }: ResultTableProps) {
  const rBonus = BONUS_RATES[plan];

  const result = useMemo(() => {
    if (isNaN(amount) || amount <= 0) return null;

    const rows = calcRedemptionTable(amount, R_BASE, rBonus);
    const maxRedeem = Math.floor(0.3 * amount);
    const afterMaxRedeem = amount - maxRedeem;

    return {
      original: {
        amount,
        points: calcTotal(amount, R_BASE, rBonus),
      },
      noDrop: {
        amount: rows[0].minAmount,
        points: rows[0].totalPoints,
        redeem: rows[0].maxRedeem,
      },
      maxRedeem: {
        amount: afterMaxRedeem,
        points: calcTotal(afterMaxRedeem, R_BASE, rBonus),
        redeem: maxRedeem,
      },
    };
  }, [amount, rBonus]);

  if (!result) return null;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th></th>
          <th>有效金額</th>
          <th>回饋點數</th>
          <th>折抵金額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>原始</td>
          <td>{result.original.amount} 元</td>
          <td>{result.original.points} 點</td>
          <td>—</td>
        </tr>
        <tr className={styles.recommended}>
          <td>建議（不掉點）</td>
          <td>{result.noDrop.amount} 元</td>
          <td>{result.noDrop.points} 點</td>
          <td>{result.noDrop.redeem} 元</td>
        </tr>
        <tr>
          <td>最大折抵</td>
          <td>{result.maxRedeem.amount} 元</td>
          <td>{result.maxRedeem.points} 點</td>
          <td>{result.maxRedeem.redeem} 元</td>
        </tr>
      </tbody>
    </table>
  );
}

export default ResultTable;
