import { useMemo, useState } from 'react';
import {
  MousePointerClick, UserCheck, QrCode, Users, MonitorPlay,
  Eye, Clock, Activity, Target, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { computeAnalytics } from '@/utils/analytics';
import { formatNumber, formatDuration, formatDate, timeAgo } from '@/utils/format';
import { KPICard, SectionCard, PageHeader } from '@/components/ui/KPI';
import { AreaTrendChart, BarChartCard, DonutChart, LineTrendChart } from '@/components/charts/Charts';
import { Badge } from '@/components/ui/Feedback';
import type { PageKey } from '@/components/layout/Layout';

interface DashboardProps {
  dateRange: string;
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ dateRange, onNavigate }: DashboardProps) {
  const { data } = useApp();
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<string>('');

  const analytics = useMemo(
    () => computeAnalytics(data, dateRange, campaignFilter || null, deviceFilter || null, null),
    [data, dateRange, campaignFilter, deviceFilter],
  );

  const campaignOptions = data.campaigns.map(c => ({ label: c.name, value: c.id }));
  const deviceOptions = [
    { label: 'Desktop', value: 'desktop' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Tablet', value: 'tablet' },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Real-time analytics across all your campaigns, links, and QR codes"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Campaign</label>
          <select
            value={campaignFilter}
            onChange={e => setCampaignFilter(e.target.value)}
            className="input-base text-sm min-w-[180px]"
          >
            <option value="">All campaigns</option>
            {campaignOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Device</label>
          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value)}
            className="input-base text-sm min-w-[140px]"
          >
            <option value="">All devices</option>
            {deviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(campaignFilter || deviceFilter) && (
          <button
            onClick={() => { setCampaignFilter(''); setDeviceFilter(''); }}
            className="btn-ghost text-xs self-end"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <KPICard label="Total Clicks" value={formatNumber(analytics.totalClicks)} icon={<MousePointerClick size={16} />} change={12} />
        <KPICard label="Unique Clicks" value={formatNumber(analytics.uniqueClicks)} icon={<UserCheck size={16} />} change={8} color="#0369a1" />
        <KPICard label="QR Scans" value={formatNumber(analytics.qrScans)} icon={<QrCode size={16} />} change={15} color="#d97706" />
        <KPICard label="Unique Visitors" value={formatNumber(analytics.uniqueVisitors)} icon={<Users size={16} />} change={6} color="#7c3aed" />
        <KPICard label="Sessions" value={formatNumber(analytics.sessions)} icon={<MonitorPlay size={16} />} change={4} color="#0891b2" />
        <KPICard label="Page Views" value={formatNumber(analytics.pageViews)} icon={<Eye size={16} />} change={10} color="#16a34a" />
        <KPICard label="Engaged Sessions" value={formatNumber(analytics.engagedSessions)} icon={<Activity size={16} />} change={7} color="#be185d" />
        <KPICard label="Avg Session Duration" value={formatDuration(analytics.avgSessionDuration)} icon={<Clock size={16} />} change={3} color="#0369a1" />
        <KPICard label="Avg Time on Page" value={formatDuration(analytics.avgTimeOnPage)} icon={<Clock size={16} />} change={-2} color="#dc2626" />
        <KPICard label="Engagement Rate" value={`${analytics.engagementRate.toFixed(1)}%`} icon={<TrendingUp size={16} />} change={5} color="#16a34a" />
        <KPICard label="Conversions" value={formatNumber(analytics.conversions)} icon={<Target size={16} />} change={18} color="#0d9488" />
        <KPICard label="Conversion Rate" value={`${analytics.conversionRate.toFixed(2)}%`} icon={<Target size={16} />} change={3} color="#0d9488" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Traffic Over Time">
          <AreaTrendChart data={analytics.trafficOverTime} dataKey="visits" />
        </SectionCard>
        <SectionCard title="Clicks Over Time">
          <AreaTrendChart data={analytics.clicksOverTime} dataKey="clicks" color="#0369a1" />
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="QR Scans Over Time">
          <LineTrendChart data={analytics.qrScansOverTime} dataKey="scans" color="#d97706" />
        </SectionCard>
        <SectionCard title="Visitors Over Time">
          <AreaTrendChart data={analytics.visitorsOverTime} dataKey="visitors" color="#7c3aed" />
        </SectionCard>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Conversions Over Time">
          <AreaTrendChart data={analytics.conversionsOverTime} dataKey="conversions" color="#0d9488" />
        </SectionCard>
        <SectionCard title="Traffic Source Distribution">
          <DonutChart data={analytics.trafficSourceDist.map(s => ({ name: s.source, value: s.value }))} />
        </SectionCard>
      </div>

      {/* Charts row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <SectionCard title="Campaign Performance" className="lg:col-span-2">
          <BarChartCard data={analytics.campaignPerformance} dataKey="clicks" xKey="name" height={220} />
        </SectionCard>
        <SectionCard title="Device Distribution">
          <DonutChart data={analytics.deviceDist.map(d => ({ name: d.device, value: d.value }))} />
        </SectionCard>
      </div>

      {/* Geo + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Geographic Distribution">
          <BarChartCard data={analytics.geoDist} dataKey="value" xKey="country" color="#0891b2" height={220} />
        </SectionCard>
        <SectionCard title="Conversion Funnel">
          <div className="space-y-2">
            {analytics.conversionFunnel.map((stage, i) => {
              const max = analytics.conversionFunnel[0].count || 1;
              const pct = max > 0 ? (stage.count / max) * 100 : 0;
              const prevCount = i > 0 ? analytics.conversionFunnel[i - 1].count : stage.count;
              const dropOff = i > 0 && prevCount > 0 ? ((prevCount - stage.count) / prevCount) * 100 : 0;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                    <span className="text-sm text-slate-500">{formatNumber(stage.count)} {i > 0 && dropOff > 0 && <span className="text-red-500 text-xs">(-{dropOff.toFixed(0)}%)</span>}</span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, #0d9488, #14b8a6)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <SectionCard
          title="Top Campaigns"
          action={<button onClick={() => onNavigate('campaigns')} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>View all</button>}
        >
          <div className="space-y-2">
            {analytics.topCampaigns.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">{i + 1}</span>
                  <span className="text-sm text-slate-700">{c.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{formatNumber(c.clicks)} clicks</div>
                  <div className="text-xs text-slate-400">{c.conversions} conversions</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Top Links"
          action={<button onClick={() => onNavigate('links')} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>View all</button>}
        >
          <div className="space-y-2">
            {analytics.topLinks.map((l, i) => (
              <div key={l.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">{i + 1}</span>
                  <span className="text-sm text-slate-700 truncate max-w-[120px]">{l.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{formatNumber(l.clicks)}</div>
                  <div className="text-xs text-slate-400">{l.conversionRate.toFixed(1)}% CR</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Top QR Codes"
          action={<button onClick={() => onNavigate('qrcodes')} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>View all</button>}
        >
          <div className="space-y-2">
            {analytics.topQRCodes.map((q, i) => (
              <div key={q.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">{i + 1}</span>
                  <span className="text-sm text-slate-700 truncate max-w-[120px]">{q.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{formatNumber(q.scans)} scans</div>
                  <div className="text-xs text-slate-400">{q.conversions} conversions</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Recent Conversions" action={<button onClick={() => onNavigate('conversions')} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>View all</button>}>
          {analytics.recentConversions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No conversions in this period</p>
          ) : (
            <div className="space-y-2">
              {analytics.recentConversions.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{c.defName}</div>
                    <div className="text-xs text-slate-400">{c.campaignName} • {timeAgo(c.timestamp)}</div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">${c.value}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Form Submissions" action={<button onClick={() => onNavigate('forms')} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>View all</button>}>
          {analytics.recentLeads.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No form submissions in this period</p>
          ) : (
            <div className="space-y-2">
              {analytics.recentLeads.map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.formName} • {l.practice}</div>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
