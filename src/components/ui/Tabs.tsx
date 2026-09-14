import { type ReactNode } from 'react';

interface TabsProps {
  tabs: { key: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            active === tab.key
              ? 'border-iq-primary text-iq-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
          }`}
          style={active === tab.key ? { borderColor: '#0d9488', color: '#0d9488' } : {}}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function Field({ label, children, required, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-base">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
