import { useCallback, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover } from "./Popover";
import popoverStyles from "./Popover.module.css";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
}

export function Select({ value, onChange, options, label }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = options.find((option) => option.value === value) ?? options[0];
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((next) => !next)}
      >
        <span>{current?.label}</span>
        <ChevronDown />
      </button>
      <Popover
        anchor={triggerRef.current}
        open={open}
        onClose={close}
        align="start"
        matchWidth
        role="listbox"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            id={option.value === value ? listId : undefined}
            aria-selected={option.value === value}
            className={popoverStyles.item}
            onClick={() => {
              onChange(option.value);
              close();
            }}
          >
            <span>{option.label}</span>
            {option.value === value && <Check />}
          </button>
        ))}
      </Popover>
    </div>
  );
}
