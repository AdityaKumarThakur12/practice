import { useState, useMemo } from 'react';
import { BarChart3, Download, FileJson, Printer, Eye, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatDate, toCSV, toJSON, downloadFile } from '@/utils/format';
import { computeAnalytics } from '@/utils/analytics';
import { PageHeader, SectionCard, KPICard } from '@/components/ui/KPI';
import { Field, Select } from '@/components/ui/Tabs';

const REPORT_TYPES = [
  { value: 'campaign', label: 'Campaign Report' },
  { value: 'traffic', label: 'Traffic Report' },
  { value: 'qr', label: 'QR Report' },
  { value: 'link', label: 'Link Report' },
  { value: 'conversion', label: 'Conversion Report' },
  { value: 'funnel', label: 'Funnel Report' },
  { value: 'attribution', label: 'Attribution Report' },
];

export function ReportsPage({ dateRange }: { dateRange: string }) {
  const { data, showToast } = useApp();
  const [reportType, setReportType] = useState('campaign');
  const [campaignId, setCampaignId] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const analytics = useMemo(() => computeAnalytics(data, dateRange, campaignId || null), [data, dateRange, campaignId]);

  const reportData = useMemo(() => {
    switch (reportType) {
      case 'campaign':
        return data.campaigns.map(c => ({
          name: c.name, status: c.status, source: c.source, medium: c.medium,
          visitors: data.visitors.filter(v => v.campaignId === c.id).length,
          clicks: data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0),
          conversions: data.conversions.filter(conv => conv.campaignId === c.id).length,
          created: formatDate(c.createdAt),
        }));
      case 'traffic':
        return analytics.trafficSourceDist.map(s => ({ source: s.source, visitors: s.value }));
      case 'qr':
        return data.qrCodes.map(q => ({ name: q.name, scans: q.scans, uniqueScans: q.uniqueScans, conversions: q.conversions, status: q.status }));
      case 'link':
        return data.links.map(l => ({ name: l.name, shortUrl: l.shortUrl, clicks: l.clicks, conversions: l.conversions, status: l.status }));
      case 'conversion':
        return data.conversions.map(c => ({
          type: data.conversionDefinitions.find(d => d.id === c.definitionId)?.name || 'Unknown',
          campaign: data.campaigns.find(cmp => cmp.id === c.campaignId)?.name || 'Direct',
          value: c.value, date: formatDate(c.timestamp),
        }));
      case 'funnel':
        return analytics.conversionFunnel.map(s => ({ stage: s.stage, users: s.count }));
      case 'attribution':
        return data.campaigns.map(c => ({
          campaign: c.name, source: c.source, medium: c.medium,
          visitors: data.visitors.filter(v => v.campaignId === c.id).length,
          conversions: data.conversions.filter(conv => conv.campaignId === c.id).length,
        })).filter(r => r.visitors > 0);
      default:
        return [];
    }
  }, [reportType, data, analytics]);

  const exportCSV = () => {
    if (reportData.length === 0) { showToast('No data to export', 'warning'); return; }
    const csv = toCSV(reportData as Record<string, unknown>[]);
    downloadFile(`linkiq-${reportType}-report-${Date.now()}.csv`, csv, 'text/csv');
    showToast('CSV exported successfully');
  };

  const exportJSON = () => {
    if (reportData.length === 0) { showToast('No data to export', 'warning'); return; }
    downloadFile(`linkiq-${reportType}-report-${Date.now()}.json`, toJSON(reportData), 'application/json');
    showToast('JSON exported successfully');
  };

  const printReport = () => {
    window.print();
  };

  const columns = reportData.length > 0 ? Object.keys(reportData[0] as Record<string, unknown>) : [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export analytics reports" action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}><Eye size={16} /> Preview</button>
          <button className="btn-secondary" onClick={exportCSV}><Download size={16} /> CSV</button>
          <button className="btn-secondary" onClick={exportJSON}><FileJson size={16} /> JSON</button>
          <button className="btn-secondary" onClick={printReport}><Printer size={16} /> Print</button>
        </div>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Field label="Report Type"><Select value={reportType} onChange={setReportType} options={REPORT_TYPES} /></Field>
        <Field label="Campaign Filter"><Select value={campaignId} onChange={setCampaignId} options={data.campaigns.map(c => ({ label: c.name, value: c.id }))} placeholder="All campaigns" /></Field>
        <Field label="Date Range"><div className="input-base flex items-center text-sm text-slate-600 capitalize">{dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : dateRange === '90d' ? 'Last 90 days' : dateRange === 'today' ? 'Today' : 'Yesterday'}</div></Field>
        <Field label="Records"><div className="input-base flex items-center text-sm text-slate-600">{reportData.length} records</div></Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Records" value={reportData.length} icon={<FileText size={16} />} />
        <KPICard label="Total Visitors" value={formatNumber(analytics.uniqueVisitors)} icon={<BarChart3 size={16} />} color="#0369a1" />
        <KPICard label="Total Conversions" value={formatNumber(analytics.conversions)} icon={<BarChart3 size={16} />} color="#0d9488" />
        <KPICard label="Conversion Rate" value={`${analytics.conversionRate.toFixed(2)}%`} icon={<BarChart3 size={16} />} color="#d97706" />
      </div>

      {showPreview && (
        <SectionCard title={`${REPORT_TYPES.find(r => r.value === reportType)?.label || 'Report'} Preview`}>
          {reportData.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No data for this report</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>{columns.map(c => <th key={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</th>)}</tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      {columns.map(c => {
                        const val = (row as Record<string, unknown>)[c];
                        return <td key={c} className="text-sm">{typeof val === 'number' ? formatNumber(val) : String(val || '')}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 50 && <p className="text-xs text-slate-400 mt-2 text-center">Showing 50 of {reportData.length} records. Export to see all.</p>}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
