import { useState } from 'react';
import { Plus, Globe, Eye, Pencil, Trash2, Copy, Code } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate, timeAgo } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons, CopyButton } from '@/components/ui/ActionMenu';
import { Field } from '@/components/ui/Tabs';
import { AreaTrendChart, BarChartCard } from '@/components/charts/Charts';
import type { Website, WebsiteStatus } from '@/types';

export function WebsitesPage() {
  const { data, createWebsite, updateWebsite, deleteWebsite } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Website | null>(null);
  const [detailTarget, setDetailTarget] = useState<Website | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);

  const columns: Column<Website>[] = [
    { key: 'name', label: 'Website', sortable: true, render: w => <div><div className="font-medium text-slate-900">{w.name}</div><div className="text-xs text-slate-400">{w.domain}</div></div>, sortValue: w => w.name },
    { key: 'trackingId', label: 'Tracking ID', render: w => <span className="font-mono text-xs text-teal-600" style={{ color: '#0d9488' }}>{w.trackingId}</span> },
    { key: 'status', label: 'Status', sortable: true, render: w => <Badge status={w.status} />, sortValue: w => w.status },
    { key: 'events', label: 'Events', sortable: true, render: w => formatNumber(w.events), sortValue: w => w.events },
    { key: 'visitors', label: 'Visitors', sortable: true, render: w => formatNumber(w.visitors), sortValue: w => w.visitors },
    { key: 'sessions', label: 'Sessions', sortable: true, render: w => formatNumber(w.sessions), sortValue: w => w.sessions },
    { key: 'lastActivity', label: 'Last Activity', sortable: true, render: w => timeAgo(w.lastActivity), sortValue: w => w.lastActivity },
  ];

  const actions = (w: Website) => (
    <ActionMenu items={[
      { label: 'View Details', icon: actionIcons.view, onClick: () => setDetailTarget(w) },
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(w) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(w), danger: true },
    ]} />
  );

  return (
    <div>
      <PageHeader title="Websites" subtitle="Track websites with the Link IQ tracking script" action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Add Website</button>} />
      <div className="card overflow-hidden">
        {data.websites.length === 0 ? (
          <EmptyState icon={<Globe size={28} />} title="No websites" message="Add a website to start tracking visitor behavior." action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Add Website</button>} />
        ) : (
          <DataTable columns={columns} rows={data.websites} rowKey={w => w.id} onRowClick={w => setDetailTarget(w)} actions={actions} searchKeys={['name', 'domain', 'trackingId']} searchPlaceholder="Search websites..." filters={[{ label: 'Status', key: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }]} />
        )}
      </div>
      {showCreate && <WebsiteForm onClose={() => setShowCreate(false)} onSave={(w) => { createWebsite(w); setShowCreate(false); }} />}
      {editTarget && <WebsiteForm website={editTarget} onClose={() => setEditTarget(null)} onSave={(w) => { updateWebsite(editTarget.id, w); setEditTarget(null); }} />}
      {detailTarget && <WebsiteDetail website={detailTarget} onClose={() => setDetailTarget(null)} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Website" message={`Delete "${deleteTarget?.name}"? This will stop tracking.`} onConfirm={() => { if (deleteTarget) deleteWebsite(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

function WebsiteForm({ website, onClose, onSave }: { website?: Website; onClose: () => void; onSave: (w: Omit<Website, 'id' | 'createdAt' | 'events' | 'visitors' | 'sessions' | 'lastActivity' | 'trackingId'>) => void }) {
  const [name, setName] = useState(website?.name || '');
  const [domain, setDomain] = useState(website?.domain || '');
  const [status, setStatus] = useState<WebsiteStatus>(website?.status || 'active');

  const handleSave = () => { if (!name.trim() || !domain.trim()) return; onSave({ name, domain, status }); };

  return (
    <Modal open onClose={onClose} title={website ? 'Edit Website' : 'Add Website'} footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{website ? 'Save' : 'Add'}</button></>}>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Website Name" required><input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Practice Profit Labs" /></Field>
        <Field label="Domain" required><input className="input-base" value={domain} onChange={e => setDomain(e.target.value)} placeholder="practiceprofitlabs.com" /></Field>
        <Field label="Status"><select className="input-base" value={status} onChange={e => setStatus(e.target.value as WebsiteStatus)}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
      </div>
    </Modal>
  );
}

function WebsiteDetail({ website, onClose }: { website: Website; onClose: () => void }) {
  const { data } = useApp();
  const current = data.websites.find(w => w.id === website.id) || website;

  const trackingScript = `<!-- Link IQ Tracking Script -->
<script src="https://cdn.linkiq.app/tracker.js"></script>
<script>
  linkiq.init({
    trackingId: "${current.trackingId}",
    domain: "${current.domain}"
  });
  linkiq.trackPageView();
  linkiq.trackEvents(['cta_click', 'form_submit', 'scroll_depth', 'phone_click']);
</script>`;

  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), visitors: Math.floor(current.visitors / 14) + Math.floor(Math.random() * 8) };
  });

  const pageData = [
    { page: '/home', views: Math.floor(current.events * 0.3) },
    { page: '/services', views: Math.floor(current.events * 0.2) },
    { page: '/contact', views: Math.floor(current.events * 0.15) },
    { page: '/about', views: Math.floor(current.events * 0.1) },
    { page: '/pricing', views: Math.floor(current.events * 0.08) },
  ];

  return (
    <Drawer open onClose={onClose} title={current.name} width="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge status={current.status} />
          <span className="text-sm text-slate-500">{current.domain}</span>
          <span className="text-xs text-slate-400">Last activity: {timeAgo(current.lastActivity)}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Events" value={formatNumber(current.events)} icon={<Code size={16} />} />
          <KPICard label="Visitors" value={formatNumber(current.visitors)} icon={<Globe size={16} />} color="#0369a1" />
          <KPICard label="Sessions" value={formatNumber(current.sessions)} icon={<Globe size={16} />} color="#d97706" />
          <KPICard label="Tracking ID" value={current.trackingId} icon={<Code size={16} />} color="#0d9488" />
        </div>

        <SectionCard title="Tracking Script" action={<CopyButton text={trackingScript} />}>
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{trackingScript}</pre>
          </div>
          <div className="mt-3 text-sm text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Installation Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Copy the tracking script above</li>
              <li>Paste it into the <code className="text-teal-600" style={{ color: '#0d9488' }}>{'<head>'}</code> section of your website</li>
              <li>The script will automatically track page views and configured events</li>
              <li>Verify installation in the Link IQ dashboard</li>
            </ol>
          </div>
        </SectionCard>

        <SectionCard title="Traffic (Last 14 Days)"><AreaTrendChart data={trendData} dataKey="visitors" /></SectionCard>

        <SectionCard title="Top Pages"><BarChartCard data={pageData} dataKey="views" xKey="page" height={180} /></SectionCard>
      </div>
    </Drawer>
  );
}
