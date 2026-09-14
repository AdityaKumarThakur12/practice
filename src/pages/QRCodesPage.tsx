import { useState } from 'react';
import { Plus, QrCode, Eye, Pencil, Copy, Trash2, Power, Download, Play } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons, CopyButton } from '@/components/ui/ActionMenu';
import { Field, Select } from '@/components/ui/Tabs';
import { AreaTrendChart, DonutChart } from '@/components/charts/Charts';
import type { QRCode as QRType, QRStatus } from '@/types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function QRCodesPage() {
  const { data, createQRCode, updateQRCode, deleteQRCode, duplicateQRCode, testQRCode } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<QRType | null>(null);
  const [detailTarget, setDetailTarget] = useState<QRType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QRType | null>(null);

  const columns: Column<QRType>[] = [
    { key: 'name', label: 'QR Name', sortable: true, render: q => <span className="font-medium text-slate-900">{q.name}</span>, sortValue: q => q.name },
    { key: 'campaign', label: 'Campaign', sortable: true, render: q => data.campaigns.find(c => c.id === q.campaignId)?.name || '—', sortValue: q => data.campaigns.find(c => c.id === q.campaignId)?.name || '' },
    { key: 'destination', label: 'Destination', render: q => <span className="text-xs text-slate-500 truncate max-w-[180px] inline-block">{q.destinationUrl}</span> },
    { key: 'scans', label: 'Scans', sortable: true, render: q => formatNumber(q.scans), sortValue: q => q.scans },
    { key: 'uniqueScans', label: 'Unique Scans', sortable: true, render: q => formatNumber(q.uniqueScans), sortValue: q => q.uniqueScans },
    { key: 'conversions', label: 'Conv.', sortable: true, render: q => formatNumber(q.conversions), sortValue: q => q.conversions },
    { key: 'status', label: 'Status', sortable: true, render: q => <Badge status={q.status} />, sortValue: q => q.status },
    { key: 'createdAt', label: 'Created', sortable: true, render: q => formatDate(q.createdAt), sortValue: q => q.createdAt },
  ];

  const actions = (q: QRType) => (
    <ActionMenu items={[
      { label: 'View Details', icon: actionIcons.view, onClick: () => setDetailTarget(q) },
      { label: 'Test Scan', icon: <Play size={14} />, onClick: () => testQRCode(q.id) },
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(q) },
      { label: 'Duplicate', icon: actionIcons.duplicate, onClick: () => duplicateQRCode(q.id) },
      { label: q.status === 'active' ? 'Deactivate' : 'Activate', icon: actionIcons.activate, onClick: () => updateQRCode(q.id, { status: q.status === 'active' ? 'inactive' : 'active' }) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(q), danger: true },
    ]} />
  );

  return (
    <div>
      <PageHeader title="QR Codes" subtitle="Create and manage dynamic QR codes" action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create QR Code</button>} />
      <div className="card overflow-hidden">
        {data.qrCodes.length === 0 ? (
          <EmptyState icon={<QrCode size={28} />} title="No QR codes yet" message="Create your first QR code to start tracking scans." action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create QR Code</button>} />
        ) : (
          <DataTable columns={columns} rows={data.qrCodes} rowKey={q => q.id} onRowClick={q => setDetailTarget(q)} actions={actions} searchKeys={['name', 'destinationUrl']} searchPlaceholder="Search QR codes..." filters={[{ label: 'Status', key: 'status', options: STATUS_OPTIONS }, { label: 'Campaign', key: 'campaignId', options: data.campaigns.map(c => ({ label: c.name, value: c.id })) }]} />
        )}
      </div>
      {showCreate && <QRForm onClose={() => setShowCreate(false)} onSave={(q) => { createQRCode(q); setShowCreate(false); }} />}
      {editTarget && <QRForm qr={editTarget} onClose={() => setEditTarget(null)} onSave={(q) => { updateQRCode(editTarget.id, q); setEditTarget(null); }} />}
      {detailTarget && <QRDetail qr={detailTarget} onClose={() => setDetailTarget(null)} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete QR Code" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} onConfirm={() => { if (deleteTarget) deleteQRCode(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

function QRForm({ qr, onClose, onSave }: { qr?: QRType; onClose: () => void; onSave: (q: Omit<QRType, 'id' | 'createdAt' | 'scans' | 'uniqueScans' | 'conversions'>) => void }) {
  const { data } = useApp();
  const [name, setName] = useState(qr?.name || '');
  const [campaignId, setCampaignId] = useState(qr?.campaignId || '');
  const [linkId, setLinkId] = useState(qr?.linkId || '');
  const [destinationUrl, setDestinationUrl] = useState(qr?.destinationUrl || 'https://');
  const [fgColor, setFgColor] = useState(qr?.style?.fgColor || '#0f172a');
  const [bgColor, setBgColor] = useState(qr?.style?.bgColor || '#ffffff');
  const [status, setStatus] = useState<QRStatus>(qr?.status || 'active');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name, campaignId: campaignId || null, linkId: linkId || null,
      destinationUrl: destinationUrl || (linkId ? data.links.find(l => l.id === linkId)?.destinationUrl || 'https://' : 'https://'),
      status,
      style: { fgColor, bgColor, size: 256 },
    });
  };

  const previewUrl = destinationUrl !== 'https://' ? destinationUrl : 'https://practiceprofitlabs.com';

  return (
    <Modal open onClose={onClose} title={qr ? 'Edit QR Code' : 'Create QR Code'} size="lg" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{qr ? 'Save' : 'Create'}</button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <QRCodeCanvas value={previewUrl} size={140} fgColor={fgColor} bgColor={bgColor} level="M" />
            </div>
            <span className="text-xs text-slate-400">Live Preview</span>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-3">
            <Field label="QR Name" required><input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AADOM Booth QR" /></Field>
            <Field label="Campaign"><Select value={campaignId} onChange={setCampaignId} options={data.campaigns.map(c => ({ label: c.name, value: c.id }))} placeholder="No campaign" /></Field>
            <Field label="Select Existing Link (optional)"><Select value={linkId} onChange={(v) => { setLinkId(v); const l = data.links.find(l => l.id === v); if (l) setDestinationUrl(l.destinationUrl); }} options={data.links.map(l => ({ label: l.name, value: l.id }))} placeholder="Select a link" /></Field>
          </div>
        </div>
        <Field label="Destination URL" required className="md:col-span-2"><input className="input-base" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)} placeholder="https://practiceprofitlabs.com/webinar" /></Field>
        <Field label="Foreground Color"><input type="color" className="w-full h-10 rounded-lg border border-slate-200" value={fgColor} onChange={e => setFgColor(e.target.value)} /></Field>
        <Field label="Background Color"><input type="color" className="w-full h-10 rounded-lg border border-slate-200" value={bgColor} onChange={e => setBgColor(e.target.value)} /></Field>
        <Field label="Status"><Select value={status} onChange={v => setStatus(v as QRStatus)} options={STATUS_OPTIONS} /></Field>
      </div>
      {qr && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"><p className="text-xs text-amber-700">Changing the destination preserves the QR code identity. The same QR image will redirect to the new URL.</p></div>}
    </Modal>
  );
}

