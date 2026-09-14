import { useState } from 'react';
import { Building2, User, Code, Globe, Target, Clock, Users, ScrollText, RotateCcw, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, SectionCard } from '@/components/ui/KPI';
import { Tabs, Field } from '@/components/ui/Tabs';
import { Badge, ConfirmDialog } from '@/components/ui/Feedback';
import { formatDate, formatDateTime } from '@/utils/format';

const TABS = [
  { key: 'organization', label: 'Organization', icon: <Building2 size={16} /> },
  { key: 'profile', label: 'Profile', icon: <User size={16} /> },
  { key: 'tracking', label: 'Tracking', icon: <Code size={16} /> },
  { key: 'domains', label: 'Domains', icon: <Globe size={16} /> },
  { key: 'conversion', label: 'Conversion Events', icon: <Target size={16} /> },
  { key: 'retention', label: 'Data Retention', icon: <Clock size={16} /> },
  { key: 'users', label: 'Users & Roles', icon: <Users size={16} /> },
  { key: 'audit', label: 'Audit Logs', icon: <ScrollText size={16} /> },
];

export function SettingsPage() {
  const { data, updateSettings, resetDemoData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('organization');
  const [showReset, setShowReset] = useState(false);

  // Local state for forms
  const [orgName, setOrgName] = useState(data.settings.organization.name);
  const [orgIndustry, setOrgIndustry] = useState(data.settings.organization.industry);
  const [orgTimezone, setOrgTimezone] = useState(data.settings.organization.timezone);
  const [profileName, setProfileName] = useState(data.settings.profile.name);
  const [profileEmail, setProfileEmail] = useState(data.settings.profile.email);
  const [profileBio, setProfileBio] = useState(data.settings.profile.bio);
  const [anonymizeIp, setAnonymizeIp] = useState(data.settings.tracking.anonymizeIp);
  const [respectDNT, setRespectDNT] = useState(data.settings.tracking.respectDNT);
  const [sessionTimeout, setSessionTimeout] = useState(data.settings.tracking.sessionTimeout);
  const [retentionDays, setRetentionDays] = useState(data.settings.dataRetention.days);
  const [autoDelete, setAutoDelete] = useState(data.settings.dataRetention.autoDelete);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your Link IQ configuration" action={
        <button className="btn-danger" onClick={() => setShowReset(true)}><RotateCcw size={16} /> Reset Demo Data</button>
      } />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'organization' && (
          <SectionCard title="Organization Settings" action={<button className="btn-primary" onClick={() => updateSettings('organization', { name: orgName, industry: orgIndustry, timezone: orgTimezone })} style={{ background: '#0d9488' }}><Save size={16} /> Save</button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Field label="Organization Name"><input className="input-base" value={orgName} onChange={e => setOrgName(e.target.value)} /></Field>
              <Field label="Industry"><input className="input-base" value={orgIndustry} onChange={e => setOrgIndustry(e.target.value)} /></Field>
              <Field label="Timezone"><select className="input-base" value={orgTimezone} onChange={e => setOrgTimezone(e.target.value)}><option value="America/Chicago">America/Chicago</option><option value="America/New_York">America/New_York</option><option value="America/Los_Angeles">America/Los_Angeles</option><option value="UTC">UTC</option></select></Field>
              <Field label="Plan"><div className="input-base flex items-center text-slate-600">{data.organization.plan}</div></Field>
            </div>
          </SectionCard>
        )}

        {activeTab === 'profile' && (
          <SectionCard title="Profile Settings" action={<button className="btn-primary" onClick={() => updateSettings('profile', { name: profileName, email: profileEmail, bio: profileBio })} style={{ background: '#0d9488' }}><Save size={16} /> Save</button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Field label="Full Name"><input className="input-base" value={profileName} onChange={e => setProfileName(e.target.value)} /></Field>
              <Field label="Email"><input className="input-base" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} /></Field>
              <Field label="Bio" className="md:col-span-2"><textarea className="input-base min-h-[80px]" value={profileBio} onChange={e => setProfileBio(e.target.value)} /></Field>
            </div>
          </SectionCard>
        )}

        {activeTab === 'tracking' && (
          <SectionCard title="Tracking Settings" action={<button className="btn-primary" onClick={() => updateSettings('tracking', { anonymizeIp, respectDNT, sessionTimeout })} style={{ background: '#0d9488' }}><Save size={16} /> Save</button>}>
            <div className="space-y-4 max-w-lg">
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div><div className="text-sm font-medium text-slate-700">Anonymize IP Addresses</div><div className="text-xs text-slate-400">Mask the last octet of visitor IPs</div></div>
                <input type="checkbox" checked={anonymizeIp} onChange={e => setAnonymizeIp(e.target.checked)} className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div><div className="text-sm font-medium text-slate-700">Respect Do Not Track</div><div className="text-xs text-slate-400">Honor browser DNT headers</div></div>
                <input type="checkbox" checked={respectDNT} onChange={e => setRespectDNT(e.target.checked)} className="w-5 h-5" />
              </label>
              <Field label="Session Timeout (minutes)"><input type="number" className="input-base" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} /></Field>
            </div>
          </SectionCard>
        )}

        {activeTab === 'domains' && (
          <SectionCard title="Tracked Domains">
            <div className="space-y-2">
              {data.websites.map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div><div className="text-sm font-medium text-slate-700">{w.domain}</div><div className="text-xs text-slate-400">{w.trackingId}</div></div>
                  <Badge status={w.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {activeTab === 'conversion' && (
          <SectionCard title="Conversion Event Definitions">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Event Type</th><th>Value</th><th>Status</th></tr></thead>
                <tbody>
                  {data.conversionDefinitions.map(d => (
                    <tr key={d.id}><td className="font-medium text-slate-700">{d.name}</td><td className="capitalize">{d.eventType.replace(/_/g, ' ')}</td><td>${d.value}</td><td><Badge status={d.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'retention' && (
          <SectionCard title="Data Retention" action={<button className="btn-primary" onClick={() => updateSettings('dataRetention', { days: retentionDays, autoDelete })} style={{ background: '#0d9488' }}><Save size={16} /> Save</button>}>
            <div className="space-y-4 max-w-lg">
              <Field label="Retention Period (days)"><input type="number" className="input-base" value={retentionDays} onChange={e => setRetentionDays(Number(e.target.value))} /></Field>
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div><div className="text-sm font-medium text-slate-700">Auto-Delete Expired Data</div><div className="text-xs text-slate-400">Automatically remove data older than retention period</div></div>
                <input type="checkbox" checked={autoDelete} onChange={e => setAutoDelete(e.target.checked)} className="w-5 h-5" />
              </label>
            </div>
          </SectionCard>
        )}

        {activeTab === 'users' && (
          <SectionCard title="Users & Roles">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  {data.settings.users.map(u => (
                    <tr key={u.id}><td className="font-medium text-slate-700">{u.name}</td><td className="text-xs text-slate-600">{u.email}</td><td>{u.role}</td><td><Badge status={u.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'audit' && (
          <SectionCard title="Audit Logs">
            <div className="space-y-2">
              {data.settings.auditLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><ScrollText size={14} /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{log.action}</div>
                    <div className="text-xs text-slate-400">{log.detail}</div>
                  </div>
                  <div className="text-right"><div className="text-xs text-slate-500">{log.user}</div><div className="text-xs text-slate-400">{formatDateTime(log.timestamp)}</div></div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      <ConfirmDialog open={showReset} title="Reset Demo Data" message="This will reset all data back to the original demo state. All your changes will be lost." confirmLabel="Reset" onConfirm={() => { resetDemoData(); setShowReset(false); }} onCancel={() => setShowReset(false)} />
    </div>
  );
}
