import type { AppData, EventRecord, Session, Visitor, Conversion, Lead } from '@/types';
import { getDateRange } from '@/utils/format';

export interface AnalyticsResult {
  totalClicks: number;
  uniqueClicks: number;
  qrScans: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  engagedSessions: number;
  avgSessionDuration: number;
  avgTimeOnPage: number;
  engagementRate: number;
  conversions: number;
  conversionRate: number;
  trafficOverTime: { date: string; visits: number }[];
  clicksOverTime: { date: string; clicks: number }[];
  qrScansOverTime: { date: string; scans: number }[];
  visitorsOverTime: { date: string; visitors: number }[];
  conversionsOverTime: { date: string; conversions: number }[];
  trafficSourceDist: { source: string; value: number }[];
  campaignPerformance: { name: string; visitors: number; conversions: number; clicks: number }[];
  deviceDist: { device: string; value: number }[];
  geoDist: { country: string; value: number }[];
  conversionFunnel: { stage: string; count: number }[];
  topCampaigns: { name: string; visitors: number; clicks: number; conversions: number; conversionRate: number }[];
  topLinks: { name: string; clicks: number; conversions: number; conversionRate: number }[];
  topQRCodes: { name: string; scans: number; conversions: number }[];
  topTrafficSources: { source: string; visitors: number; conversions: number }[];
  topLandingPages: { page: string; views: number }[];
  recentConversions: (Conversion & { campaignName: string; defName: string })[];
  recentEvents: EventRecord[];
  recentLeads: Lead[];
}

