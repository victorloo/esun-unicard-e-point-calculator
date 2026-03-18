/** 單一回饋率的四捨五入點數 */
export function calcPoints(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

/** A + B/C/D 總點數（基本 + 加碼分開四捨五入） */
export function calcTotal(amount: number, rBase: number, rBonus: number): number {
  return calcPoints(amount, rBase) + calcPoints(amount, rBonus);
}

/** 通用門檻公式：保住至少 k 點的最小金額 */
export function findThreshold(k: number, rate: number): number {
  // 減去微小值避免浮點誤差（例如 0.5/0.01 可能得到 50.0000000001）
  return Math.ceil((k - 0.5) / rate - 1e-9);
}

export interface RedemptionRow {
  totalPoints: number;
  basePoints: number;
  bonusPoints: number;
  minAmount: number;
  maxAmount: number;
  maxRedeem: number;
}

/** 產出完整折抵表格：從原始金額到最大折抵後金額的每個掉點斷層 */
export function calcRedemptionTable(
  amount: number,
  rBase: number,
  rBonus: number
): RedemptionRow[] {
  const maxRedeem = Math.floor(0.3 * amount);
  const minEffective = amount - maxRedeem;

  // 收集所有「跳點門檻」：base 和 bonus 各自的斷點
  const breakpoints = new Set<number>();
  breakpoints.add(minEffective);

  const baseAtMax = calcPoints(amount, rBase);
  const baseAtMin = calcPoints(minEffective, rBase);
  for (let k = baseAtMin + 1; k <= baseAtMax; k++) {
    const t = findThreshold(k, rBase);
    if (t > minEffective && t <= amount) {
      breakpoints.add(t);
    }
  }

  if (rBonus > 0) {
    const bonusAtMax = calcPoints(amount, rBonus);
    const bonusAtMin = calcPoints(minEffective, rBonus);
    for (let k = bonusAtMin + 1; k <= bonusAtMax; k++) {
      const t = findThreshold(k, rBonus);
      if (t > minEffective && t <= amount) {
        breakpoints.add(t);
      }
    }
  }

  // 由小到大排序
  const sorted = [...breakpoints].sort((a, b) => a - b);

  // 從最高有效金額往下建表
  const rows: RedemptionRow[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const minAmt = sorted[i];
    const maxAmt = i === sorted.length - 1 ? amount : sorted[i + 1] - 1;
    const basePoints = calcPoints(minAmt, rBase);
    const bonusPoints = calcPoints(minAmt, rBonus);

    rows.push({
      totalPoints: basePoints + bonusPoints,
      basePoints,
      bonusPoints,
      minAmount: minAmt,
      maxAmount: maxAmt,
      maxRedeem: amount - minAmt,
    });
  }

  return rows;
}
