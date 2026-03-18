import { describe, it, expect } from 'vitest';
import {
  calcPoints,
  calcTotal,
  findThreshold,
  calcRedemptionTable,
} from './calculator';

describe('calcPoints', () => {
  it('287 元 × 1% = 3 點', () => {
    expect(calcPoints(287, 0.01)).toBe(3);
  });

  it('287 元 × 3.5% = 10 點', () => {
    expect(calcPoints(287, 0.035)).toBe(10);
  });

  it('49 元 × 1% = 0 點（未達門檻）', () => {
    expect(calcPoints(49, 0.01)).toBe(0);
  });

  it('50 元 × 1% = 1 點（四捨五入邊界）', () => {
    expect(calcPoints(50, 0.01)).toBe(1);
  });
});

describe('calcTotal', () => {
  it('287 元 UP 選 = 13 點（基本 3 + 加碼 10）', () => {
    expect(calcTotal(287, 0.01, 0.035)).toBe(13);
  });

  it('160 元 UP 選 = 8 點（分開算，不是合併的 7 點）', () => {
    // 分開：round(1.6) + round(5.6) = 2 + 6 = 8
    // 合併（錯誤）：round(160 × 0.045) = round(7.2) = 7
    expect(calcTotal(160, 0.01, 0.035)).toBe(8);
  });
});

describe('findThreshold', () => {
  it('1% 的第 1 點門檻 = 50', () => {
    expect(findThreshold(1, 0.01)).toBe(50);
  });

  it('1% 的第 3 點門檻 = 250', () => {
    expect(findThreshold(3, 0.01)).toBe(250);
  });

  it('3.5% 的第 10 點門檻 = 272', () => {
    expect(findThreshold(10, 0.035)).toBe(272);
  });
});

describe('calcRedemptionTable', () => {
  it('287 元 UP 選，產出 5 個斷層（13→9）', () => {
    const rows = calcRedemptionTable(287, 0.01, 0.035);
    expect(rows.map(r => r.totalPoints)).toEqual([13, 12, 11, 10, 9]);
  });

  it('287 元 UP 選，不掉點最多折 15 元', () => {
    const rows = calcRedemptionTable(287, 0.01, 0.035);
    expect(rows[0].maxRedeem).toBe(15);
  });

  it('287 元 UP 選，最多可折 86 元', () => {
    const rows = calcRedemptionTable(287, 0.01, 0.035);
    expect(rows[rows.length - 1].maxRedeem).toBe(86);
  });
});
