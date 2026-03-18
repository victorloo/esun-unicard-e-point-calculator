# 玉山 Unicard 最佳扣點計算機

計算玉山 Unicard 在折抵紅利點數（e point）時，如何折抵才能讓回饋點數最大化。

核心問題：回饋是**逐筆四捨五入**計算的，折抵帳單時要怎麼折，才不會因為四捨五入而損失點數？

---

## 官方規則摘要

> 資料來源：[玉山 Unicard 官方頁面](https://www.esunbank.com/zh-tw/personal/credit-card/intro/bank-card/unicard)（2026-03-17 存取）

### 基本回饋

| 條件 | 回饋率 |
|------|--------|
| 僅申辦帳單 e 化 | 0.3% |
| 帳單 e 化 **+** 玉山臺幣帳戶自動扣繳 | **1%**（無上限） |

- **店家請款後即時回饋**（正附卡合併計算，回饋予正卡人）
- 逐筆以實際刷卡請款金額計算，**四捨五入至整數，未滿 1 點不列入回饋**

### 百大指定消費加碼

持卡人可選擇三種方案，以每月最後一日的選定方案計算：

| 方案 | 額外回饋率 | 月回饋上限 | 條件 |
|------|-----------|-----------|------|
| **簡單選** | +2% | 1,000 點 | 無特殊條件 |
| **任意選**（選 8 家） | +2.5% | 1,000 點 | 自選 8 家百大通路 |
| **UP 選**（訂閱制） | +3.5% | 5,000 點 | 見下方訂閱條件 |

- **次月 17 日起回饋**（消費需於次月 10 日前請款）
- 同樣逐筆以實際刷卡請款金額計算，四捨五入至整數
- 僅適用於百大指定消費，一般消費不享加碼

### UP 選訂閱條件

須**同時符合**以下兩個條件才可免費訂閱，否則扣 **149 點 e point**：

1. 上月玉山 Unicard 刷卡金額 ≥ 30,000 元
2. 上月玉山平均資產金額 ≥ 300,000 元

### 紅利點數折抵

- **1 點 = 1 元**
- 折抵對象是「已請款、未出帳」的**單筆交易**，不是整期帳單總額
- 單筆折抵上限：該筆交易金額的 **30%**
- 可手動輸入折抵金額

### 排除項目（不適用加碼回饋）

- 四大超商、全聯（綁行動支付時）
- 菸酒等法定不得促銷商品
- 帳單分期、預借現金、餘額代償
- 各項手續費、代收費用、年費

---

## 公式定義

### 變數

- `s_i` = 第 `i` 筆已請款交易金額（新台幣，整數）
- `d_i` = 第 `i` 筆實際折抵金額
- `c_i` = 該筆交易是否符合百大指定消費資格（boolean）
- `p` = 當月方案（`simple` / `custom` / `up`）
- `round(n)` = 四捨五入至整數

### 基本回饋率

```txt
r_base ∈ {0.003, 0.01}

r_base =
  0.01   帳單 e 化 + 玉山臺幣帳戶自動扣繳
  0.003  僅帳單 e 化
```

### 加碼回饋率

```txt
r_bonus(i, p) =
  0      c_i = false（非百大指定消費）
  0.02   c_i = true, p = simple
  0.025  c_i = true, p = custom
  0.035  c_i = true, p = up
```

### 單筆交易回饋點數

```txt
P_i = round(s_i × r_base) + round(s_i × r_bonus(i, p))
```

若任一部分四捨五入後為 0，該部分就是 0 點（無保底）。

### 月回饋上限

```txt
Σ round(s_i × r_base)            無上限
Σ round(s_i × r_bonus)           simple / custom: ≤ 1,000 點
                                  up: ≤ 5,000 點
```

### 單筆折抵限制

```txt
0 ≤ d_i ≤ floor(0.3 × s_i)
```

### 重要：逐筆分開計算

基本回饋和加碼回饋**分開逐筆四捨五入**，不能合併成一個百分比：

```txt
✅ 正確：P_i = round(s_i × 0.01) + round(s_i × 0.035)
❌ 錯誤：P_i = round(s_i × 0.045)
```

反例：s_i = 160
- 正確：round(1.6) + round(5.6) = 2 + 6 = **8 點**
- 錯誤：round(7.2) = **7 點**（差 1 點）

---

## 四捨五入跳點門檻

### 通用門檻公式

要保住至少 `k` 點的最小整數金額：

```txt
x_min(k, r) = ceil((k - 0.5) / r)
```

### 各回饋率的起跳門檻

| 回饋率 | 跳點門檻 | 公式 |
|--------|---------|------|
| **1%** | 50, 150, 250, 350, 450, ... | `50 + 100n` |
| **2%** | 25, 75, 125, 175, 225, ... | `25 + 50n` |
| **2.5%** | 20, 60, 100, 140, 180, ... | `20 + 40n` |
| **3.5%** | 15, 43, 72, 100, 129, 158, 186, ... | 非等距，用通用公式 |

---

## 149 點訂閱決策

花 149 點訂閱 UP 選，實際買到的是加碼回饋率的提升。

### 從任意選升級（+2.5% → +3.5%，差額 1%）

```txt
E × 0.01 > 149  →  E > 14,900
```

### 從簡單選升級（+2% → +3.5%，差額 1.5%）

```txt
E × 0.015 > 149  →  E > 9,934
```

> `E` = 當月**符合百大指定消費資格**的消費總額，不是所有月消費。

### 決策表（從任意選升級）

| 當月百大指定消費預估 | UP 選免費條件 | 建議 |
|---------------------|-------------|------|
| < 14,900 元 | — | **不訂閱**，149 點折帳單更划算 |
| ≥ 14,900 元 | 不符合（刷卡 < 3 萬或資產 < 30 萬） | **花 149 點訂閱**，划算 |
| ≥ 14,900 元 | 符合（刷卡 ≥ 3 萬**且**資產 ≥ 30 萬） | **免費訂閱**，不需花點數 |

---

## 最佳折抵策略

### 假說 A：折抵不影響回饋計算基礎（目前採用）

官網描述回饋以「實際刷卡請款金額」計算，折抵是後續帳務操作。第一版採用此假設。

此時策略很單純：
1. **想折就折**，不影響點數獲取
2. 唯一要注意的是**保留 149 點**給 UP 選訂閱（若需要）
3. 受限於單筆 30% 折抵上限

### 假說 B：折抵後金額才是回饋基礎（備用模型）

若實測發現銀行用折抵後金額算回饋，公式改為：

```txt
P_i(d_i) = round((s_i - d_i) × r_base) + round((s_i - d_i) × r_bonus(i, p))
```

此時折抵後金額不能跌破當前點數區間的下限門檻：

```txt
最多可折 = s_i - x_min(k, r)
```

其中 `k` = 該筆交易原本可得的點數，`x_min` 用通用門檻公式計算。

**舉例**（UP 選 A+C，s_i = 287）：
- A 部分：round(287 × 0.01) = round(2.87) = 3 點 → 保住 3 點最低要 250 元
- C 部分：round(287 × 0.035) = round(10.045) = 10 點 → 保住 10 點最低要 272 元
- 要同時保住兩部分，取較嚴格的門檻 = **272 元**
- 最多可折 = 287 - 272 = **15 元**

---

## 第一版產品規格

1. 支援輸入每筆已請款交易金額
2. 支援標記每筆是否屬於百大指定消費
3. 支援選擇方案：簡單選 / 任意選 / UP 選
4. 支援選擇基本回饋狀態：0.3% 或 1%
5. 計算每筆交易：
   - 可折抵上限 `floor(0.3 × s_i)`
   - 預估回饋點數 `P_i`
6. 提供 149 點訂閱 UP 選的損益判斷
7. 「折抵是否影響回饋基礎」列為可切換的開關，不預設為既定事實

---

## 待驗證事項

1. **折抵是否影響回饋計算基礎？** — 最關鍵的假設，需用真實帳單實測
2. **四捨五入是 standard rounding 還是 banker's rounding？** — 影響 .5 邊界值
3. **月回饋上限是否包含基本回饋？** — 推測僅計算加碼部分
4. **百大指定消費的完整清單** — 影響哪些消費適用加碼
5. **149 點訂閱的扣點時序** — 是否影響跨月最佳化

---

## 開發節點（Commit 計畫）

### Commit 1：Docker 環境 + Vite 專案初始化

**做什麼：**
- `Dockerfile` + `docker-compose.yml`（node:22-alpine）
- 在容器內用 `npm create vite@latest` 建立 React + TypeScript 專案
- 確認 `docker compose up` 後能在 `localhost:5173` 看到 Vite 預設頁面
- 清理 Vite 預設的範例程式碼（App.tsx 只留空殼）
- `.gitignore` 設定

**學到什麼：**
- Vite 取代 CRA 的原因
- TypeScript 在 React 專案中的角色
- Docker mount 開發的運作方式

**驗證：** 瀏覽器開 `http://localhost:5173` 看到空白頁面

---

### Commit 2：核心計算邏輯（純函式，無 UI）

**做什麼：**
- `src/lib/calculator.ts` — 所有計算邏輯
  - `calcPoints(amount, rate)` — 單一回饋率的四捨五入點數
  - `calcTotal(amount, rBase, rBonus)` — A + B/C/D 總點數
  - `findThreshold(k, rate)` — 通用門檻公式 `ceil((k - 0.5) / r)`
  - `calcRedemptionTable(amount, rBase, rBonus)` — 產出完整折抵表格資料
    - 從原始金額到最大折抵後金額，找出每個掉點斷層
    - 回傳每一級的：合計點數、A 點數、加碼點數、金額範圍、最多可折
- `src/lib/calculator.test.ts` — 用 README.md 的例子寫測試
  - 287 元 UP 選 → 13 點
  - 160 元驗證分開算 vs 合併算
  - 邊界值：49 元 → 0 點、50 元 → 1 點

**學到什麼：**
- TypeScript 型別定義（interface / type）
- 純函式設計：邏輯與 UI 完全分離
- Vitest 測試框架（Vite 生態的測試工具）

**驗證：** `npm run test` 全部通過

---

### Commit 3：基本 UI 骨架 + 方案選擇

**做什麼：**
- `src/components/PlanSelector.tsx` — 三個方案的選擇（簡單選 / 任意選 / UP 選）
- `src/components/AmountInput.tsx` — 金額輸入框
- `src/App.tsx` — 組合以上元件，用 `useState` 管理狀態
- 基本的 CSS Modules 樣式

**學到什麼：**
- 函式組件 vs class 組件的寫法差異
- `useState` hook — 取代 `this.state` + `this.setState`
- CSS Modules 的 scoping 機制
- Props 的 TypeScript 型別標註

**驗證：** 能選方案、輸入金額，console.log 確認狀態正確

---

### Commit 4：簡潔模式表格（預設視圖）

**做什麼：**
- `src/components/ResultTable.tsx` — 顯示三行表格
  - 原始金額 → 點數
  - 最大折抵後金額 → 點數
  - 建議折抵後金額（不掉點）→ 點數
- 串接 Commit 2 的計算邏輯

**學到什麼：**
- `useMemo` hook — 避免每次 render 都重算（取代 class 的 `shouldComponentUpdate`）
- 條件渲染：金額為空時不顯示表格
- 元件之間的資料流（props drilling）

**驗證：** 輸入 287，選 UP 選，看到三行表格，數字正確

---

### Commit 5：完整模式表格 + 開關

**做什麼：**
- 擴充 `ResultTable.tsx`，加入完整模式
  - 顯示所有掉點斷層（如 13→12→11→10→9）
  - 預設顯示前 5 行 + 最後 1 行，中間摺疊
  - 展開按鈕可顯示全部
- `src/components/ModeToggle.tsx` — 簡潔/完整模式開關

**學到什麼：**
- 多個 `useState` 的組合使用（模式切換 + 摺疊狀態）
- 陣列的 `.map()` 渲染列表
- 條件樣式（CSS Modules 的動態 className）

**驗證：**
- 開關切換簡潔/完整模式
- 完整模式大金額時，中間行有摺疊，可展開
- 每行數字與 Commit 2 的測試一致

---

### Commit 6：樣式與 RWD

**做什麼：**
- 整體視覺設計（配色、字型、間距）
- 手機版響應式排版（主要使用場景應該是手機）
- 表格在小螢幕的呈現優化

**學到什麼：**
- CSS Modules 中的 media query
- 行動優先（mobile-first）的 CSS 寫法

**驗證：** 手機模擬器（Chrome DevTools）下操作流暢

---

### Commit 7：GitHub Pages 部署設定

**做什麼：**
- `vite.config.ts` 加入 `base` 路徑設定
- GitHub Actions workflow（`.github/workflows/deploy.yml`）
  - push to main → build → deploy to GitHub Pages
- `README.md` 加上 demo 連結

**學到什麼：**
- Vite 的 `base` 設定對靜態部署的影響
- GitHub Actions 基礎 CI/CD

**驗證：** push 後，GitHub Pages 上可正常使用

---

## 檔案結構預覽

```bash
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── App.tsx
│   ├── App.module.css
│   ├── main.tsx
│   ├── lib/
│   │   ├── calculator.ts        # 核心計算邏輯
│   │   └── calculator.test.ts   # 測試
│   └── components/
│       ├── PlanSelector.tsx      # 方案選擇
│       ├── PlanSelector.module.css
│       ├── AmountInput.tsx       # 金額輸入
│       ├── AmountInput.module.css
│       ├── ResultTable.tsx       # 結果表格（簡潔+完整）
│       ├── ResultTable.module.css
│       ├── ModeToggle.tsx        # 顯示模式開關
│       └── ModeToggle.module.css
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```
