import { useState } from 'react';
import { Plus, Target, Pencil, Trash2, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate } from '@/utils/format';
import { computeAnalytics } from '@/utils/analytics';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons } from '@/components/ui/ActionMenu';
import { Field, Select } from '@/components/ui/Tabs';
import { BarChartCard } from '@/components/charts/Charts';
import type { ConversionDefinition, EventType, ConversionStatus } from '@/types';

const EVENT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Form Submit', value: 'form_submit' },
  { label: 'Button Click', value: 'button_click' },
  { label: 'Phone Click', value: 'phone_click' },
  { label: 'Email Click', value: 'email_click' },
  { label: 'WhatsApp Click', value: 'whatsapp_click' },
  { label: 'File Download', value: 'file_download' },
  { label: 'Custom Event', value: 'custom_event' },
  { label: 'Conversion', value: 'conversion' },
];

export function ConversionsPage({ dateRange }: { dateRange: string }) {
  const { data, createConversionDefinition, updateConversionDefinition, deleteConversionDefinition, createConversion } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ConversionDefinition | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversionDefinition | null>(null);
  const [showCreateConv, setShowCreateConv] = useState(false);

  const analytics = computeAnalytics(data, dateRange);

  const convByCampaign = data.campaigns.map(c => ({
    name: c.name,
    conversions: data.conversions.filter(conv => conv.campaignId === c.id).length,
  })).filter(c => c.conversions > 0).sort((a, b) => b.conversions - a.conversions).slice(0, 5);

  const convBySource: Record<string, number> = {};
  data.conversions.forEach(c => {
    const session = data.sessions.find(s => s.id === c.sessionId);
    if (session) convBySource[session.source] = (convBySource[session.source] || 0) + 1;
  });
  const convBySourceData = Object.entries(convBySource).map(([source, count]) => ({ name: source.replace(/_/g, ' '), conversions: count }));

  const columns: Column<ConversionDefinition>[] = [
    { key: 'name', label: 'Name', sortable: true, render: d => <span className="font-medium text-slate-900">{d.name}</span>, sortValue: d => d.name },
    { key: 'eventType', label: 'Event Type', sortable: true, render: d => <span className="capitalize">{d.eventType.replace(/_/g, ' ')}</span>, sortValue: d => d.eventType },
    { key: 'description', label: 'Description', render: d => <span className="text-xs text-slate-500">{d.description}</span> },
    { key: 'value', label: 'Value', sortable: true, render: d => <span className="font-medium">${d.value}</span>, sortValue: d => d.value },
    { key: 'status', label: 'Status', sortable: true, render: d => <Badge status={d.status} />, sortValue: d => d.status },
    { key: 'createdAt', label: 'Created', sortable: true, render: d => formatDate(d.createdAt), sortValue: d => d.createdAt },
  ];

  const actions = (d: ConversionDefinition) => (
    <ActionMenu items={[
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(d) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(d), danger: true },
    ]} />
  );

  return (
    <div>
      <PageHeader title="Conversions" subtitle="Define and track conversion events" action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowCreateConv(true)}><Plus size={16} /> Record Conversion</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> New Definition</button>
        </div>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Conversions" value={formatNumber(data.conversions.length)} icon={<Target size={16} />} />
        <KPICard label="Unique Conversions" value={formatNumber(new Set(data.conversions.map(c => c.visitorId)).size)} icon={<Target size={16} />} color="#0369a1" />
        <KPICard label="Conversion Rate" value={`${analytics.conversionRate.toFixed(2)}%`} icon={<Target size={16} />} color="#d97706" />
        <KPICard label="Total Value" value={`$${data.conversions.reduce((s, c) => s + c.value, 0).toLocaleString()}`} icon={<DollarSign size={16} />} color="#16a34a" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SectionCard title="Conversions by Campaign"><BarChartCard data={convByCampaign} dataKey="conversions" xKey="name" height={180} /></SectionCard>
        <SectionCard title="Conversions by Source"><BarChartCard data={convBySourceData} dataKey="conversions" xKey="name" height={180} color="#0369a1" /></SectionCard>
      </div>

      <div className="card overflow-hidden mb-6">
        {data.conversionDefinitions.length === 0 ? (
          <EmptyState icon={<Target size={28} />} title="No conversion definitions" message="Create conversion definitions to track key actions." action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> New Definition</button>} />
        ) : (
          <DataTable columns={columns} rows={data.conversionDefinitions} rowKey={d => d.id} actions={actions} searchKeys={['name', 'description']} searchPlaceholder="Search definitions..." filters={[{ label: 'Status', key: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }]} />
        )}
      </div>

      {showCreate && <ConvDefForm onClose={() => setShowCreate(false)} onSave={(d) => { createConversionDefinition(d); setShowCreate(false); }} />}
      {editTarget && <ConvDefForm def={editTarget} onClose={() => setEditTarget(null)} onSave={(d) => { updateConversionDefinition(editTarget.id, d); setEditTarget(null); }} />}
      {showCreateConv && <RecordConversionModal onClose={() => setShowCreateConv(false)} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Definition" message={`Delete "${deleteTarget?.name}"? This won't delete past conversions.`} onConfirm={() => { if (deleteTarget) deleteConversionDefinition(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

function ConvDefForm({ def, onClose, onSave }: { def?: ConversionDefinition; onClose: () => void; onSave: (d: Omit<ConversionDefinition, 'id' | 'createdAt'>) => void }) {
  const [name, setName] = useState(def?.name || '');
  const [eventType, setEventType] = useState<EventType>(def?.eventType || 'form_submit');
  const [description, setDescription] = useState(def?.description || '');
  const [value, setValue] = useState(def?.value || 50);
  const [status, setStatus] = useState<ConversionStatus>(def?.status || 'active');

  const handleSave = () => { if (!name.trim()) return; onSave({ name, eventType, description, value, status }); };

  return (
    <Modal open onClose={onClose} title={def ? 'Edit Definition' : 'New Conversion Definition'} footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{def ? 'Save' : 'Create'}</button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name" required><input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Form Submission" /></Field>
        <Field label="Event Type"><Select value={eventType} onChange={v => setEventType(v as EventType)} options={EVENT_TYPE_OPTIONS} /></Field>
        <Field label="Description" className="md:col-span-2"><textarea className="input-base min-h-[60px]" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this conversion..." /></Field>
        <Field label="Value ($)"><input type="number" className="input-base" value={value} onChange={e => setValue(Number(e.target.value))} /></Field>
        <Field label="Status"><Select value={status} onChange={v => setStatus(v as ConversionStatus)} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} /></Field>
      </div>
    </Modal>
  );
}

function RecordConversionModal({ onClose }: { onClose: () => void }) {
  const { data, createConversion } = useApp();
  const [defId, setDefId] = useState(data.conversionDefinitions[0]?.id || '');
  const [sessionId, setSessionId] = useState(data.sessions[0]?.id || '');

  const handleSave = () => {
    const def = data.conversionDefinitions.find(d => d.id === defId);
    const session = data.sessions.find(s => s.id === sessionId);
    if (!def || !session) return;
    createConversion({
      definitionId: defId, visitorId: session.visitorId, sessionId,
      campaignId: session.campaignId, linkId: null, qrId: null, value: def.value,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Record Conversion" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>Record</button></>}>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Conversion Type"><Select value={defId} onChange={setDefId} options={data.conversionDefinitions.map(d => ({ label: `${d.name} ($${d.value})`, value: d.id }))} /></Field>
        <Field label="Session"><Select value={sessionId} onChange={setSessionId} options={data.sessions.slice(0, 20).map(s => ({ label: s.sessionId, value: s.id }))} /></Field>
      </div>
    </Modal>
  );
}
