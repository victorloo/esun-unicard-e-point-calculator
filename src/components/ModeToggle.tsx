import styles from './ModeToggle.module.css';

interface ModeToggleProps {
  detailed: boolean;
  onChange: (detailed: boolean) => void;
}

function ModeToggle({ detailed, onChange }: ModeToggleProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${!detailed ? styles.active : ''}`}
        onClick={() => onChange(false)}
      >
        簡潔
      </button>
      <button
        className={`${styles.button} ${detailed ? styles.active : ''}`}
        onClick={() => onChange(true)}
      >
        完整
      </button>
    </div>
  );
}

export default ModeToggle;
