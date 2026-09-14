import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  AppData, Campaign, Link, QRCode, Website, ConversionDefinition,
  Conversion, Lead, Funnel, UTMTemplate, Visitor, Session, EventRecord,
  EventType, TrafficSource, DeviceType,
} from '@/types';
import { loadData, saveData, resetData } from '@/data/persistence';

const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextValue {
  data: AppData;
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  // Campaigns
  createCampaign: (c: Omit<Campaign, 'id' | 'createdAt' | 'linkIds' | 'qrIds'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  // Links
  createLink: (l: Omit<Link, 'id' | 'createdAt' | 'clicks' | 'uniqueVisitors' | 'conversions' | 'shortUrl'>) => Link;
  updateLink: (id: string, updates: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  duplicateLink: (id: string) => void;
  testLink: (id: string) => void;
  // QR Codes
  createQRCode: (q: Omit<QRCode, 'id' | 'createdAt' | 'scans' | 'uniqueScans' | 'conversions'>) => QRCode;
  updateQRCode: (id: string, updates: Partial<QRCode>) => void;
  deleteQRCode: (id: string) => void;
  duplicateQRCode: (id: string) => void;
  testQRCode: (id: string) => void;
  // Websites
  createWebsite: (w: Omit<Website, 'id' | 'createdAt' | 'events' | 'visitors' | 'sessions' | 'lastActivity' | 'trackingId'>) => Website;
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  deleteWebsite: (id: string) => void;
  // Conversion Definitions
  createConversionDefinition: (c: Omit<ConversionDefinition, 'id' | 'createdAt'>) => void;
  updateConversionDefinition: (id: string, updates: Partial<ConversionDefinition>) => void;
  deleteConversionDefinition: (id: string) => void;
  // Conversions
  createConversion: (c: Omit<Conversion, 'id' | 'timestamp'>) => void;
  deleteConversion: (id: string) => void;
  // Leads
  createLead: (l: Omit<Lead, 'id' | 'submittedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  // Funnels
  updateFunnel: (id: string, updates: Partial<Funnel>) => void;
  createFunnel: (f: Omit<Funnel, 'id'>) => void;
  deleteFunnel: (id: string) => void;
  // UTM Templates
  createUTMTemplate: (t: Omit<UTMTemplate, 'id'>) => void;
  deleteUTMTemplate: (id: string) => void;
  // Settings
  updateSettings: (section: string, updates: Record<string, unknown>) => void;
  // Data
  resetDemoData: () => void;
  // Simulation
  simulateLinkClick: () => void;
  simulateQRScan: () => void;
  simulatePageView: () => void;
  simulateCTAClick: () => void;
  simulateFormSubmit: () => void;
  simulateConversion: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const COUNTRIES = [
  { country: 'United States', region: 'Texas', city: 'Dallas' },
  { country: 'United States', region: 'California', city: 'Los Angeles' },
  { country: 'United States', region: 'Florida', city: 'Miami' },
];
const DEVICES: DeviceType[] = ['desktop', 'mobile', 'tablet'];
const SOURCES: TrafficSource[] = ['facebook', 'google', 'email', 'direct', 'qr_code', 'referral'];
const BROWSERS = ['Chrome', 'Safari', 'Firefox'];
const OS_LIST = ['Windows 11', 'macOS Sonoma', 'iOS 17', 'Android 14'];
const PAGES = ['/webinar', '/checklist', '/demo', '/services', '/about', '/contact', '/pricing', '/book-appointment'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('linkiq_auth') === 'true';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist data on change
  useEffect(() => {
    saveData(data);
  }, [data]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = uid('toast');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth
  const login = useCallback((email: string, _password: string) => {
    if (email) {
      setIsAuthenticated(true);
      localStorage.setItem('linkiq_auth', 'true');
      showToast('Welcome back to Link IQ', 'success');
      return true;
    }
    return false;
  }, [showToast]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('linkiq_auth');
  }, []);

  // Campaigns
  const createCampaign: AppContextValue['createCampaign'] = useCallback((c) => {
    const newCampaign: Campaign = {
      ...c,
      id: uid('camp'),
      createdAt: new Date().toISOString(),
      linkIds: [],
      qrIds: [],
    };
    setData(prev => ({ ...prev, campaigns: [newCampaign, ...prev.campaigns] }));
    showToast('Campaign created successfully');
    return newCampaign;
  }, [showToast]);

  const updateCampaign: AppContextValue['updateCampaign'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    showToast('Campaign updated successfully');
  }, [showToast]);

  const deleteCampaign: AppContextValue['deleteCampaign'] = useCallback((id) => {
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(c => c.id !== id),
    }));
    showToast('Campaign deleted successfully', 'info');
  }, [showToast]);

  const duplicateCampaign: AppContextValue['duplicateCampaign'] = useCallback((id) => {
    setData(prev => {
      const orig = prev.campaigns.find(c => c.id === id);
      if (!orig) return prev;
      const copy: Campaign = {
        ...orig,
        id: uid('camp'),
        name: `${orig.name} (Copy)`,
        createdAt: new Date().toISOString(),
        linkIds: [],
        qrIds: [],
        status: 'draft',
      };
      return { ...prev, campaigns: [copy, ...prev.campaigns] };
    });
    showToast('Campaign duplicated successfully');
  }, [showToast]);

  // Links
  const createLink: AppContextValue['createLink'] = useCallback((l) => {
    const alias = l.alias || l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newLink: Link = {
      ...l,
      id: uid('link'),
      alias,
      shortUrl: `linkiq.app/go/${alias}`,
      clicks: 0,
      uniqueVisitors: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      links: [newLink, ...prev.links],
      campaigns: prev.campaigns.map(c =>
        c.id === newLink.campaignId ? { ...c, linkIds: [...c.linkIds, newLink.id] } : c
      ),
    }));
    showToast('Link created successfully');
    return newLink;
  }, [showToast]);

  const updateLink: AppContextValue['updateLink'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === id ? { ...l, ...updates } : l),
    }));
    showToast('Link updated successfully');
  }, [showToast]);

  const deleteLink: AppContextValue['deleteLink'] = useCallback((id) => {
    setData(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id),
      campaigns: prev.campaigns.map(c => ({
        ...c,
        linkIds: c.linkIds.filter(lid => lid !== id),
      })),
    }));
    showToast('Link deleted successfully', 'info');
  }, [showToast]);

  const duplicateLink: AppContextValue['duplicateLink'] = useCallback((id) => {
    setData(prev => {
      const orig = prev.links.find(l => l.id === id);
      if (!orig) return prev;
      const newAlias = `${orig.alias}-copy`;
      const copy: Link = {
        ...orig,
        id: uid('link'),
        name: `${orig.name} (Copy)`,
        alias: newAlias,
        shortUrl: `linkiq.app/go/${newAlias}`,
        clicks: 0,
        uniqueVisitors: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        status: 'inactive',
      };
      return { ...prev, links: [copy, ...prev.links] };
    });
    showToast('Link duplicated successfully');
  }, [showToast]);

  const testLink: AppContextValue['testLink'] = useCallback((id) => {
    setData(prev => {
      const link = prev.links.find(l => l.id === id);
      if (!link) return prev;
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const source = link.utmSource as TrafficSource || 'direct';
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const newVisitor: Visitor = {
        id: visitorId,
        visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now,
        lastSeen: now,
        sessions: 1,
        pages: 1,
        source,
        campaignId: link.campaignId,
        device,
        country: loc.country,
        region: loc.region,
        city: loc.city,
        browser: pick(BROWSERS),
        os: pick(OS_LIST),
        hasConverted: false,
        status: 'active',
      };
      const newSession: Session = {
        id: sessionId,
        sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId,
        start: now,
        end: now,
        duration: 1,
        landingPage: link.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        exitPage: link.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        pages: 1,
        source,
        campaignId: link.campaignId,
        device,
        country: loc.country,
        events: 2,
        hasConversion: false,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: link.campaignId, linkId: id, qrId: null, websiteId: null, page: link.destinationUrl, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: link.campaignId, linkId: id, qrId: null, websiteId: null, page: link.destinationUrl, source, device, country: loc.country, timestamp: now, metadata: {} },
      ];
      return {
        ...prev,
        links: prev.links.map(l => l.id === id ? { ...l, clicks: l.clicks + 1, uniqueVisitors: l.uniqueVisitors + 1 } : l),
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
      };
    });
    showToast('Test link clicked — click tracked and visitor/session created', 'info');
  }, [showToast]);

  // QR Codes
  const createQRCode: AppContextValue['createQRCode'] = useCallback((q) => {
    const newQR: QRCode = {
      ...q,
      id: uid('qr'),
      scans: 0,
      uniqueScans: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      qrCodes: [newQR, ...prev.qrCodes],
      campaigns: prev.campaigns.map(c =>
        c.id === newQR.campaignId ? { ...c, qrIds: [...c.qrIds, newQR.id] } : c
      ),
    }));
    showToast('QR code created successfully');
    return newQR;
  }, [showToast]);

  const updateQRCode: AppContextValue['updateQRCode'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      qrCodes: prev.qrCodes.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
    showToast('QR code updated successfully');
  }, [showToast]);

  const deleteQRCode: AppContextValue['deleteQRCode'] = useCallback((id) => {
    setData(prev => ({
      ...prev,
      qrCodes: prev.qrCodes.filter(q => q.id !== id),
      campaigns: prev.campaigns.map(c => ({
        ...c,
        qrIds: c.qrIds.filter(qid => qid !== id),
      })),
    }));
    showToast('QR code deleted successfully', 'info');
  }, [showToast]);

  const duplicateQRCode: AppContextValue['duplicateQRCode'] = useCallback((id) => {
    setData(prev => {
      const orig = prev.qrCodes.find(q => q.id === id);
      if (!orig) return prev;
      const copy: QRCode = {
        ...orig,
        id: uid('qr'),
        name: `${orig.name} (Copy)`,
        scans: 0,
        uniqueScans: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        status: 'inactive',
      };
      return { ...prev, qrCodes: [copy, ...prev.qrCodes] };
    });
    showToast('QR code duplicated successfully');
  }, [showToast]);

  const testQRCode: AppContextValue['testQRCode'] = useCallback((id) => {
    setData(prev => {
      const qr = prev.qrCodes.find(q => q.id === id);
      if (!qr) return prev;
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const source: TrafficSource = 'qr_code';
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const newVisitor: Visitor = {
        id: visitorId,
        visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now, lastSeen: now, sessions: 1, pages: 1,
        source, campaignId: qr.campaignId, device,
        country: loc.country, region: loc.region, city: loc.city,
        browser: pick(BROWSERS), os: pick(OS_LIST), hasConverted: false, status: 'active',
      };
      const newSession: Session = {
        id: sessionId, sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId, start: now, end: now, duration: 1,
        landingPage: qr.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        exitPage: qr.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        pages: 1, source, campaignId: qr.campaignId, device, country: loc.country,
        events: 2, hasConversion: false,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: qr.campaignId, linkId: qr.linkId, qrId: id, websiteId: null, page: qr.destinationUrl, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: qr.campaignId, linkId: qr.linkId, qrId: id, websiteId: null, page: qr.destinationUrl, source, device, country: loc.country, timestamp: now, metadata: {} },
      ];
      return {
        ...prev,
        qrCodes: prev.qrCodes.map(q => q.id === id ? { ...q, scans: q.scans + 1, uniqueScans: q.uniqueScans + 1 } : q),
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
      };
    });
    showToast('QR scan simulated — scan tracked and visitor/session created', 'info');
  }, [showToast]);

  // Websites
  const createWebsite: AppContextValue['createWebsite'] = useCallback((w) => {
    const newWebsite: Website = {
      ...w,
      id: uid('web'),
      trackingId: `IQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      events: 0, visitors: 0, sessions: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, websites: [newWebsite, ...prev.websites] }));
    showToast('Website added successfully');
    return newWebsite;
  }, [showToast]);

  const updateWebsite: AppContextValue['updateWebsite'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      websites: prev.websites.map(w => w.id === id ? { ...w, ...updates } : w),
    }));
    showToast('Website updated successfully');
  }, [showToast]);

  const deleteWebsite: AppContextValue['deleteWebsite'] = useCallback((id) => {
    setData(prev => ({ ...prev, websites: prev.websites.filter(w => w.id !== id) }));
    showToast('Website removed successfully', 'info');
  }, [showToast]);

  // Conversion Definitions
  const createConversionDefinition: AppContextValue['createConversionDefinition'] = useCallback((c) => {
    const newDef: ConversionDefinition = { ...c, id: uid('cd'), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, conversionDefinitions: [...prev.conversionDefinitions, newDef] }));
    showToast('Conversion definition created');
  }, [showToast]);

  const updateConversionDefinition: AppContextValue['updateConversionDefinition'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      conversionDefinitions: prev.conversionDefinitions.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    showToast('Conversion definition updated');
  }, [showToast]);

  const deleteConversionDefinition: AppContextValue['deleteConversionDefinition'] = useCallback((id) => {
    setData(prev => ({ ...prev, conversionDefinitions: prev.conversionDefinitions.filter(c => c.id !== id) }));
    showToast('Conversion definition deleted', 'info');
  }, [showToast]);

  // Conversions
  const createConversion: AppContextValue['createConversion'] = useCallback((c) => {
    const newConv: Conversion = { ...c, id: uid('conv'), timestamp: new Date().toISOString() };
    setData(prev => ({ ...prev, conversions: [newConv, ...prev.conversions] }));
    showToast('Conversion recorded successfully');
  }, [showToast]);

  const deleteConversion: AppContextValue['deleteConversion'] = useCallback((id) => {
    setData(prev => ({ ...prev, conversions: prev.conversions.filter(c => c.id !== id) }));
    showToast('Conversion deleted', 'info');
  }, [showToast]);

  // Leads
  const createLead: AppContextValue['createLead'] = useCallback((l) => {
    const newLead: Lead = { ...l, id: uid('lead'), submittedAt: new Date().toISOString() };
    setData(prev => ({ ...prev, leads: [newLead, ...prev.leads] }));
    showToast('Lead created successfully');
  }, [showToast]);

  const updateLead: AppContextValue['updateLead'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates } : l),
    }));
    showToast('Lead updated successfully');
  }, [showToast]);

  const deleteLead: AppContextValue['deleteLead'] = useCallback((id) => {
    setData(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));
    showToast('Lead deleted', 'info');
  }, [showToast]);

  // Funnels
  const updateFunnel: AppContextValue['updateFunnel'] = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      funnels: prev.funnels.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
    showToast('Funnel updated successfully');
  }, [showToast]);

  const createFunnel: AppContextValue['createFunnel'] = useCallback((f) => {
    const newFunnel: Funnel = { ...f, id: uid('funnel') };
    setData(prev => ({ ...prev, funnels: [...prev.funnels, newFunnel] }));
    showToast('Funnel created successfully');
  }, [showToast]);

  const deleteFunnel: AppContextValue['deleteFunnel'] = useCallback((id) => {
    setData(prev => ({ ...prev, funnels: prev.funnels.filter(f => f.id !== id) }));
    showToast('Funnel deleted', 'info');
  }, [showToast]);

  // UTM Templates
  const createUTMTemplate: AppContextValue['createUTMTemplate'] = useCallback((t) => {
    const newT: UTMTemplate = { ...t, id: uid('utm') };
    setData(prev => ({ ...prev, utmTemplates: [...prev.utmTemplates, newT] }));
    showToast('UTM template saved');
  }, [showToast]);

  const deleteUTMTemplate: AppContextValue['deleteUTMTemplate'] = useCallback((id) => {
    setData(prev => ({ ...prev, utmTemplates: prev.utmTemplates.filter(t => t.id !== id) }));
    showToast('UTM template deleted', 'info');
  }, [showToast]);

  // Settings
  const updateSettings: AppContextValue['updateSettings'] = useCallback((section, updates) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [section]: { ...(prev.settings as unknown as Record<string, Record<string, unknown>>)[section], ...updates },
      },
    }));
    showToast('Settings saved successfully');
  }, [showToast]);

  // Reset
  const resetDemoData: AppContextValue['resetDemoData'] = useCallback(() => {
    const fresh = resetData();
    setData(fresh);
    showToast('Demo data has been reset', 'info');
  }, [showToast]);

  // Simulation functions
  const simulateEvent = useCallback((eventType: EventType, showToastMsg: string, toastType: Toast['type'] = 'info') => {
    setData(prev => {
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const source = pick(SOURCES);
      const campaign = prev.campaigns[Math.floor(Math.random() * prev.campaigns.length)];
      const link = prev.links[Math.floor(Math.random() * prev.links.length)];
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const page = pick(PAGES);
      const newVisitor: Visitor = {
        id: visitorId, visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now, lastSeen: now, sessions: 1, pages: 1,
        source, campaignId: campaign?.id || null, device,
        country: loc.country, region: loc.region, city: loc.city,
        browser: pick(BROWSERS), os: pick(OS_LIST), hasConverted: false, status: 'active',
      };
      const newSession: Session = {
        id: sessionId, sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId, start: now, end: now, duration: Math.floor(Math.random() * 300) + 10,
        landingPage: page, exitPage: page, pages: 1, source,
        campaignId: campaign?.id || null, device, country: loc.country,
        events: 3, hasConversion: false,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: campaign?.id || null, linkId: link?.id || null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: campaign?.id || null, linkId: link?.id || null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: eventType, visitorId, sessionId, campaignId: campaign?.id || null, linkId: link?.id || null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
      ];
      return {
        ...prev,
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
        links: link ? prev.links.map(l => l.id === link.id ? { ...l, clicks: l.clicks + 1, uniqueVisitors: l.uniqueVisitors + 1 } : l) : prev.links,
      };
    });
    showToast(showToastMsg, toastType);
  }, [showToast]);

  const simulateLinkClick = useCallback(() => {
    setData(prev => {
      const link = prev.links[Math.floor(Math.random() * prev.links.length)];
      if (!link) return prev;
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const newVisitor: Visitor = {
        id: visitorId, visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now, lastSeen: now, sessions: 1, pages: 1,
        source: (link.utmSource as TrafficSource) || 'direct', campaignId: link.campaignId, device,
        country: loc.country, region: loc.region, city: loc.city,
        browser: pick(BROWSERS), os: pick(OS_LIST), hasConverted: false, status: 'active',
      };
      const newSession: Session = {
        id: sessionId, sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId, start: now, end: now, duration: 30,
        landingPage: link.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        exitPage: link.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        pages: 1, source: (link.utmSource as TrafficSource) || 'direct', campaignId: link.campaignId, device, country: loc.country,
        events: 2, hasConversion: false,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: link.campaignId, linkId: link.id, qrId: null, websiteId: null, page: link.destinationUrl, source: (link.utmSource as TrafficSource) || 'direct', device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: link.campaignId, linkId: link.id, qrId: null, websiteId: null, page: link.destinationUrl, source: (link.utmSource as TrafficSource) || 'direct', device, country: loc.country, timestamp: now, metadata: {} },
      ];
      return {
        ...prev,
        links: prev.links.map(l => l.id === link.id ? { ...l, clicks: l.clicks + 1, uniqueVisitors: l.uniqueVisitors + 1 } : l),
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
      };
    });
    showToast('Link click simulated — new visitor and session created', 'info');
  }, [showToast]);

  const simulateQRScan = useCallback(() => {
    setData(prev => {
      const qr = prev.qrCodes[Math.floor(Math.random() * prev.qrCodes.length)];
      if (!qr) return prev;
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const newVisitor: Visitor = {
        id: visitorId, visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now, lastSeen: now, sessions: 1, pages: 1,
        source: 'qr_code', campaignId: qr.campaignId, device,
        country: loc.country, region: loc.region, city: loc.city,
        browser: pick(BROWSERS), os: pick(OS_LIST), hasConverted: false, status: 'active',
      };
      const newSession: Session = {
        id: sessionId, sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId, start: now, end: now, duration: 30,
        landingPage: qr.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        exitPage: qr.destinationUrl.replace(/^https?:\/\/[^/]+/, ''),
        pages: 1, source: 'qr_code', campaignId: qr.campaignId, device, country: loc.country,
        events: 2, hasConversion: false,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: qr.campaignId, linkId: qr.linkId, qrId: qr.id, websiteId: null, page: qr.destinationUrl, source: 'qr_code', device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: qr.campaignId, linkId: qr.linkId, qrId: qr.id, websiteId: null, page: qr.destinationUrl, source: 'qr_code', device, country: loc.country, timestamp: now, metadata: {} },
      ];
      return {
        ...prev,
        qrCodes: prev.qrCodes.map(q => q.id === qr.id ? { ...q, scans: q.scans + 1, uniqueScans: q.uniqueScans + 1 } : q),
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
      };
    });
    showToast('QR scan simulated — new visitor and session created', 'info');
  }, [showToast]);

  const simulatePageView = useCallback(() => simulateEvent('page_view', 'Page view simulated'), [simulateEvent]);
  const simulateCTAClick = useCallback(() => simulateEvent('cta_click', 'CTA click simulated'), [simulateEvent]);

  const simulateFormSubmit = useCallback(() => {
    setData(prev => {
      const campaign = prev.campaigns[Math.floor(Math.random() * prev.campaigns.length)];
      const loc = pick(COUNTRIES);
      const device = pick(DEVICES);
      const source = pick(SOURCES);
      const now = new Date().toISOString();
      const visitorId = uid('vis');
      const sessionId = uid('ses');
      const page = pick(PAGES);
      const name = pick(['Alice Wang', 'Bob Stevens', 'Carol Diaz', 'Dan Foster', 'Eve Grant', 'Frank Hill']);
      const practice = pick(['Smile Dental', 'Bright Smile Clinic', 'Dental Care Plus', 'Premier Dentistry']);
      const newVisitor: Visitor = {
        id: visitorId, visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
        firstSeen: now, lastSeen: now, sessions: 1, pages: 1,
        source, campaignId: campaign?.id || null, device,
        country: loc.country, region: loc.region, city: loc.city,
        browser: pick(BROWSERS), os: pick(OS_LIST), hasConverted: true, status: 'active',
      };
      const newSession: Session = {
        id: sessionId, sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
        visitorId, start: now, end: now, duration: 120,
        landingPage: page, exitPage: page, pages: 1, source,
        campaignId: campaign?.id || null, device, country: loc.country,
        events: 4, hasConversion: true,
      };
      const newEvents: EventRecord[] = [
        { id: uid('evt'), type: 'session_start', visitorId, sessionId, campaignId: campaign?.id || null, linkId: null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'page_view', visitorId, sessionId, campaignId: campaign?.id || null, linkId: null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'form_start', visitorId, sessionId, campaignId: campaign?.id || null, linkId: null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
        { id: uid('evt'), type: 'form_submit', visitorId, sessionId, campaignId: campaign?.id || null, linkId: null, qrId: null, websiteId: null, page, source, device, country: loc.country, timestamp: now, metadata: {} },
      ];
      const newLead: Lead = {
        id: uid('lead'),
        formName: pick(['Webinar Registration', 'Demo Request', 'Contact Form', 'Free Consultation']),
        name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+1 555 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
        practice, website: `${practice.toLowerCase().replace(/\s+/g, '')}.com`,
        campaignId: campaign?.id || null, source, landingPage: page,
        submittedAt: now, status: 'new', visitorId, sessionId,
      };
      return {
        ...prev,
        visitors: [newVisitor, ...prev.visitors],
        sessions: [newSession, ...prev.sessions],
        events: [...prev.events, ...newEvents],
        leads: [newLead, ...prev.leads],
      };
    });
    showToast('Form submission simulated — new lead created', 'info');
  }, [showToast]);

  const simulateConversion = useCallback(() => {
    setData(prev => {
      const session = prev.sessions[Math.floor(Math.random() * prev.sessions.length)];
      const def = prev.conversionDefinitions[Math.floor(Math.random() * prev.conversionDefinitions.length)];
      if (!session || !def) return prev;
      const newConv: Conversion = {
        id: uid('conv'), definitionId: def.id, visitorId: session.visitorId, sessionId: session.id,
        campaignId: session.campaignId, linkId: null, qrId: null,
        value: def.value, timestamp: new Date().toISOString(),
      };
      return {
        ...prev,
        conversions: [newConv, ...prev.conversions],
        visitors: prev.visitors.map(v => v.id === session.visitorId ? { ...v, hasConverted: true } : v),
        sessions: prev.sessions.map(s => s.id === session.id ? { ...s, hasConversion: true } : s),
      };
    });
    showToast('Conversion simulated — conversion recorded', 'info');
  }, [showToast]);

  const value: AppContextValue = {
    data, isAuthenticated, login, logout,
    toasts, showToast, dismissToast,
    createCampaign, updateCampaign, deleteCampaign, duplicateCampaign,
    createLink, updateLink, deleteLink, duplicateLink, testLink,
    createQRCode, updateQRCode, deleteQRCode, duplicateQRCode, testQRCode,
    createWebsite, updateWebsite, deleteWebsite,
    createConversionDefinition, updateConversionDefinition, deleteConversionDefinition,
    createConversion, deleteConversion,
    createLead, updateLead, deleteLead,
    updateFunnel, createFunnel, deleteFunnel,
    createUTMTemplate, deleteUTMTemplate,
    updateSettings, resetDemoData,
    simulateLinkClick, simulateQRScan, simulatePageView, simulateCTAClick, simulateFormSubmit, simulateConversion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
