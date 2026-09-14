import { useState } from 'react';
import { Plus, FileText, Eye, Pencil, Trash2, CheckCircle2, Phone, Mail, UserCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate, timeAgo } from '@/utils/format';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal, Drawer } from '@/components/ui/Modal';
import { Badge, ConfirmDialog, EmptyState } from '@/components/ui/Feedback';
import { ActionMenu, actionIcons } from '@/components/ui/ActionMenu';
import { Field, Select } from '@/components/ui/Tabs';
import type { Lead, LeadStatus } from '@/types';

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Converted', value: 'converted' },
  { label: 'Disqualified', value: 'disqualified' },
];

export function FormsLeadsPage() {
  const { data, createLead, updateLead, deleteLead } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Lead | null>(null);
  const [detailTarget, setDetailTarget] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const columns: Column<Lead>[] = [
    { key: 'formName', label: 'Form', sortable: true, render: l => <span className="font-medium text-slate-900">{l.formName}</span>, sortValue: l => l.formName },
    { key: 'name', label: 'Name', sortable: true, render: l => l.name, sortValue: l => l.name },
    { key: 'email', label: 'Email', render: l => <span className="text-xs text-slate-600">{l.email}</span> },
    { key: 'phone', label: 'Phone', render: l => <span className="text-xs text-slate-600">{l.phone}</span> },
    { key: 'practice', label: 'Practice', sortable: true, render: l => l.practice, sortValue: l => l.practice },
    { key: 'campaign', label: 'Campaign', render: l => data.campaigns.find(c => c.id === l.campaignId)?.name || '—' },
    { key: 'source', label: 'Source', sortable: true, render: l => <span className="capitalize">{l.source.replace(/_/g, ' ')}</span>, sortValue: l => l.source },
    { key: 'landingPage', label: 'Landing Page', render: l => <span className="text-xs text-slate-500">{l.landingPage}</span> },
    { key: 'submittedAt', label: 'Submitted', sortable: true, render: l => timeAgo(l.submittedAt), sortValue: l => l.submittedAt },
    { key: 'status', label: 'Status', sortable: true, render: l => <Badge status={l.status} />, sortValue: l => l.status },
  ];

  const actions = (l: Lead) => (
    <ActionMenu items={[
      { label: 'View Details', icon: actionIcons.view, onClick: () => setDetailTarget(l) },
      { label: 'Edit', icon: actionIcons.edit, onClick: () => setEditTarget(l) },
      { label: 'Mark Qualified', icon: <CheckCircle2 size={14} />, onClick: () => updateLead(l.id, { status: 'qualified' }) },
      { label: 'Mark Contacted', icon: <Phone size={14} />, onClick: () => updateLead(l.id, { status: 'contacted' }) },
      { label: 'Convert', icon: <UserCheck size={14} />, onClick: () => updateLead(l.id, { status: 'converted' }) },
      { label: 'Delete', icon: actionIcons.delete, onClick: () => setDeleteTarget(l), danger: true },
    ]} />
  );

  const newCount = data.leads.filter(l => l.status === 'new').length;
  const qualifiedCount = data.leads.filter(l => l.status === 'qualified').length;
  const convertedCount = data.leads.filter(l => l.status === 'converted').length;

  return (
    <div>
      <PageHeader title="Forms / Leads" subtitle="Manage form submissions and leads" action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create Lead</button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Leads" value={data.leads.length} icon={<FileText size={16} />} />
        <KPICard label="New" value={newCount} icon={<FileText size={16} />} color="#0369a1" />
        <KPICard label="Qualified" value={qualifiedCount} icon={<CheckCircle2 size={16} />} color="#d97706" />
        <KPICard label="Converted" value={convertedCount} icon={<UserCheck size={16} />} color="#16a34a" />
      </div>

      <div className="card overflow-hidden">
        {data.leads.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No leads yet" message="Leads from form submissions will appear here." action={<button className="btn-primary" onClick={() => setShowCreate(true)} style={{ background: '#0d9488' }}><Plus size={16} /> Create Lead</button>} />
        ) : (
          <DataTable columns={columns} rows={data.leads} rowKey={l => l.id} onRowClick={l => setDetailTarget(l)} actions={actions} searchKeys={['name', 'email', 'practice', 'formName']} searchPlaceholder="Search leads..." filters={[{ label: 'Status', key: 'status', options: STATUS_OPTIONS }, { label: 'Campaign', key: 'campaignId', options: data.campaigns.map(c => ({ label: c.name, value: c.id })) }]} />
        )}
      </div>

      {showCreate && <LeadForm onClose={() => setShowCreate(false)} onSave={(l) => { createLead(l); setShowCreate(false); }} />}
      {editTarget && <LeadForm lead={editTarget} onClose={() => setEditTarget(null)} onSave={(l) => { updateLead(editTarget.id, l); setEditTarget(null); }} />}
      {detailTarget && <LeadDetail lead={detailTarget} onClose={() => setDetailTarget(null)} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Lead" message={`Delete lead "${deleteTarget?.name}"? This cannot be undone.`} onConfirm={() => { if (deleteTarget) deleteLead(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

function LeadForm({ lead, onClose, onSave }: { lead?: Lead; onClose: () => void; onSave: (l: Omit<Lead, 'id' | 'submittedAt'>) => void }) {
  const { data } = useApp();
  const [formName, setFormName] = useState(lead?.formName || 'Contact Form');
  const [name, setName] = useState(lead?.name || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [practice, setPractice] = useState(lead?.practice || '');
  const [website, setWebsite] = useState(lead?.website || '');
  const [campaignId, setCampaignId] = useState(lead?.campaignId || '');
  const [source, setSource] = useState(lead?.source || 'direct');
  const [landingPage, setLandingPage] = useState(lead?.landingPage || '/contact');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new');

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({ formName, name, email, phone, practice, website, campaignId: campaignId || null, source: source as Lead['source'], landingPage, status, visitorId: lead?.visitorId || null, sessionId: lead?.sessionId || null });
  };

  return (
    <Modal open onClose={onClose} title={lead ? 'Edit Lead' : 'Create Lead'} size="lg" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} style={{ background: '#0d9488' }}>{lead ? 'Save' : 'Create'}</button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Form Name"><Select value={formName} onChange={setFormName} options={['Contact Form', 'Webinar Registration', 'Demo Request', 'Appointment Booking', 'Free Consultation', 'Newsletter Signup', 'Download Guide'].map(f => ({ label: f, value: f }))} /></Field>
        <Field label="Status"><Select value={status} onChange={v => setStatus(v as LeadStatus)} options={STATUS_OPTIONS} /></Field>
        <Field label="Name" required><input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" /></Field>
        <Field label="Email" required><input className="input-base" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" /></Field>
        <Field label="Phone"><input className="input-base" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" /></Field>
        <Field label="Practice / Company"><input className="input-base" value={practice} onChange={e => setPractice(e.target.value)} placeholder="Smile Dental" /></Field>
        <Field label="Website"><input className="input-base" value={website} onChange={e => setWebsite(e.target.value)} placeholder="smiledental.com" /></Field>
        <Field label="Campaign"><Select value={campaignId} onChange={setCampaignId} options={data.campaigns.map(c => ({ label: c.name, value: c.id }))} placeholder="No campaign" /></Field>
        <Field label="Source"><Select value={source} onChange={v => setSource(v as Lead['source'])} options={['facebook', 'google', 'email', 'direct', 'qr_code', 'referral', 'linkedin', 'instagram'].map(s => ({ label: s.replace(/_/g, ' '), value: s }))} /></Field>
        <Field label="Landing Page"><input className="input-base" value={landingPage} onChange={e => setLandingPage(e.target.value)} placeholder="/contact" /></Field>
      </div>
    </Modal>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { data } = useApp();
  const current = data.leads.find(l => l.id === lead.id) || lead;
  const campaign = data.campaigns.find(c => c.id === current.campaignId);
  const visitor = data.visitors.find(v => v.id === current.visitorId);
  const session = data.sessions.find(s => s.id === current.sessionId);

  return (
    <Drawer open onClose={onClose} title={current.name} width="max-w-xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge status={current.status} />
          <span className="text-sm text-slate-500">{current.formName}</span>
          <span className="text-sm text-slate-400">Submitted {timeAgo(current.submittedAt)}</span>
        </div>

        <SectionCard title="Contact Information">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Name:</span> <span className="font-medium text-slate-700">{current.name}</span></div>
            <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-700">{current.email}</span></div>
            <div><span className="text-slate-400">Phone:</span> <span className="font-medium text-slate-700">{current.phone}</span></div>
            <div><span className="text-slate-400">Practice:</span> <span className="font-medium text-slate-700">{current.practice}</span></div>
            <div><span className="text-slate-400">Website:</span> <span className="font-medium text-slate-700">{current.website}</span></div>
            <div><span className="text-slate-400">Landing Page:</span> <span className="font-medium text-slate-700">{current.landingPage}</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Attribution">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Campaign:</span> <span className="font-medium text-slate-700">{campaign?.name || 'Direct'}</span></div>
            <div><span className="text-slate-400">Source:</span> <span className="font-medium text-slate-700 capitalize">{current.source.replace(/_/g, ' ')}</span></div>
            {visitor && <div><span className="text-slate-400">Visitor:</span> <span className="font-mono text-xs text-slate-700">{visitor.visitorId}</span></div>}
            {session && <div><span className="text-slate-400">Session:</span> <span className="font-mono text-xs text-slate-700">{session.sessionId}</span></div>}
          </div>
        </SectionCard>
      </div>
    </Drawer>
  );
}
