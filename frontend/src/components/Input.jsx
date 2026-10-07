import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  leftIcon: LeftIconProp,
  rightIcon: RightIconProp,
  onRightIconClick,
  error = '',
  disabled = false,
  className = '',
  ...rest
}) {
  const [internalShow, setInternalShow] = useState(false);
  const inputId = useId();
  const isPassword = type === 'password';

  // showPassword bisa dikontrol parent lewat prop, atau dipakai state internal.
  const isControlled = 'showPassword' in rest;
  const showPassword = isControlled ? !!rest.showPassword : internalShow;
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // leftIcon/rightIcon bisa berupa component (Mail) ATAU element/JSX (<Calendar />)
  const renderIcon = (icon) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon;
    return <Icon className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />;
  };

  // onRightIconClick & showPassword HARUS ikut destructuring di atas.
  // Kalau tidak, keduanya ikut ter-spread ke elemen <input> dan React
  // Raiders memperingatkan "Unknown event handler property" lalu mengabaikannya.
  const { showPassword: _ignored, ...inputProps } = rest;

  const toggleVisibility = () => {
    if (onRightIconClick) {
      onRightIconClick();
      return;
    }
    setInternalShow((prev) => !prev);
  };

  // Tombol mata muncul jika parent memberi onRightIconClick, atau jika ini
  // field password tanpa ikon kanan dari parent (pakai ikon bawaan).
  const showVisibilityToggle = Boolean(onRightIconClick) || (isPassword && !RightIconProp);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="flex items-center bg-slate-200 rounded-2xl px-4 py-3 gap-3 w-full border border-transparent focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        {renderIcon(LeftIconProp)}
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-label={label || undefined}
          aria-invalid={error ? 'true' : undefined}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none disabled:opacity-60"
          {...inputProps}
        />
        {showVisibilityToggle ? (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={disabled}
            className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0 disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {RightIconProp
              ? renderIcon(RightIconProp)
              : showPassword
                ? <EyeOff className="w-5 h-5" />
                : <Eye className="w-5 h-5" />}
          </button>
        ) : (
          renderIcon(RightIconProp)
        )}
      </div>
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
}