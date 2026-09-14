import { useState, useMemo } from 'react';
import { BarChart3, ArrowRight, Users, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/utils/format';
import { PageHeader, SectionCard } from '@/components/ui/KPI';
import { BarChartCard } from '@/components/charts/Charts';

export function AttributionPage() {
  const { data } = useApp();
  const [mode, setMode] = useState<'first' | 'last'>('first');

  const attributionData = useMemo(() => {
    const visitorSources: Record<string, { visitors: number; conversions: number }> = {};

    data.visitors.forEach(v => {
      const key = mode === 'first' ? v.source : v.source;
      if (!visitorSources[key]) visitorSources[key] = { visitors: 0, conversions: 0 };
      visitorSources[key].visitors++;
      if (v.hasConverted) visitorSources[key].conversions++;
    });

    return Object.entries(visitorSources)
      .map(([source, v]) => ({
        source: source.replace(/_/g, ' '),
        ...v,
        conversionRate: v.visitors > 0 ? (v.conversions / v.visitors) * 100 : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  }, [data, mode]);

  const campaignAttribution = useMemo(() => {
    return data.campaigns.map(c => {
      const visitors = data.visitors.filter(v => v.campaignId === c.id).length;
      const conversions = data.conversions.filter(conv => conv.campaignId === c.id).length;
      return { name: c.name, visitors, conversions, conversionRate: visitors > 0 ? (conversions / visitors) * 100 : 0 };
    }).filter(c => c.visitors > 0).sort((a, b) => b.conversions - a.conversions).slice(0, 8);
  }, [data]);

  const journeySteps = ['Facebook', 'Website Visit', 'Email Capture', 'Webinar Registration', 'QR Code Scan', 'Demo Request', 'Conversion'];

  return (
    <div>
      <PageHeader title="Attribution" subtitle="Understand how your channels contribute to conversions" action={
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button onClick={() => setMode('first')} className={`px-4 py-1.5 text-sm rounded-md transition ${mode === 'first' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500'}`}>First Touch</button>
          <button onClick={() => setMode('last')} className={`px-4 py-1.5 text-sm rounded-md transition ${mode === 'last' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500'}`}>Last Touch</button>
        </div>
      } />

      <SectionCard title={`Attribution by Source (${mode === 'first' ? 'First Touch' : 'Last Touch'})`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Visitors</th>
                <th>Conversions</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {attributionData.map(a => (
                <tr key={a.source}>
                  <td className="font-medium capitalize text-slate-700">{a.source}</td>
                  <td>{formatNumber(a.visitors)}</td>
                  <td>{formatNumber(a.conversions)}</td>
                  <td><span className="font-medium text-teal-700" style={{ color: '#0d9488' }}>{a.conversionRate.toFixed(1)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <SectionCard title="Attribution by Campaign">
          <BarChartCard data={campaignAttribution} dataKey="conversions" xKey="name" height={200} />
        </SectionCard>
        <SectionCard title="Campaign Attribution Table">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Campaign</th><th>Visitors</th><th>Conversions</th><th>Conv. Rate</th></tr>
              </thead>
              <tbody>
                {campaignAttribution.map(c => (
                  <tr key={c.name}>
                    <td className="font-medium text-slate-700">{c.name}</td>
                    <td>{formatNumber(c.visitors)}</td>
                    <td>{formatNumber(c.conversions)}</td>
                    <td><span style={{ color: '#0d9488' }} className="font-medium">{c.conversionRate.toFixed(1)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Example Attribution Journey" className="mt-4">
        <div className="flex flex-wrap items-center gap-2 py-4">
          {journeySteps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
                {step}
              </div>
              {i < journeySteps.length - 1 && <ArrowRight size={16} className="text-slate-300" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">This shows a typical multi-touch attribution journey from initial contact to final conversion.</p>
      </SectionCard>
    </div>
  );
}
