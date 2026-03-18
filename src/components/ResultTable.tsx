import { useState, useMemo } from 'react';
import { calcTotal, calcRedemptionTable, type RedemptionRow } from '../lib/calculator';
import { type Plan } from './PlanSelector';
import styles from './ResultTable.module.css';

interface ResultTableProps {
  amount: number;
  plan: Plan;
  detailed: boolean;
}

const BONUS_RATES: Record<Plan, number> = {
  simple: 0.02,
  custom: 0.025,
  up: 0.035,
};

const R_BASE = 0.01;
const COLLAPSE_THRESHOLD = 6;
const SHOW_HEAD = 5;

function ResultTable({ amount, plan, detailed }: ResultTableProps) {
  const [expanded, setExpanded] = useState(false);
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
      rows,
    };
  }, [amount, rBonus]);

  if (!result) return null;

  if (!detailed) {
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

  // 完整模式
  const { rows } = result;
  const shouldCollapse = !expanded && rows.length > COLLAPSE_THRESHOLD;
  const hiddenCount = rows.length - SHOW_HEAD - 1;

  const renderDetailRow = (row: RedemptionRow, isFirst: boolean) => (
    <tr key={row.minAmount} className={isFirst ? styles.recommended : ''}>
      <td>{row.totalPoints} 點</td>
      <td>{row.basePoints}</td>
      <td>{row.bonusPoints}</td>
      <td>{row.minAmount}–{row.maxAmount} 元</td>
      <td>{row.maxRedeem} 元</td>
    </tr>
  );

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>合計點數</th>
          <th>基本</th>
          <th>加碼</th>
          <th>金額範圍</th>
          <th>最多可折</th>
        </tr>
      </thead>
      <tbody>
        {shouldCollapse ? (
          <>
            {rows.slice(0, SHOW_HEAD).map((row, i) => renderDetailRow(row, i === 0))}
            <tr>
              <td colSpan={5} className={styles.expandRow}>
                <button className={styles.expandButton} onClick={() =>
                  setExpanded(true)}>
                  展開中間 {hiddenCount} 行
                </button>
              </td>
            </tr>
            {renderDetailRow(rows[rows.length - 1], false)}
          </>
        ) : (
          <>
            {rows.map((row, i) => renderDetailRow(row, i === 0))}
            {expanded && (
              <tr>
                <td colSpan={5} className={styles.expandRow}>
                  <button className={styles.expandButton} onClick={() =>
                    setExpanded(false)}>
                    收合
                  </button>
                </td>
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  );
}

export default ResultTable;
