import React from 'react';
import './NumericKeypad.css';

/**
 * On-screen numeric keypad for the training session on touch devices.
 *
 * Purely presentational — it holds no state and does no answer checking; it
 * just reports taps upward so TrainingSession keeps owning the answer logic.
 *
 * Rendered only on mobile, where TrainingSession shows a plain <div> instead
 * of an <input> so the OS keyboard can never appear.
 *
 * No minus key: all 1390 official problems have a non-negative answer
 * (range 0..9021), so the space goes to bigger, easier-to-tap keys.
 */
function NumericKeypad({ onDigit, onBackspace, onClear, onSubmit, disabled = false }) {
  // Calculator layout: 3 columns × 4 rows.
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <div className="numpad" role="group" aria-label="لوحة إدخال الأرقام">
      <div className="numpad-grid">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            className="numpad-key"
            disabled={disabled}
            onClick={() => onDigit(k)}
            aria-label={k}
          >
            {k}
          </button>
        ))}

        <button
          type="button"
          className="numpad-key numpad-key-action"
          disabled={disabled}
          onClick={onClear}
          aria-label="مسح الكل"
        >
          C
        </button>

        <button
          type="button"
          className="numpad-key"
          disabled={disabled}
          onClick={() => onDigit('0')}
          aria-label="0"
        >
          0
        </button>

        <button
          type="button"
          className="numpad-key numpad-key-action"
          disabled={disabled}
          onClick={onBackspace}
          aria-label="حذف آخر رقم"
        >
          ⌫
        </button>
      </div>

      <button
        type="button"
        className="numpad-submit"
        disabled={disabled}
        onClick={onSubmit}
      >
        ✓ تأكيد الإجابة
      </button>
    </div>
  );
}

export default NumericKeypad;
