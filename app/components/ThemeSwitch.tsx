"use client";

import type { CSSProperties } from "react";

type ThemeSwitchProps = {
  checked: boolean;
  label: string;
  onChange: () => void;
};

/** Angles the particles fly out along when the switch is turned on. */
const PARTICLE_ANGLES = ["30deg", "60deg", "90deg", "120deg", "150deg", "180deg"];

/**
 * The dark-mode switch: an orb that travels across a starfield, with energy
 * lines and a particle burst once it is on.
 *
 * As with the checkbox, the real <input> is hidden and everything reacts to
 * :checked in CSS, so keyboard and screen-reader behaviour comes for free.
 */
export default function ThemeSwitch({
  checked,
  label,
  onChange,
}: ThemeSwitchProps) {
  return (
    <div className="switch-scale">
      <label className="cosmic-toggle" aria-label={label}>
        <input
          className="toggle"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <div className="slider">
          <div className="cosmos" />
          <div className="energy-line" />
          <div className="energy-line" />
          <div className="energy-line" />
          <div className="toggle-orb">
            <div className="inner-orb" />
            <div className="ring" />
          </div>
          <div className="particles">
            {PARTICLE_ANGLES.map((angle) => (
              // Each particle gets its own --angle, which the burst keyframes
              // read to work out which direction to fly in. Custom properties
              // are not part of React's CSSProperties type, hence the cast.
              <div
                key={angle}
                className="particle"
                style={{ "--angle": angle } as CSSProperties}
              />
            ))}
          </div>
        </div>
      </label>
    </div>
  );
}
