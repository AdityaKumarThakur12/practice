import { useState } from 'react';
import { Zap, MousePointerClick, QrCode, Eye, FileText, Target, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { formatNumber, formatDateTime } from '@/utils/format';

export function DemoModePage() {
  const { data, simulateLinkClick, simulateQRScan, simulatePageView, simulateCTAClick, simulateFormSubmit, simulateConversion } = useApp();

  const simulations = [
    { label: 'Simulate Link Click', desc: 'Creates a new visitor, session, and click event', icon: <MousePointerClick size={20} />, action: simulateLinkClick, color: '#0d9488' },
    { label: 'Simulate QR Scan', desc: 'Creates a new visitor from a QR code scan', icon: <QrCode size={20} />, action: simulateQRScan, color: '#d97706' },
    { label: 'Simulate Page View', desc: 'Records a page view event with a new visitor', icon: <Eye size={20} />, action: simulatePageView, color: '#0369a1' },
    { label: 'Simulate CTA Click', desc: 'Records a CTA click event', icon: <MousePointerClick size={20} />, action: simulateCTAClick, color: '#7c3aed' },
    { label: 'Simulate Form Submit', desc: 'Creates a new lead from a form submission', icon: <FileText size={20} />, action: simulateFormSubmit, color: '#16a34a' },
    { label: 'Simulate Conversion', desc: 'Records a conversion event', icon: <Target size={20} />, action: simulateConversion, color: '#dc2626' },
  ];

  const recentActivity = data.events.slice(-10).reverse();

  return (
    <div>
      <PageHeader title="Demo Mode" subtitle="Simulate live activity to see the analytics system in action" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KPICard label="Visitors" value={formatNumber(data.visitors.length)} icon={<Activity size={16} />} />
        <KPICard label="Sessions" value={formatNumber(data.sessions.length)} icon={<Activity size={16} />} color="#0369a1" />
        <KPICard label="Events" value={formatNumber(data.events.length)} icon={<Zap size={16} />} color="#d97706" />
        <KPICard label="Conversions" value={formatNumber(data.conversions.length)} icon={<Target size={16} />} color="#0d9488" />
        <KPICard label="Leads" value={formatNumber(data.leads.length)} icon={<FileText size={16} />} color="#7c3aed" />
        <KPICard label="Links" value={formatNumber(data.links.length)} icon={<MousePointerClick size={16} />} color="#16a34a" />
      </div>

      <SectionCard title="Simulation Controls" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulations.map(sim => (
            <button
              key={sim.label}
              onClick={sim.action}
              className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-teal-400 hover:shadow-md transition text-left group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition" style={{ background: `${sim.color}15`, color: sim.color }}>
                {sim.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 mb-0.5">{sim.label}</div>
                <div className="text-xs text-slate-500">{sim.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Live Activity Feed">
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No activity yet. Use the buttons above to simulate events.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map(e => {
              const visitor = data.visitors.find(v => v.id === e.visitorId);
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 animate-slide-up">
                  <div className="w-2 h-2 rounded-full bg-teal-500" style={{ background: '#0d9488' }} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 capitalize">{e.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-400 ml-2">{e.page}</span>
                  </div>
                  {visitor && <span className="text-xs font-mono text-slate-400">{visitor.visitorId}</span>}
                  <span className="text-xs text-slate-400">{formatDateTime(e.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
