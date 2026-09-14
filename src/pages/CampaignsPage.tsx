import { useMemo, useState } from 'react';
import { Plus, Megaphone, Eye, Pencil, Copy, Archive, Trash2, ArrowLeft, Link2, QrCode, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { computeAnalytics } from '@/utils/analytics';
import { formatNumber, formatDate, formatDuration } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons } from '@/components/ui/ActionMenu';
import { Field, Select } from '@/components/ui/Tabs';
import { AreaTrendChart, BarChartCard, DonutChart } from '@/components/charts/Charts';
import type { Campaign, CampaignStatus } from '@/types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

export function CampaignsPage({ dateRange }: { dateRange: string }) {
  const { data, createCampaign, updateCampaign, deleteCampaign, duplicateCampaign } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [detailTarget, setDetailTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  const columns: Column<Campaign>[] = [
    {
      key: 'name', label: 'Campaign', sortable: true,
      render: c => (
        <div>
          <div className="font-medium text-slate-900">{c.name}</div>
          <div className="text-xs text-slate-400">{c.description.slice(0, 50)}...</div>
        </div>
      ),
      sortValue: c => c.name,
    },
    { key: 'status', label: 'Status', sortable: true, render: c => <Badge status={c.status} />, sortValue: c => c.status },
    { key: 'source', label: 'Source', sortable: true, render: c => <span className="capitalize">{c.source}</span>, sortValue: c => c.source },
    { key: 'medium', label: 'Medium', sortable: true, render: c => <span className="capitalize">{c.medium}</span>, sortValue: c => c.medium },
    { key: 'assets', label: 'Assets', render: c => <span className="text-slate-600">{c.linkIds.length} links, {c.qrIds.length} QR</span> },
    {
      key: 'visitors', label: 'Visitors', sortable: true,
      render: c => formatNumber(data.visitors.filter(v => v.campaignId === c.id).length),
      sortValue: c => data.visitors.filter(v => v.campaignId === c.id).length,
    },
    {
      key: 'clicks', label: 'Clicks', sortable: true,
      render: c => formatNumber(data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0)),
      sortValue: c => data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0),
    },
    {
      key: 'qrScans', label: 'QR Scans', sortable: true,
      render: c => formatNumber(data.qrCodes.filter(q => q.campaignId === c.id).reduce((s, q) => s + q.scans, 0)),
      sortValue: c => data.qrCodes.filter(q => q.campaignId === c.id).reduce((s, q) => s + q.scans, 0),
    },
    {
      key: 'leads', label: 'Leads', sortable: true,
      render: c => formatNumber(data.leads.filter(l => l.campaignId === c.id).length),
      sortValue: c => data.leads.filter(l => l.campaignId === c.id).length,
    },
    {
      key: 'conversions', label: 'Conversions', sortable: true,
      render: c => formatNumber(data.conversions.filter(conv => conv.campaignId === c.id).length),
      sortValue: c => data.conversions.filter(conv => conv.campaignId === c.id).length,
    },
    {
      key: 'conversionRate', label: 'Conv. Rate', sortable: true,
      render: c => {
        const clicks = data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0);
        const convs = data.conversions.filter(conv => conv.campaignId === c.id).length;
        return clicks > 0 ? `${((convs / clicks) * 100).toFixed(1)}%` : '0%';
      },
      sortValue: c => {
        const clicks = data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0);
        const convs = data.conversions.filter(conv => conv.campaignId === c.id).length;
        return clicks > 0 ? (convs / clicks) * 100 : 0;
      },
    },
    { key: 'createdAt', label: 'Created', sortable: true, render: c => formatDate(c.createdAt), sortValue: c => c.createdAt },
  ];

  const actions = (c: Campaign) => (
    <ActionMenu items={[
      { label: 'View Details', icon: actionIcons.view, onClick: () => setDetailTarget(c) },
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(c) },
      { label: 'Duplicate', icon: actionIcons.duplicate, onClick: () => duplicateCampaign(c.id) },
      { label: c.status === 'archived' ? 'Unarchive' : 'Archive', icon: actionIcons.archive, onClick: () => updateCampaign(c.id, { status: c.status === 'archived' ? 'draft' : 'archived' }) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(c), danger: true },
    ]} />
  );

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage and track your marketing campaigns"
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}>
            <Plus size={16} /> Create Campaign
          </button>
        }
      />

      <div className="card overflow-hidden">
        {data.campaigns.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={28} />}
            title="No campaigns yet"
            message="Create your first campaign to start tracking links, QR codes, and conversions."
            action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create Campaign</button>}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={data.campaigns}
            rowKey={c => c.id}
            onRowClick={c => setDetailTarget(c)}
            actions={actions}
            searchKeys={['name', 'description', 'source', 'medium']}
            searchPlaceholder="Search campaigns..."
            filters={[
              { label: 'Status', key: 'status', options: STATUS_OPTIONS },
              { label: 'Source', key: 'source', options: [...new Set(data.campaigns.map(c => c.source))].map(s => ({ label: s, value: s })) },
            ]}
          />
        )}
      </div>

      {showCreate && <CampaignForm onClose={() => setShowCreate(false)} onSave={(c) => { createCampaign(c); setShowCreate(false); }} />}
      {editTarget && <CampaignForm campaign={editTarget} onClose={() => setEditTarget(null)} onSave={(c) => { updateCampaign(editTarget.id, c); setEditTarget(null); }} />}
      {detailTarget && <CampaignDetail campaign={detailTarget} dateRange={dateRange} onClose={() => setDetailTarget(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => { if (deleteTarget) deleteCampaign(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CampaignForm({ campaign, onClose, onSave }: {
  campaign?: Campaign;
  onClose: () => void;
  onSave: (c: Omit<Campaign, 'id' | 'createdAt' | 'linkIds' | 'qrIds'>) => void;
}) {
  const [name, setName] = useState(campaign?.name || '');
  const [description, setDescription] = useState(campaign?.description || '');
  const [status, setStatus] = useState<CampaignStatus>(campaign?.status || 'draft');
  const [source, setSource] = useState(campaign?.source || 'facebook');
  const [medium, setMedium] = useState(campaign?.medium || 'social');
  const [startDate, setStartDate] = useState(campaign?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(campaign?.endDate?.split('T')[0] || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name, description, status, source, medium,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={campaign ? 'Edit Campaign' : 'Create Campaign'}
      size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{campaign ? 'Save Changes' : 'Create Campaign'}</button>
      </>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Campaign Name" required className="md:col-span-2">
          <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AADOM 2026" />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea className="input-base min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this campaign..." />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={v => setStatus(v as CampaignStatus)} options={STATUS_OPTIONS} />
        </Field>
        <div />
        <Field label="Default Source">
          <Select value={source} onChange={setSource} options={[
            { label: 'Facebook', value: 'facebook' }, { label: 'Google', value: 'google' },
            { label: 'Email', value: 'email' }, { label: 'Direct', value: 'direct' },
            { label: 'QR Code', value: 'qr_code' }, { label: 'LinkedIn', value: 'linkedin' },
          ]} />
        </Field>
        <Field label="Default Medium">
          <Select value={medium} onChange={setMedium} options={[
            { label: 'Social', value: 'social' }, { label: 'CPC', value: 'cpc' },
            { label: 'Email', value: 'email' }, { label: 'Print', value: 'print' },
            { label: 'Referral', value: 'referral' }, { label: 'Display', value: 'display' },
          ]} />
        </Field>
        <Field label="Start Date">
          <input type="date" className="input-base" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </Field>
        <Field label="End Date">
          <input type="date" className="input-base" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function CampaignDetail({ campaign, dateRange, onClose }: { campaign: Campaign; dateRange: string; onClose: () => void }) {
  const { data } = useApp();
  const analytics = useMemo(() => computeAnalytics(data, dateRange, campaign.id), [data, dateRange, campaign]);
  const links = data.links.filter(l => l.campaignId === campaign.id);
  const qrs = data.qrCodes.filter(q => q.campaignId === campaign.id);
  const leads = data.leads.filter(l => l.campaignId === campaign.id);
  const conversions = data.conversions.filter(c => c.campaignId === campaign.id);

  return (
    <Drawer open onClose={onClose} title={campaign.name} width="max-w-3xl">
      <div className="space-y-6">
        {/* Overview */}
        <div className="flex items-center gap-3">
          <Badge status={campaign.status} />
          <span className="text-sm text-slate-500 capitalize">{campaign.source} • {campaign.medium}</span>
          <span className="text-sm text-slate-400">{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</span>
        </div>
        <p className="text-sm text-slate-600">{campaign.description}</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Visitors" value={formatNumber(analytics.uniqueVisitors)} icon={<Megaphone size={16} />} />
          <KPICard label="Clicks" value={formatNumber(analytics.totalClicks)} icon={<Link2 size={16} />} color="#0369a1" />
          <KPICard label="QR Scans" value={formatNumber(analytics.qrScans)} icon={<QrCode size={16} />} color="#d97706" />
          <KPICard label="Conversions" value={formatNumber(analytics.conversions)} icon={<Target />} color="#0d9488" />
        </div>

        {/* Traffic trend */}
        <SectionCard title="Traffic Trends">
          <AreaTrendChart data={analytics.trafficOverTime} dataKey="visits" />
        </SectionCard>

        {/* Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title={`Links (${links.length})`}>
            {links.length === 0 ? <p className="text-sm text-slate-400">No links</p> : (
              <div className="space-y-2">
                {links.slice(0, 5).map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{l.name}</div>
                      <div className="text-xs text-slate-400">{l.shortUrl}</div>
                    </div>
                    <div className="text-sm text-slate-600">{formatNumber(l.clicks)} clicks</div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={`QR Codes (${qrs.length})`}>
            {qrs.length === 0 ? <p className="text-sm text-slate-400">No QR codes</p> : (
              <div className="space-y-2">
                {qrs.slice(0, 5).map(q => (
                  <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{q.name}</div>
                      <div className="text-xs text-slate-400">{formatNumber(q.scans)} scans</div>
                    </div>
                    <Badge status={q.status} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Funnel */}
        <SectionCard title="Conversion Funnel">
          <div className="space-y-2">
            {analytics.conversionFunnel.map((stage, i) => {
              const max = analytics.conversionFunnel[0].count || 1;
              const pct = max > 0 ? (stage.count / max) * 100 : 0;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                    <span className="text-sm text-slate-500">{formatNumber(stage.count)}</span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-md overflow-hidden">
                    <div className="h-full rounded-md" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0d9488, #14b8a6)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Leads */}
        <SectionCard title={`Leads (${leads.length})`}>
          {leads.length === 0 ? <p className="text-sm text-slate-400">No leads</p> : (
            <div className="space-y-2">
              {leads.slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.email} • {l.practice}</div>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </Drawer>
  );
}


