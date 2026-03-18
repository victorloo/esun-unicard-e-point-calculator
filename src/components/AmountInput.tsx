import styles from './AmountInput.module.css';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        消費金額（元）
        <input
          type="number"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="輸入金額"
          min="0"
        />
      </label>
    </div>
  );
}

export default AmountInput;
