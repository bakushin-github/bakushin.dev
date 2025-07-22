"use client";
import styles from "./honeypotField.module.scss";

/**
 * ハニーポットフィールドコンポーネント（useFormContextを使用しない版）
 */
const HoneypotField = ({ value, onChange }) => {
  return (
    <div className={styles.honeypotField} aria-hidden="true">
      <input
        id="website"
        name="website"
        type="text"
        tabIndex="-1"
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default HoneypotField;
