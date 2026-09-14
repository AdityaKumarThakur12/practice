import { useState } from 'react';
import { Zap, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDateTime } from '@/utils/format';
import { PageHeader } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Feedback';
import { Field, Select } from '@/components/ui/Tabs';
import type { EventRecord, EventType } from '@/types';

const EVENT_TYPES: EventType[] = [
  'page_view', 'session_start', 'session_end', 'cta_click', 'button_click',
  'outbound_link_click', 'form_start', 'form_submit', 'file_download',
  'phone_click', 'email_click', 'whatsapp_click', 'video_play', 'video_progress',
  'video_completion', 'scroll_depth', 'custom_event', 'conversion',
];

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map(t => ({ label: t.replace(/_/g, ' '), value: t }));

export function EventsPage() {
  const { data } = useApp();
  const [showCreate, setShowCreate] = useState(false);

  const columns: Column<EventRecord>[] = [
    { key: 'timestamp', label: 'Timestamp', sortable: true, render: e => formatDateTime(e.timestamp), sortValue: e => e.timestamp },
    { key: 'type', label: 'Event Type', sortable: true, render: e => <span className="font-medium capitalize text-slate-700">{e.type.replace(/_/g, ' ')}</span>, sortValue: e => e.type },
    { key: 'visitor', label: 'Visitor', render: e => { const v = data.visitors.find(v => v.id === e.visitorId); return v ? <span className="font-mono text-xs text-slate-500">{v.visitorId}</span> : '—'; } },
    { key: 'page', label: 'Page', render: e => <span className="text-xs text-slate-600">{e.page}</span> },
    { key: 'source', label: 'Source', sortable: true, render: e => <span className="capitalize">{e.source.replace(/_/g, ' ')}</span>, sortValue: e => e.source },
    { key: 'campaign', label: 'Campaign', render: e => data.campaigns.find(c => c.id === e.campaignId)?.name || '—' },
    { key: 'device', label: 'Device', sortable: true, render: e => <span className="capitalize">{e.device}</span>, sortValue: e => e.device },
    { key: 'country', label: 'Country', sortable: true, render: e => e.country, sortValue: e => e.country },
  ];

  return (
    <div>
      <PageHeader title="Events" subtitle="Track and analyze all tracked events" action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Custom Event</button>} />
      <div className="card overflow-hidden">
        {data.events.length === 0 ? (
          <EmptyState icon={<Zap size={28} />} title="No events" message="Events will appear here as visitors interact with your tracked assets." />
        ) : (
          <DataTable columns={columns} rows={data.events.slice().reverse()} rowKey={e => e.id} searchKeys={['type', 'page', 'country']} searchPlaceholder="Search events..." filters={[{ label: 'Event Type', key: 'type', options: EVENT_TYPE_OPTIONS }, { label: 'Source', key: 'source', options: [...new Set(data.events.map(e => e.source))].map(s => ({ label: s.replace(/_/g, ' '), value: s })) }, { label: 'Device', key: 'device', options: [{ label: 'Desktop', value: 'desktop' }, { label: 'Mobile', value: 'mobile' }, { label: 'Tablet', value: 'tablet' }] }]} pageSize={15} />
        )}
      </div>
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const { data, showToast } = useApp();
  const [type, setType] = useState<EventType>('custom_event');
  const [page, setPage] = useState('/home');
  const [campaignId, setCampaignId] = useState('');

  const handleSave = () => {
    showToast('Custom event created (simulated)', 'success');
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Create Custom Event" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>Create Event</button></>}>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Event Type"><Select value={type} onChange={v => setType(v as EventType)} options={EVENT_TYPE_OPTIONS} /></Field>
        <Field label="Page / Location"><input className="input-base" value={page} onChange={e => setPage(e.target.value)} placeholder="/home" /></Field>
        <Field label="Campaign"><Select value={campaignId} onChange={setCampaignId} options={data.campaigns.map(c => ({ label: c.name, value: c.id }))} placeholder="No campaign" /></Field>
      </div>
    </Modal>
  );
}
