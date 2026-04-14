import { useState } from 'react';

/**
 * @component ColorPickerSwatch
 * @description Lets users pick a color for an entity (project, epic, sprint).
 * Renders a palette of preset swatches + an optional free-form color input.
 *
 * The selected hex is the only output — the parent feature form owns the value.
 * This component has no knowledge of what entity it's coloring.
 *
 * @param {Object}   props
 * @param {string}   props.value              - Current hex color, e.g. "#3B6D11"
 * @param {Function} props.onChange           - (hex: string) => void
 * @param {string[]} [props.presets]          - Override default preset palette
 * @param {boolean}  [props.allowCustom=true] - Show free-form hex input
 * @param {string}   [props.label='Color']
 *
 * @example <caption>Inside NewProjectForm</caption>
 * <ColorPickerSwatch
 *   value={form.color}
 *   onChange={(hex) => setForm(f => ({ ...f, color: hex }))}
 * />
 */

const DEFAULT_PRESETS = [
  '#4668f0', '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
  '#0284c7', '#374151', '#1e2240', '#64748b',
];

export function ColorPickerSwatch({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  allowCustom = true,
  label = 'Color',
}) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div>
      <label className="form-label">{label}</label>

      {/* Preset swatches */}
      <div className="d-flex flex-wrap gap-1 mb-2">
        {presets.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            aria-label={hex}
            aria-pressed={value === hex}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: hex,
              border: value === hex
                ? `2px solid var(--color-gray-800)`
                : '2px solid transparent',
              outline: value === hex ? '2px solid white' : 'none',
              outlineOffset: '-3px',
              cursor: 'pointer',
              padding: 0,
              transition: 'transform var(--transition-fast)',
            }}
          />
        ))}

        {/* Custom color toggle */}
        {allowCustom && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-2 py-0"
            style={{ height: '24px', fontSize: '0.7rem' }}
            onClick={() => setShowCustom(s => !s)}
          >
            Custom
          </button>
        )}
      </div>

      {/* Free-form hex input */}
      {allowCustom && showCustom && (
        <div className="d-flex align-items-center gap-2">
          <input
            type="color"
            className="form-control form-control-color"
            value={value ?? '#4668f0'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '40px', height: '32px', padding: '2px' }}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
            }}
            placeholder="#4668f0"
            style={{ fontFamily: 'var(--font-mono)', maxWidth: '100px' }}
          />
          {/* Live preview swatch */}
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: value ?? 'transparent',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
      )}
    </div>
  );
}