function QRDetail({ qr, onClose }: { qr: QRType; onClose: () => void }) {
  const { data, testQRCode } = useApp();
  const currentQR = data.qrCodes.find(q => q.id === qr.id) || qr;
  const campaign = data.campaigns.find(c => c.id === currentQR.campaignId);
  const qrEvents = data.events.filter(e => e.qrId === currentQR.id);
  const repeatScans = currentQR.scans - currentQR.uniqueScans;

  const deviceMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  qrEvents.forEach(e => { deviceMap[e.device] = (deviceMap[e.device] || 0) + 1; countryMap[e.country] = (countryMap[e.country] || 0) + 1; });

  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), scans: Math.floor(currentQR.scans / 14) + Math.floor(Math.random() * 3) };
  });

  const downloadQR = () => {
    const canvas = document.querySelector(`canvas[data-qr-id="${currentQR.id}"]`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentQR.name.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <Drawer open onClose={onClose} title={currentQR.name} width="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <QRCodeCanvas value={currentQR.destinationUrl} size={140} fgColor={currentQR.style.fgColor} bgColor={currentQR.style.bgColor} level="M" data-qr-id={currentQR.id} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2"><Badge status={currentQR.status} />{campaign && <span className="text-sm text-slate-500">{campaign.name}</span>}</div>
            <div className="text-xs text-slate-400 mb-2">Destination:</div>
            <div className="text-sm text-slate-700 font-mono break-all">{currentQR.destinationUrl}</div>
            <div className="flex gap-2 mt-3">
              <button className="btn-secondary text-xs" onClick={downloadQR}><Download size={14} /> Download</button>
              <CopyButton text={currentQR.destinationUrl} label="Copy URL" />
              <button className="btn-secondary text-xs" onClick={() => testQRCode(currentQR.id)}><Play size={14} /> Test Scan</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Total Scans" value={formatNumber(currentQR.scans)} icon={<QrCode size={16} />} />
          <KPICard label="Unique Scans" value={formatNumber(currentQR.uniqueScans)} icon={<Eye size={16} />} color="#0369a1" />
          <KPICard label="Repeat Scans" value={formatNumber(Math.max(0, repeatScans))} icon={<Copy size={16} />} color="#d97706" />
          <KPICard label="Conversions" value={formatNumber(currentQR.conversions)} icon={<Play size={16} />} color="#0d9488" />
        </div>

        <SectionCard title="Scan Trend"><AreaTrendChart data={trendData} dataKey="scans" color="#d97706" /></SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Device Breakdown">
            {Object.keys(deviceMap).length === 0 ? <p className="text-sm text-slate-400">No data</p> : <DonutChart data={Object.entries(deviceMap).map(([device, value]) => ({ name: device, value }))} />}
          </SectionCard>
          <SectionCard title="Country Breakdown">
            {Object.keys(countryMap).length === 0 ? <p className="text-sm text-slate-400">No data</p> : (
              <div className="space-y-2">{Object.entries(countryMap).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                <div key={country} className="flex items-center justify-between text-sm"><span className="text-slate-600 capitalize">{country}</span><span className="font-medium text-slate-900">{count}</span></div>
              ))}</div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Recent Visitor Activity">
          {qrEvents.length === 0 ? <p className="text-sm text-slate-400">No activity yet</p> : (
            <div className="space-y-2">{qrEvents.slice(-8).reverse().map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div><div className="text-sm font-medium text-slate-700 capitalize">{e.type.replace(/_/g, ' ')}</div><div className="text-xs text-slate-400">{e.device} • {e.country}</div></div>
                <span className="text-xs text-slate-400">{formatDate(e.timestamp)}</span>
              </div>
            ))}</div>
          )}
        </SectionCard>
      </div>
    </Drawer>
  );
}
