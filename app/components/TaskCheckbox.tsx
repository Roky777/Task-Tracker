"use client";

type TaskCheckboxProps = {
  checked: boolean;
  label: string;
  onChange: () => void;
};

/**
 * The task tick box, in the offset-shadow style.
 *
 * The visible box is the <div>; the real <input> sits behind it at opacity 0,
 * still covering the same area. That way the browser handles focus, keyboard
 * space-to-toggle and the label association for free, and the CSS only has to
 * react to :checked — no aria-pressed or key handlers needed.
 */
export default function TaskCheckbox({
  checked,
  label,
  onChange,
}: TaskCheckboxProps) {
  return (
    <label className="cb" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="cb-mark" />
    </label>
  );
}
