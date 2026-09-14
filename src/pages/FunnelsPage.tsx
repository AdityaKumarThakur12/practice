import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Filter, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/utils/format';
import { PageHeader, SectionCard } from '@/components/ui/KPI';
import { EmptyState } from '@/components/ui/Feedback';
import { Field, Select } from '@/components/ui/Tabs';
import type { FunnelStage, EventType } from '@/types';

const EVENT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Page View', value: 'page_view' },
  { label: 'Session Start', value: 'session_start' },
  { label: 'CTA Click', value: 'cta_click' },
  { label: 'Button Click', value: 'button_click' },
  { label: 'Scroll Depth', value: 'scroll_depth' },
  { label: 'Form Start', value: 'form_start' },
  { label: 'Form Submit', value: 'form_submit' },
  { label: 'Conversion', value: 'conversion' },
  { label: 'Custom Event', value: 'custom_event' },
];

export function FunnelsPage({ dateRange }: { dateRange: string }) {
  const { data, updateFunnel, showToast } = useApp();
  const [selectedFunnelId, setSelectedFunnelId] = useState(data.funnels[0]?.id || '');

  const funnel = data.funnels.find(f => f.id === selectedFunnelId) || data.funnels[0];

  if (!funnel) {
    return <div><PageHeader title="Funnels" subtitle="Build and analyze conversion funnels" /><EmptyState icon={<Filter size={28} />} title="No funnels" message="Create a funnel to analyze your conversion stages." /></div>;
  }

  // Compute funnel data from events
  const stageData = funnel.stages.map((stage, i) => {
    const count = data.events.filter(e => e.type === stage.eventType).length;
    const prevCount = i > 0 ? data.events.filter(e => e.type === funnel.stages[i - 1].eventType).length : count;
    const dropOff = i > 0 && prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
    const conversionPct = i > 0 && data.events.filter(e => e.type === funnel.stages[0].eventType).length > 0
      ? (count / data.events.filter(e => e.type === funnel.stages[0].eventType).length) * 100
      : 100;
    return { stage, count, dropOff, conversionPct };
  });

  const maxCount = stageData.length > 0 ? stageData[0].count : 1;

  const addStage = () => {
    const newStage: FunnelStage = { id: `fs_${Date.now()}`, name: 'New Stage', eventType: 'custom_event' };
    updateFunnel(funnel.id, { stages: [...funnel.stages, newStage] });
    showToast('Funnel stage added', 'success');
  };

  const removeStage = (stageId: string) => {
    updateFunnel(funnel.id, { stages: funnel.stages.filter(s => s.id !== stageId) });
    showToast('Funnel stage removed', 'info');
  };

  const moveStage = (index: number, dir: 'up' | 'down') => {
    const newStages = [...funnel.stages];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newStages.length) return;
    [newStages[index], newStages[target]] = [newStages[target], newStages[index]];
    updateFunnel(funnel.id, { stages: newStages });
  };

  const updateStage = (stageId: string, updates: Partial<FunnelStage>) => {
    updateFunnel(funnel.id, { stages: funnel.stages.map(s => s.id === stageId ? { ...s, ...updates } : s) });
  };

  return (
    <div>
      <PageHeader title="Funnels" subtitle="Build and analyze conversion funnels" action={
        <div className="flex gap-2">
          <Select value={selectedFunnelId} onChange={setSelectedFunnelId} options={data.funnels.map(f => ({ label: f.name, value: f.id }))} />
          <button className="btn-primary" onClick={addStage} style={{ background: '#0d9488' }}><Plus size={16} /> Add Stage</button>
        </div>
      } />

      <SectionCard title={funnel.name}>
        {funnel.stages.length === 0 ? (
          <EmptyState icon={<Filter size={24} />} title="No stages" message="Add funnel stages to start analyzing." action={<button className="btn-primary" onClick={addStage} style={{ background: '#0d9488' }}><Plus size={16} /> Add Stage</button>} />
        ) : (
          <div className="space-y-4">
            {stageData.map((sd, i) => (
              <div key={sd.stage.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex flex-col">
                    <button onClick={() => moveStage(i, 'up')} disabled={i === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronUp size={14} /></button>
                    <button onClick={() => moveStage(i, 'down')} disabled={i === stageData.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronDown size={14} /></button>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-700" style={{ background: '#ccfbf1', color: '#0f766e' }}>{i + 1}</span>
                  <input className="input-base flex-1 max-w-[200px]" value={sd.stage.name} onChange={e => updateStage(sd.stage.id, { name: e.target.value })} />
                  <select className="input-base max-w-[160px]" value={sd.stage.eventType} onChange={e => updateStage(sd.stage.id, { eventType: e.target.value as EventType })}>
                    {EVENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => removeStage(sd.stage.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{formatNumber(sd.count)} users</span>
                      <span className="text-sm text-slate-500">
                        {sd.conversionPct.toFixed(1)}% conversion
                        {i > 0 && sd.dropOff > 0 && <span className="text-red-500 ml-2">({sd.dropOff.toFixed(1)}% drop-off)</span>}
                      </span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-md overflow-hidden">
                      <div className="h-full rounded-md transition-all duration-500 flex items-center px-2" style={{ width: `${maxCount > 0 ? (sd.count / maxCount) * 100 : 0}%`, background: 'linear-gradient(90deg, #0d9488, #14b8a6)' }}>
                        <span className="text-xs text-white font-medium">{formatNumber(sd.count)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {i < stageData.length - 1 && (
                  <div className="flex justify-center mt-2 text-slate-300"><ArrowRight size={16} className="rotate-90" /></div>
                )}
              </div>
            ))}
            {funnel.stages.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-slate-400">Total Users:</span> <span className="font-semibold text-slate-900">{formatNumber(stageData[0]?.count || 0)}</span></div>
                  <div><span className="text-slate-400">Final Conversions:</span> <span className="font-semibold text-slate-900">{formatNumber(stageData[stageData.length - 1]?.count || 0)}</span></div>
                  <div><span className="text-slate-400">Overall Conversion:</span> <span className="font-semibold text-teal-700" style={{ color: '#0d9488' }}>{stageData[stageData.length - 1]?.conversionPct.toFixed(1) || 0}%</span></div>
                  <div><span className="text-slate-400">Total Drop-off:</span> <span className="font-semibold text-red-500">{(100 - (stageData[stageData.length - 1]?.conversionPct || 0)).toFixed(1)}%</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
