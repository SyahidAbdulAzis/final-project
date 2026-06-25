import { useRef, useState, useEffect, useLayoutEffect } from 'react';

type Option = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  label?: string;
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'default' | 'pill' | 'compact';
  disabled?: boolean;
  menuPosition?: 'absolute' | 'fixed';
};

export function Dropdown({
  id,
  label,
  value,
  options,
  placeholder = 'Pilih',
  onChange,
  className = '',
  variant = 'default',
  disabled = false,
  menuPosition = 'absolute',
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((item) => item.value === value);
  const displayLabel = selected?.label ?? placeholder;

  const toggle = () => { if (!disabled) setOpen((p) => !p); };
  const choose = (next: string) => { onChange(next); setOpen(false); };

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!open || menuPosition !== 'fixed' || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      minWidth: rect.width,
    });
  }, [open, menuPosition]);

  useEffect(() => {
    if (menuPosition !== 'fixed') return;
    const handleScroll = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuPosition]);

  const chevron = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={open ? 'dropdown-chevron open' : 'dropdown-chevron'}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const menuClass = menuPosition === 'fixed' ? 'dropdown-menu dropdown-menu--fixed glass-card' : 'dropdown-menu glass-card';

  return (
    <div
      ref={containerRef}
      className={`dropdown dropdown--${variant} ${className}`}
      data-open={open}
      data-disabled={disabled}
    >
      {label && <label className="dropdown-label" htmlFor={id}>{label}</label>}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        onClick={toggle}
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? 'dropdown-value' : 'dropdown-placeholder'}>
          {displayLabel}
        </span>
        {chevron}
      </button>
      {open && (
        <ul className={menuClass} role="listbox" aria-label={label} style={menuStyle}>
          {options.map((item) => (
            <li key={item.value}>
              <button
                className={item.value === value ? 'dropdown-option active' : 'dropdown-option'}
                type="button"
                role="option"
                aria-selected={item.value === value}
                onClick={() => choose(item.value)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
