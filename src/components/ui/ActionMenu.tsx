import { type ReactNode } from 'react';
import { MoreVertical, Eye, Pencil, Copy, Archive, Trash2, Power, Download, ExternalLink, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export function ActionMenu({ items }: { items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[180px] z-30 animate-scale-in">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition ${
                item.danger ? 'text-red-600' : 'text-slate-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn-secondary text-xs">
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      {label || (copied ? 'Copied!' : 'Copy')}
    </button>
  );
}

export const actionIcons = {
  view: <Eye size={14} />,
  edit: <Pencil size={14} />,
  duplicate: <Copy size={14} />,
  archive: <Archive size={14} />,
  delete: <Trash2 size={14} />,
  activate: <Power size={14} />,
  deactivate: <Power size={14} />,
  download: <Download size={14} />,
  external: <ExternalLink size={14} />,
};
