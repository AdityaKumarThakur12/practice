import { useState, useMemo } from 'react';
import { Users, Eye, Clock, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate, timeAgo } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Feedback';
import type { Visitor, EventRecord } from '@/types';

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor size={14} />,
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
};

export function VisitorsPage({ dateRange }: { dateRange: string }) {
  const { data } = useApp();
  const [detailTarget, setDetailTarget] = useState<Visitor | null>(null);

  const columns: Column<Visitor>[] = [
    { key: 'visitorId', label: 'Visitor ID', sortable: true, render: v => <span className="font-mono text-xs text-slate-600">{v.visitorId}</span>, sortValue: v => v.visitorId },
    { key: 'firstSeen', label: 'First Seen', sortable: true, render: v => formatDate(v.firstSeen), sortValue: v => v.firstSeen },
    { key: 'lastSeen', label: 'Last Seen', sortable: true, render: v => timeAgo(v.lastSeen), sortValue: v => v.lastSeen },
    { key: 'sessions', label: 'Sessions', sortable: true, render: v => v.sessions, sortValue: v => v.sessions },
    { key: 'pages', label: 'Pages', sortable: true, render: v => v.pages, sortValue: v => v.pages },
    { key: 'source', label: 'Source', sortable: true, render: v => <span className="capitalize">{v.source.replace(/_/g, ' ')}</span>, sortValue: v => v.source },
    { key: 'campaign', label: 'Campaign', render: v => data.campaigns.find(c => c.id === v.campaignId)?.name || '—' },
    { key: 'device', label: 'Device', sortable: true, render: v => <span className="flex items-center gap-1 capitalize text-slate-600">{DEVICE_ICONS[v.device]} {v.device}</span>, sortValue: v => v.device },
    { key: 'country', label: 'Country', sortable: true, render: v => v.country, sortValue: v => v.country },
    { key: 'hasConverted', label: 'Conversion', sortable: true, render: v => v.hasConverted ? <Badge status="converted" /> : <span className="text-slate-300">—</span>, sortValue: v => v.hasConverted ? 1 : 0 },
    { key: 'status', label: 'Status', sortable: true, render: v => <Badge status={v.status} />, sortValue: v => v.status },
  ];

  return (
    <div>
      <PageHeader title="Visitors" subtitle="Track individual visitor journeys and behavior" />
      <div className="card overflow-hidden">
        <DataTable columns={columns} rows={data.visitors} rowKey={v => v.id} onRowClick={v => setDetailTarget(v)} searchKeys={['visitorId', 'country', 'city', 'source']} searchPlaceholder="Search visitors..." filters={[{ label: 'Device', key: 'device', options: [{ label: 'Desktop', value: 'desktop' }, { label: 'Mobile', value: 'mobile' }, { label: 'Tablet', value: 'tablet' }] }, { label: 'Source', key: 'source', options: [...new Set(data.visitors.map(v => v.source))].map(s => ({ label: s.replace(/_/g, ' '), value: s })) }, { label: 'Status', key: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }]} />
      </div>
      {detailTarget && <VisitorDetail visitor={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}

function VisitorDetail({ visitor, onClose }: { visitor: Visitor; onClose: () => void }) {
  const { data } = useApp();
  const current = data.visitors.find(v => v.id === visitor.id) || visitor;
  const sessions = data.sessions.filter(s => s.visitorId === current.id);
  const allEvents = data.events.filter(e => e.visitorId === current.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const campaign = data.campaigns.find(c => c.id === current.campaignId);

  const timelineEvents = allEvents.length > 0 ? allEvents : [];

  return (
    <Drawer open onClose={onClose} title={`Visitor ${current.visitorId}`} width="max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge status={current.status} />
          <span className="text-sm text-slate-500 capitalize flex items-center gap-1">{DEVICE_ICONS[current.device]} {current.device}</span>
          <span className="text-sm text-slate-500">{current.country}, {current.city}</span>
          {campaign && <span className="text-sm text-slate-500">{campaign.name}</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Sessions" value={current.sessions} icon={<Users size={16} />} />
          <KPICard label="Pages" value={current.pages} icon={<Eye size={16} />} color="#0369a1" />
          <KPICard label="First Seen" value={formatDate(current.firstSeen)} icon={<Clock size={16} />} color="#d97706" />
          <KPICard label="Converted" value={current.hasConverted ? 'Yes' : 'No'} icon={<Globe size={16} />} color={current.hasConverted ? '#16a34a' : '#94a3b8'} />
        </div>

        <SectionCard title="Visitor Journey Timeline">
          {timelineEvents.length === 0 ? <p className="text-sm text-slate-400">No events recorded</p> : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {timelineEvents.map((e, i) => {
                  const isLast = i === timelineEvents.length - 1;
                  return (
                    <div key={e.id} className="relative flex items-start gap-4 pl-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${isLast ? 'bg-teal-100' : 'bg-slate-100'}`} style={isLast ? { background: '#ccfbf1' } : {}}>
                        <div className={`w-3 h-3 rounded-full ${isLast ? 'bg-teal-600' : 'bg-slate-400'}`} style={isLast ? { background: '#0d9488' } : {}} />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 capitalize">{e.type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-400">{timeAgo(e.timestamp)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {e.page} • {e.device} • {e.source.replace(/_/g, ' ')}
                          {Object.keys(e.metadata).length > 0 && ` • ${JSON.stringify(e.metadata)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title={`Sessions (${sessions.length})`}>
          {sessions.length === 0 ? <p className="text-sm text-slate-400">No sessions</p> : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700 capitalize">{s.landingPage}</div>
                    <div className="text-xs text-slate-400">{formatDate(s.start)} • {s.pages} pages • {s.events} events</div>
                  </div>
                  {s.hasConversion && <Badge status="converted" />}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </Drawer>
  );
}
