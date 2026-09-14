import { useState } from 'react';
import { Plus, Link2, Eye, Pencil, Copy, Trash2, Power, Play, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons, CopyButton } from '@/components/ui/ActionMenu';
import { Field, Select } from '@/components/ui/Tabs';
import { AreaTrendChart } from '@/components/charts/Charts';
import type { Link, LinkStatus } from '@/types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Expired', value: 'expired' },
];

export function LinksPage() {
  const { data, createLink, updateLink, deleteLink, duplicateLink, testLink } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Link | null>(null);
  const [detailTarget, setDetailTarget] = useState<Link | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Link | null>(null);

  const columns: Column<Link>[] = [
    {
      key: 'name', label: 'Name', sortable: true,
      render: l => (
        <div>
          <div className="font-medium text-slate-900">{l.name}</div>
          <div className="text-xs text-teal-600" style={{ color: '#0d9488' }}>{l.shortUrl}</div>
        </div>
      ),
      sortValue: l => l.name,
    },
    {
      key: 'destination', label: 'Destination URL', render: l => (
        <span className="text-xs text-slate-500 truncate max-w-[200px] inline-block">{l.destinationUrl}</span>
      ),
    },
    {
      key: 'campaign', label: 'Campaign', sortable: true,
      render: l => data.campaigns.find(c => c.id === l.campaignId)?.name || '—',
      sortValue: l => data.campaigns.find(c => c.id === l.campaignId)?.name || '',
    },
    { key: 'source', label: 'Source', sortable: true, render: l => <span className="capitalize">{l.utmSource}</span>, sortValue: l => l.utmSource },
    { key: 'medium', label: 'Medium', sortable: true, render: l => <span className="capitalize">{l.utmMedium}</span>, sortValue: l => l.utmMedium },
    { key: 'clicks', label: 'Clicks', sortable: true, render: l => formatNumber(l.clicks), sortValue: l => l.clicks },
    { key: 'uniqueVisitors', label: 'Unique', sortable: true, render: l => formatNumber(l.uniqueVisitors), sortValue: l => l.uniqueVisitors },
    { key: 'conversions', label: 'Conv.', sortable: true, render: l => formatNumber(l.conversions), sortValue: l => l.conversions },
    { key: 'status', label: 'Status', sortable: true, render: l => <Badge status={l.status} />, sortValue: l => l.status },
    { key: 'expiration', label: 'Expires', render: l => l.expirationDate ? formatDate(l.expirationDate) : 'Never' },
    { key: 'createdAt', label: 'Created', sortable: true, render: l => formatDate(l.createdAt), sortValue: l => l.createdAt },
  ];

  const actions = (l: Link) => (
    <ActionMenu items={[
      { label: 'View Analytics', icon: actionIcons.view, onClick: () => setDetailTarget(l) },
      { label: 'Test Link', icon: <Play size={14} />, onClick: () => testLink(l.id) },
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(l) },
      { label: 'Duplicate', icon: actionIcons.duplicate, onClick: () => duplicateLink(l.id) },
      { label: l.status === 'active' ? 'Deactivate' : 'Activate', icon: actionIcons.activate, onClick: () => updateLink(l.id, { status: l.status === 'active' ? 'inactive' : 'active' }) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(l), danger: true },
    ]} />
  );

  return (
    <div>
      <PageHeader
        title="Links"
        subtitle="Create and manage short links with UTM tracking"
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}>
            <Plus size={16} /> Create Link
          </button>
        }
      />

      <div className="card overflow-hidden">
        {data.links.length === 0 ? (
          <EmptyState icon={<Link2 size={28} />} title="No links yet" message="Create your first short link to start tracking clicks." action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create Link</button>} />
        ) : (
          <DataTable
            columns={columns}
            rows={data.links}
            rowKey={l => l.id}
            onRowClick={l => setDetailTarget(l)}
            actions={actions}
            searchKeys={['name', 'shortUrl', 'destinationUrl', 'utmSource']}
            searchPlaceholder="Search links..."
            filters={[
              { label: 'Status', key: 'status', options: STATUS_OPTIONS },
              { label: 'Campaign', key: 'campaignId', options: data.campaigns.map(c => ({ label: c.name, value: c.id })) },
            ]}
          />
        )}
      </div>

      {showCreate && <LinkForm onClose={() => setShowCreate(false)} onSave={(l) => { createLink(l); setShowCreate(false); }} />}
      {editTarget && <LinkForm link={editTarget} onClose={() => setEditTarget(null)} onSave={(l) => { updateLink(editTarget.id, l); setEditTarget(null); }} />}
      {detailTarget && <LinkDetail link={detailTarget} onClose={() => setDetailTarget(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Link"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => { if (deleteTarget) deleteLink(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function LinkForm({ link, onClose, onSave }: {
  link?: Link;
  onClose: () => void;
  onSave: (l: Omit<Link, 'id' | 'createdAt' | 'clicks' | 'uniqueVisitors' | 'conversions' | 'shortUrl'>) => void;
}) {
  const { data } = useApp();
  const [name, setName] = useState(link?.name || '');
  const [destinationUrl, setDestinationUrl] = useState(link?.destinationUrl || 'https://');
  const [alias, setAlias] = useState(link?.alias || '');
  const [campaignId, setCampaignId] = useState(link?.campaignId || '');
  const [utmSource, setUtmSource] = useState(link?.utmSource || '');
  const [utmMedium, setUtmMedium] = useState(link?.utmMedium || '');
  const [utmCampaign, setUtmCampaign] = useState(link?.utmCampaign || '');
  const [utmTerm, setUtmTerm] = useState(link?.utmTerm || '');
  const [utmContent, setUtmContent] = useState(link?.utmContent || '');
  const [expirationDate, setExpirationDate] = useState(link?.expirationDate?.split('T')[0] || '');
  const [status, setStatus] = useState<LinkStatus>(link?.status || 'active');

  const handleSave = () => {
    if (!name.trim() || !destinationUrl.trim()) return;
    onSave({
      name, destinationUrl, alias,
      campaignId: campaignId || null,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
      status,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={link ? 'Edit Link' : 'Create Link'}
      size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{link ? 'Save Changes' : 'Create Link'}</button>
      </>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Link Name" required>
          <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AADOM Booth Link" />
        </Field>
        <Field label="Custom Alias">
          <input className="input-base" value={alias} onChange={e => setAlias(e.target.value)} placeholder="aadom-booth" />
        </Field>
        <Field label="Destination URL" required className="md:col-span-2">
          <input className="input-base" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)} placeholder="https://practiceprofitlabs.com/webinar" />
        </Field>
        <Field label="Campaign">
          <Select value={campaignId} onChange={setCampaignId} options={data.campaigns.map(c => ({ label: c.name, value: c.id }))} placeholder="No campaign" />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={v => setStatus(v as LinkStatus)} options={STATUS_OPTIONS} />
        </Field>
        <Field label="UTM Source">
          <input className="input-base" value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="facebook" />
        </Field>
        <Field label="UTM Medium">
          <input className="input-base" value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="social" />
        </Field>
        <Field label="UTM Campaign">
          <input className="input-base" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="AADOM2026" />
        </Field>
        <Field label="UTM Term">
          <input className="input-base" value={utmTerm} onChange={e => setUtmTerm(e.target.value)} placeholder="dental-marketing" />
        </Field>
        <Field label="UTM Content" className="md:col-span-2">
          <input className="input-base" value={utmContent} onChange={e => setUtmContent(e.target.value)} placeholder="booth-qr" />
        </Field>
        <Field label="Expiration Date">
          <input type="date" className="input-base" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
        </Field>
      </div>
      {link && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">Note: The short URL <span className="font-mono font-semibold">{link.shortUrl}</span> will not change when you edit the destination URL.</p>
        </div>
      )}
    </Modal>
  );
}