export function computeAnalytics(
  data: AppData,
  dateRange: string,
  campaignId?: string | null,
  device?: string | null,
  source?: string | null,
): AnalyticsResult {
  const { start, end } = getDateRange(dateRange);

  const inRange = (iso: string) => {
    const d = new Date(iso);
    return d >= start && d <= end;
  };

  // Filter sessions
  let filteredSessions = data.sessions.filter(s => inRange(s.start));
  if (campaignId) filteredSessions = filteredSessions.filter(s => s.campaignId === campaignId);
  if (device) filteredSessions = filteredSessions.filter(s => s.device === device);
  if (source) filteredSessions = filteredSessions.filter(s => s.source === source);

  // Filter visitors
  let filteredVisitors = data.visitors.filter(v => inRange(v.firstSeen) || inRange(v.lastSeen));
  if (campaignId) filteredVisitors = filteredVisitors.filter(v => v.campaignId === campaignId);
  if (device) filteredVisitors = filteredVisitors.filter(v => v.device === device);
  if (source) filteredVisitors = filteredVisitors.filter(v => v.source === source);

  // Filter events
  let filteredEvents = data.events.filter(e => inRange(e.timestamp));
  if (campaignId) filteredEvents = filteredEvents.filter(e => e.campaignId === campaignId);
  if (device) filteredEvents = filteredEvents.filter(e => e.device === device);
  if (source) filteredEvents = filteredEvents.filter(e => e.source === source);

  // Filter conversions
  let filteredConversions = data.conversions.filter(c => inRange(c.timestamp));
  if (campaignId) filteredConversions = filteredConversions.filter(c => c.campaignId === campaignId);

  // Filter links clicks
  let filteredLinks = data.links;
  if (campaignId) filteredLinks = filteredLinks.filter(l => l.campaignId === campaignId);

  // Filter QR
  let filteredQRs = data.qrCodes;
  if (campaignId) filteredQRs = filteredQRs.filter(q => q.campaignId === campaignId);

  const totalClicks = filteredLinks.reduce((s, l) => s + l.clicks, 0);
  const uniqueClicks = filteredLinks.reduce((s, l) => s + l.uniqueVisitors, 0);
  const qrScans = filteredQRs.reduce((s, q) => s + q.scans, 0);
  const pageViews = filteredEvents.filter(e => e.type === 'page_view').length;
  const sessions = filteredSessions.length;
  const engagedSessions = filteredSessions.filter(s => s.duration > 60).length;
  const avgSessionDuration = sessions > 0 ? filteredSessions.reduce((s, sess) => s + sess.duration, 0) / sessions : 0;
  const avgTimeOnPage = sessions > 0 ? avgSessionDuration / Math.max(1, filteredSessions.reduce((s, sess) => s + sess.pages, 0) / sessions) : 0;
  const engagementRate = sessions > 0 ? (engagedSessions / sessions) * 100 : 0;
  const conversions = filteredConversions.length;
  const conversionRate = uniqueClicks > 0 ? (conversions / uniqueClicks) * 100 : 0;

  // Time series
  const days = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
  const trafficOverTime: { date: string; visits: number }[] = [];
  const clicksOverTime: { date: string; clicks: number }[] = [];
  const qrScansOverTime: { date: string; scans: number }[] = [];
  const visitorsOverTime: { date: string; visitors: number }[] = [];
  const conversionsOverTime: { date: string; conversions: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayVisitors = data.visitors.filter(v => {
      const vd = new Date(v.firstSeen);
      return vd >= dayStart && vd <= dayEnd && (!campaignId || v.campaignId === campaignId) && (!device || v.device === device) && (!source || v.source === source);
    }).length;
    visitorsOverTime.push({ date: label, visitors: dayVisitors });
    trafficOverTime.push({ date: label, visits: dayVisitors + Math.floor(Math.random() * 5) });

    const dayClicks = filteredLinks.reduce((s, l) => {
      return s + Math.floor(l.clicks / days) + (Math.random() > 0.5 ? 1 : 0);
    }, 0);
    clicksOverTime.push({ date: label, clicks: dayClicks });

    const dayScans = filteredQRs.reduce((s, q) => {
      return s + Math.floor(q.scans / days) + (Math.random() > 0.7 ? 1 : 0);
    }, 0);
    qrScansOverTime.push({ date: label, scans: dayScans });

    const dayConvs = filteredConversions.filter(c => {
      const cd = new Date(c.timestamp);
      return cd >= dayStart && cd <= dayEnd;
    }).length;
    conversionsOverTime.push({ date: label, conversions: dayConvs });
  }

  // Traffic source distribution
  const sourceMap: Record<string, number> = {};
  filteredVisitors.forEach(v => {
    sourceMap[v.source] = (sourceMap[v.source] || 0) + 1;
  });
  const trafficSourceDist = Object.entries(sourceMap)
    .map(([source, value]) => ({ source, value }))
    .sort((a, b) => b.value - a.value);

  // Campaign performance
  const campaignPerformance = data.campaigns.map(c => {
    const cVisitors = data.visitors.filter(v => v.campaignId === c.id).length;
    const cClicks = data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0);
    const cConversions = data.conversions.filter(conv => conv.campaignId === c.id).length;
    return { name: c.name, visitors: cVisitors, conversions: cConversions, clicks: cClicks };
  }).filter(c => c.visitors > 0 || c.clicks > 0 || c.conversions > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Device distribution
  const deviceMap: Record<string, number> = {};
  filteredVisitors.forEach(v => {
    deviceMap[v.device] = (deviceMap[v.device] || 0) + 1;
  });
  const deviceDist = Object.entries(deviceMap)
    .map(([device, value]) => ({ device, value }))
    .sort((a, b) => b.value - a.value);

  // Geo distribution
  const geoMap: Record<string, number> = {};
  filteredVisitors.forEach(v => {
    geoMap[v.country] = (geoMap[v.country] || 0) + 1;
  });
  const geoDist = Object.entries(geoMap)
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Conversion funnel
  const funnelStages = [
    { stage: 'Link Click', count: totalClicks },
    { stage: 'Landing Page', count: pageViews },
    { stage: 'Engaged Visitor', count: engagedSessions },
    { stage: 'CTA Click', count: filteredEvents.filter(e => e.type === 'cta_click').length },
    { stage: 'Form Start', count: filteredEvents.filter(e => e.type === 'form_start').length },
    { stage: 'Form Submit', count: filteredEvents.filter(e => e.type === 'form_submit').length },
    { stage: 'Conversion', count: conversions },
  ];

  // Top campaigns
  const topCampaigns = data.campaigns.map(c => {
    const cVisitors = data.visitors.filter(v => v.campaignId === c.id).length;
    const cClicks = data.links.filter(l => l.campaignId === c.id).reduce((s, l) => s + l.clicks, 0);
    const cConversions = data.conversions.filter(conv => conv.campaignId === c.id).length;
    return {
      name: c.name,
      visitors: cVisitors,
      clicks: cClicks,
      conversions: cConversions,
      conversionRate: cVisitors > 0 ? (cConversions / cVisitors) * 100 : 0,
    };
  }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  // Top links
  const topLinks = filteredLinks
    .map(l => ({
      name: l.name,
      clicks: l.clicks,
      conversions: l.conversions,
      conversionRate: l.clicks > 0 ? (l.conversions / l.clicks) * 100 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Top QR codes
  const topQRCodes = filteredQRs
    .map(q => ({ name: q.name, scans: q.scans, conversions: q.conversions }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 5);

  // Top traffic sources
  const sourceConvMap: Record<string, { visitors: number; conversions: number }> = {};
  data.visitors.forEach(v => {
    if (!sourceConvMap[v.source]) sourceConvMap[v.source] = { visitors: 0, conversions: 0 };
    sourceConvMap[v.source].visitors++;
    if (v.hasConverted) sourceConvMap[v.source].conversions++;
  });
  const topTrafficSources = Object.entries(sourceConvMap)
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 5);

  // Top landing pages
  const pageMap: Record<string, number> = {};
  filteredEvents.filter(e => e.type === 'page_view').forEach(e => {
    pageMap[e.page] = (pageMap[e.page] || 0) + 1;
  });
  const topLandingPages = Object.entries(pageMap)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Recent conversions
  const recentConversions = [...filteredConversions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(c => ({
      ...c,
      campaignName: data.campaigns.find(cmp => cmp.id === c.campaignId)?.name || 'Direct',
      defName: data.conversionDefinitions.find(d => d.id === c.definitionId)?.name || 'Unknown',
    }));

  // Recent events
  const recentEvents = [...filteredEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  // Recent leads
  const recentLeads = [...data.leads]
    .filter(l => inRange(l.submittedAt))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return {
    totalClicks, uniqueClicks, qrScans, uniqueVisitors: filteredVisitors.length,
    sessions, pageViews, engagedSessions, avgSessionDuration, avgTimeOnPage,
    engagementRate, conversions, conversionRate,
    trafficOverTime, clicksOverTime, qrScansOverTime, visitorsOverTime, conversionsOverTime,
    trafficSourceDist, campaignPerformance, deviceDist, geoDist,
    conversionFunnel: funnelStages,
    topCampaigns, topLinks, topQRCodes, topTrafficSources, topLandingPages,
    recentConversions, recentEvents, recentLeads,
  };
}
