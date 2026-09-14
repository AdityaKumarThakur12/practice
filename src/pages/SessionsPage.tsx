import { useState } from 'react';
import { MonitorPlay, Clock, Eye, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDuration, formatDate, timeAgo } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Feedback';
import type { Session } from '@/types';

export function SessionsPage() {
  const { data } = useApp();
  const [detailTarget, setDetailTarget] = useState<Session | null>(null);

  const columns: Column<Session>[] = [
    { key: 'sessionId', label: 'Session ID', sortable: true, render: s => <span className="font-mono text-xs text-slate-600">{s.sessionId}</span>, sortValue: s => s.sessionId },
    { key: 'visitor', label: 'Visitor', render: s => { const v = data.visitors.find(v => v.id === s.visitorId); return v ? <span className="font-mono text-xs text-slate-500">{v.visitorId}</span> : '—'; } },
    { key: 'start', label: 'Start', sortable: true, render: s => formatDate(s.start), sortValue: s => s.start },
    { key: 'duration', label: 'Duration', sortable: true, render: s => formatDuration(s.duration), sortValue: s => s.duration },
    { key: 'landingPage', label: 'Landing Page', render: s => <span className="text-xs text-slate-600">{s.landingPage}</span> },
    { key: 'exitPage', label: 'Exit Page', render: s => <span className="text-xs text-slate-600">{s.exitPage}</span> },
    { key: 'pages', label: 'Pages', sortable: true, render: s => s.pages, sortValue: s => s.pages },
    { key: 'source', label: 'Source', sortable: true, render: s => <span className="capitalize">{s.source.replace(/_/g, ' ')}</span>, sortValue: s => s.source },
    { key: 'campaign', label: 'Campaign', render: s => data.campaigns.find(c => c.id === s.campaignId)?.name || '—' },
    { key: 'device', label: 'Device', sortable: true, render: s => <span className="capitalize">{s.device}</span>, sortValue: s => s.device },
    { key: 'country', label: 'Country', sortable: true, render: s => s.country, sortValue: s => s.country },
    { key: 'events', label: 'Events', sortable: true, render: s => s.events, sortValue: s => s.events },
    { key: 'hasConversion', label: 'Conv.', sortable: true, render: s => s.hasConversion ? <Badge status="converted" /> : <span className="text-slate-300">—</span>, sortValue: s => s.hasConversion ? 1 : 0 },
  ];

  return (
    <div>
      <PageHeader title="Sessions" subtitle="Analyze session-level visitor behavior" />
      <div className="card overflow-hidden">
        <DataTable columns={columns} rows={data.sessions} rowKey={s => s.id} onRowClick={s => setDetailTarget(s)} searchKeys={['sessionId', 'landingPage', 'exitPage', 'country']} searchPlaceholder="Search sessions..." filters={[{ label: 'Device', key: 'device', options: [{ label: 'Desktop', value: 'desktop' }, { label: 'Mobile', value: 'mobile' }, { label: 'Tablet', value: 'tablet' }] }, { label: 'Source', key: 'source', options: [...new Set(data.sessions.map(s => s.source))].map(s => ({ label: s.replace(/_/g, ' '), value: s })) }]} />
      </div>
      {detailTarget && <SessionDetail session={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}

function SessionDetail({ session, onClose }: { session: Session; onClose: () => void }) {
  const { data } = useApp();
  const current = data.sessions.find(s => s.id === session.id) || session;
  const visitor = data.visitors.find(v => v.id === current.visitorId);
  const events = data.events.filter(e => e.sessionId === current.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const campaign = data.campaigns.find(c => c.id === current.campaignId);

  return (
    <Drawer open onClose={onClose} title={`Session ${current.sessionId}`} width="max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge status={current.hasConversion ? 'converted' : 'active'} />
          <span className="text-sm text-slate-500 capitalize">{current.device} • {current.country}</span>
          <span className="text-sm text-slate-500 capitalize">{current.source.replace(/_/g, ' ')}</span>
          {campaign && <span className="text-sm text-slate-500">{campaign.name}</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Duration" value={formatDuration(current.duration)} icon={<Clock size={16} />} />
          <KPICard label="Pages" value={current.pages} icon={<Eye size={16} />} color="#0369a1" />
          <KPICard label="Events" value={current.events} icon={<Zap size={16} />} color="#d97706" />
          <KPICard label="Converted" value={current.hasConversion ? 'Yes' : 'No'} icon={<MonitorPlay size={16} />} color={current.hasConversion ? '#16a34a' : '#94a3b8'} />
        </div>

        <SectionCard title="Session Info">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Start:</span> <span className="font-medium text-slate-700">{formatDate(current.start)}</span></div>
            <div><span className="text-slate-400">End:</span> <span className="font-medium text-slate-700">{formatDate(current.end)}</span></div>
            <div><span className="text-slate-400">Landing:</span> <span className="font-medium text-slate-700">{current.landingPage}</span></div>
            <div><span className="text-slate-400">Exit:</span> <span className="font-medium text-slate-700">{current.exitPage}</span></div>
            {visitor && <div><span className="text-slate-400">Visitor:</span> <span className="font-mono text-xs text-slate-700">{visitor.visitorId}</span></div>}
            <div><span className="text-slate-400">City:</span> <span className="font-medium text-slate-700">{visitor?.city || '—'}</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Event Timeline">
          {events.length === 0 ? <p className="text-sm text-slate-400">No events in this session</p> : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {events.map((e, i) => {
                  const isLast = i === events.length - 1;
                  return (
                    <div key={e.id} className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${isLast ? 'bg-teal-100' : 'bg-slate-100'}`} style={isLast ? { background: '#ccfbf1' } : {}}>
                        <div className={`w-3 h-3 rounded-full ${isLast ? 'bg-teal-600' : 'bg-slate-400'}`} style={isLast ? { background: '#0d9488' } : {}} />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 capitalize">{e.type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-400">{timeAgo(e.timestamp)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.page}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </Drawer>
  );
}