function LinkDetail({ link, onClose }: { link: Link; onClose: () => void }) {
  const { data, testLink } = useApp();
  const currentLink = data.links.find(l => l.id === link.id) || link;
  const campaign = data.campaigns.find(c => c.id === currentLink.campaignId);
  const linkEvents = data.events.filter(e => e.linkId === currentLink.id).slice(-30);

  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), clicks: Math.floor(currentLink.clicks / 14) + Math.floor(Math.random() * 5) };
  });

  return (
    <Drawer open onClose={onClose} title={currentLink.name} width="max-w-2xl">
      <div className="space-y-6">
        {/* Short URL */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Short URL</span>
            <CopyButton text={`https://${currentLink.shortUrl}`} />
          </div>
          <div className="font-mono text-sm text-teal-700" style={{ color: '#0d9488' }}>https://{currentLink.shortUrl}</div>
          <div className="mt-2 text-xs text-slate-400">→ {currentLink.destinationUrl}</div>
        </div>

        <div className="flex items-center gap-3">
          <Badge status={currentLink.status} />
          {campaign && <span className="text-sm text-slate-500">{campaign.name}</span>}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Total Clicks" value={formatNumber(currentLink.clicks)} icon={<Link2 size={16} />} />
          <KPICard label="Unique Visitors" value={formatNumber(currentLink.uniqueVisitors)} icon={<Eye size={16} />} color="#0369a1" />
          <KPICard label="Conversions" value={formatNumber(currentLink.conversions)} icon={<Play size={16} />} color="#0d9488" />
          <KPICard label="Conv. Rate" value={currentLink.clicks > 0 ? `${((currentLink.conversions / currentLink.clicks) * 100).toFixed(1)}%` : '0%'} icon={<Play size={16} />} color="#d97706" />
        </div>

        {/* Click trend */}
        <SectionCard title="Click Trend (Last 14 Days)">
          <AreaTrendChart data={trendData} dataKey="clicks" />
        </SectionCard>

        {/* UTM Parameters */}
        <SectionCard title="UTM Parameters">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Source:</span> <span className="font-medium text-slate-700">{currentLink.utmSource || '—'}</span></div>
            <div><span className="text-slate-400">Medium:</span> <span className="font-medium text-slate-700">{currentLink.utmMedium || '—'}</span></div>
            <div><span className="text-slate-400">Campaign:</span> <span className="font-medium text-slate-700">{currentLink.utmCampaign || '—'}</span></div>
            <div><span className="text-slate-400">Term:</span> <span className="font-medium text-slate-700">{currentLink.utmTerm || '—'}</span></div>
            <div><span className="text-slate-400">Content:</span> <span className="font-medium text-slate-700">{currentLink.utmContent || '—'}</span></div>
            <div><span className="text-slate-400">Expires:</span> <span className="font-medium text-slate-700">{currentLink.expirationDate ? formatDate(currentLink.expirationDate) : 'Never'}</span></div>
          </div>
        </SectionCard>

        {/* Recent events */}
        <SectionCard title="Recent Events">
          {linkEvents.length === 0 ? <p className="text-sm text-slate-400">No events yet</p> : (
            <div className="space-y-2">
              {linkEvents.slice(-8).reverse().map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700 capitalize">{e.type.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-slate-400">{e.page}</div>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(e.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Test link */}
        <button className="btn-primary w-full justify-center" onClick={() => testLink(currentLink.id)} style={{ background: '#0d9488' }}>
          <Play size={16} /> Test Link (Simulate Click)
        </button>
      </div>
    </Drawer>
  );
}
