import { useState, useMemo } from 'react';
import { Tag, Link2, QrCode, Save, RotateCcw, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, SectionCard } from '@/components/ui/KPI';
import { EmptyState } from '@/components/ui/Feedback';
import { Field } from '@/components/ui/Tabs';
import { CopyButton } from '@/components/ui/ActionMenu';

export function UTMBuilderPage() {
  const { data, createLink, createQRCode, createUTMTemplate, deleteUTMTemplate, showToast } = useApp();
  const [websiteUrl, setWebsiteUrl] = useState('https://practiceprofitlabs.com/webinar');
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('AADOM2026');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('booth-qr');
  const [templateName, setTemplateName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const builtUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);
    const qs = params.toString();
    return qs ? `${websiteUrl}?${qs}` : websiteUrl;
  }, [websiteUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const reset = () => { setWebsiteUrl('https://'); setUtmSource(''); setUtmMedium(''); setUtmCampaign(''); setUtmTerm(''); setUtmContent(''); };

  const handleCreateShortLink = () => {
    createLink({
      name: `${utmCampaign || 'UTM'} Link`,
      alias: '',
      destinationUrl: websiteUrl,
      campaignId: selectedCampaign || null,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      status: 'active', expirationDate: null,
    });
  };

  const handleCreateQR = () => {
    createQRCode({
      name: `${utmCampaign || 'UTM'} QR`,
      campaignId: selectedCampaign || null, linkId: null,
      destinationUrl: builtUrl, status: 'active',
      style: { fgColor: '#0f172a', bgColor: '#ffffff', size: 256 },
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) { showToast('Enter a template name first', 'warning'); return; }
    createUTMTemplate({ name: templateName, source: utmSource, medium: utmMedium, campaign: utmCampaign, term: utmTerm, content: utmContent });
    setTemplateName('');
  };

  const applyTemplate = (t: typeof data.utmTemplates[0]) => {
    setUtmSource(t.source); setUtmMedium(t.medium); setUtmCampaign(t.campaign); setUtmTerm(t.term); setUtmContent(t.content);
  };

  return (
    <div>
      <PageHeader title="UTM Builder" subtitle="Build tracking URLs with UTM parameters" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="UTM Parameters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Website URL" required className="md:col-span-2"><input className="input-base" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://practiceprofitlabs.com/webinar" /></Field>
              <Field label="utm_source" required><input className="input-base" value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="facebook" /></Field>
              <Field label="utm_medium" required><input className="input-base" value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="social" /></Field>
              <Field label="utm_campaign"><input className="input-base" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="AADOM2026" /></Field>
              <Field label="utm_term"><input className="input-base" value={utmTerm} onChange={e => setUtmTerm(e.target.value)} placeholder="dental-marketing" /></Field>
              <Field label="utm_content" className="md:col-span-2"><input className="input-base" value={utmContent} onChange={e => setUtmContent(e.target.value)} placeholder="booth-qr" /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Generated URL">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-mono text-sm text-slate-700 break-all mb-3">{builtUrl}</div>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={builtUrl} label="Copy URL" />
                <button className="btn-secondary text-xs" onClick={handleCreateShortLink}><Link2 size={14} /> Create Short Link</button>
                <button className="btn-secondary text-xs" onClick={handleCreateQR}><QrCode size={14} /> Create QR Code</button>
                <button className="btn-secondary text-xs" onClick={reset}><RotateCcw size={14} /> Reset</button>
              </div>
            </div>
            <div className="mt-4">
              <Field label="Assign to Campaign (optional)">
                <select className="input-base" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                  <option value="">No campaign</option>
                  {data.campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Save as Template">
            <Field label="Template Name"><input className="input-base" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Facebook Social" /></Field>
            <button className="btn-primary w-full mt-3 justify-center" onClick={handleSaveTemplate} style={{ background: '#0d9488' }}><Save size={16} /> Save Template</button>
          </SectionCard>

          <SectionCard title="Saved Templates">
            {data.utmTemplates.length === 0 ? (
              <EmptyState icon={<Tag size={24} />} title="No templates" message="Save UTM parameters as reusable templates." />
            ) : (
              <div className="space-y-2">
                {data.utmTemplates.map(t => (
                  <div key={t.id} className="p-3 border border-slate-200 rounded-lg hover:border-teal-400 transition group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                      <button onClick={() => deleteUTMTemplate(t.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{t.source} / {t.medium} / {t.campaign}</div>
                    <button onClick={() => applyTemplate(t)} className="text-xs text-teal-600 hover:underline" style={{ color: '#0d9488' }}>Apply template</button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
