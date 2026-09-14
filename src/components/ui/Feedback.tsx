import { type ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const icons = {
  success: <CheckCircle2 size={20} className="text-green-600" />,
  error: <XCircle size={20} className="text-red-600" />,
  info: <Info size={20} className="text-blue-600" />,
  warning: <AlertTriangle size={20} className="text-amber-600" />,
};

const bg = {
  success: 'border-green-200',
  error: 'border-red-200',
  info: 'border-blue-200',
  warning: 'border-amber-200',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 bg-white border ${bg[t.type]} rounded-lg shadow-lg px-4 py-3 animate-slide-in-right`}
        >
          {icons[t.type]}
          <span className="text-sm text-slate-700 flex-1">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="overlay flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-scale-in">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-5">{message}</p>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-200 rounded-full animate-spin mb-3" style={{ borderTopColor: '#0d9488' }} />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: 'badge-success', label: 'Active' },
    inactive: { cls: 'badge-neutral', label: 'Inactive' },
    paused: { cls: 'badge-warning', label: 'Paused' },
    draft: { cls: 'badge-neutral', label: 'Draft' },
    archived: { cls: 'badge-neutral', label: 'Archived' },
    expired: { cls: 'badge-error', label: 'Expired' },
    new: { cls: 'badge-info', label: 'New' },
    qualified: { cls: 'badge-success', label: 'Qualified' },
    contacted: { cls: 'badge-warning', label: 'Contacted' },
    converted: { cls: 'badge-success', label: 'Converted' },
    disqualified: { cls: 'badge-error', label: 'Disqualified' },
    invited: { cls: 'badge-info', label: 'Invited' },
  };
  const info = map[status] || { cls: 'badge-neutral', label: status };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
}
