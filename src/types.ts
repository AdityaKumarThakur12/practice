export type ID = string;

export type CampaignStatus = 'active' | 'paused' | 'draft' | 'archived';
export type LinkStatus = 'active' | 'inactive' | 'expired';
export type QRStatus = 'active' | 'inactive';
export type WebsiteStatus = 'active' | 'inactive';
export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'disqualified';
export type ConversionStatus = 'active' | 'inactive';

export type EventType =
  | 'page_view'
  | 'session_start'
  | 'session_end'
  | 'cta_click'
  | 'button_click'
  | 'outbound_link_click'
  | 'form_start'
  | 'form_submit'
  | 'file_download'
  | 'phone_click'
  | 'email_click'
  | 'whatsapp_click'
  | 'video_play'
  | 'video_progress'
  | 'video_completion'
  | 'scroll_depth'
  | 'custom_event'
  | 'conversion';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type TrafficSource = 'facebook' | 'google' | 'email' | 'direct' | 'qr_code' | 'referral' | 'linkedin' | 'instagram' | 'twitter' | 'organic';

export interface Organization {
  id: ID;
  name: string;
  plan: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Campaign {
  id: ID;
  name: string;
  description: string;
  status: CampaignStatus;
  source: string;
  medium: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  linkIds: ID[];
  qrIds: ID[];
}

export interface Link {
  id: ID;
  name: string;
  shortUrl: string;
  alias: string;
  destinationUrl: string;
  campaignId: ID | null;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  clicks: number;
  uniqueVisitors: number;
  conversions: number;
  status: LinkStatus;
  expirationDate: string | null;
  createdAt: string;
}

export interface QRCode {
  id: ID;
  name: string;
  campaignId: ID | null;
  linkId: ID | null;
  destinationUrl: string;
  scans: number;
  uniqueScans: number;
  conversions: number;
  status: QRStatus;
  style: {
    fgColor: string;
    bgColor: string;
    size: number;
  };
  createdAt: string;
}

export interface Website {
  id: ID;
  name: string;
  domain: string;
  trackingId: string;
  status: WebsiteStatus;
  events: number;
  visitors: number;
  sessions: number;
  lastActivity: string;
  createdAt: string;
}

export interface Visitor {
  id: ID;
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
  pages: number;
  source: TrafficSource;
  campaignId: ID | null;
  device: DeviceType;
  country: string;
  region: string;
  city: string;
  browser: string;
  os: string;
  hasConverted: boolean;
  status: 'active' | 'inactive';
}

export interface Session {
  id: ID;
  sessionId: string;
  visitorId: ID;
  start: string;
  end: string;
  duration: number;
  landingPage: string;
  exitPage: string;
  pages: number;
  source: TrafficSource;
  campaignId: ID | null;
  device: DeviceType;
  country: string;
  events: number;
  hasConversion: boolean;
}

export interface EventRecord {
  id: ID;
  type: EventType;
  visitorId: ID;
  sessionId: ID;
  campaignId: ID | null;
  linkId: ID | null;
  qrId: ID | null;
  websiteId: ID | null;
  page: string;
  source: TrafficSource;
  device: DeviceType;
  country: string;
  timestamp: string;
  metadata: Record<string, string | number>;
}

export interface ConversionDefinition {
  id: ID;
  name: string;
  eventType: EventType;
  description: string;
  value: number;
  status: ConversionStatus;
  createdAt: string;
}

export interface Conversion {
  id: ID;
  definitionId: ID;
  visitorId: ID;
  sessionId: ID;
  campaignId: ID | null;
  linkId: ID | null;
  qrId: ID | null;
  value: number;
  timestamp: string;
}

export interface Lead {
  id: ID;
  formName: string;
  name: string;
  email: string;
  phone: string;
  practice: string;
  website: string;
  campaignId: ID | null;
  source: TrafficSource;
  landingPage: string;
  submittedAt: string;
  status: LeadStatus;
  visitorId: ID | null;
  sessionId: ID | null;
}

export interface FunnelStage {
  id: ID;
  name: string;
  eventType: EventType;
}

export interface Funnel {
  id: ID;
  name: string;
  stages: FunnelStage[];
}

export interface UTMTemplate {
  id: ID;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface AppData {
  organization: Organization;
  user: User;
  campaigns: Campaign[];
  links: Link[];
  qrCodes: QRCode[];
  websites: Website[];
  visitors: Visitor[];
  sessions: Session[];
  events: EventRecord[];
  conversions: Conversion[];
  conversionDefinitions: ConversionDefinition[];
  leads: Lead[];
  funnels: Funnel[];
  utmTemplates: UTMTemplate[];
  settings: {
    organization: { name: string; industry: string; timezone: string };
    profile: { name: string; email: string; bio: string };
    tracking: { anonymizeIp: boolean; respectDNT: boolean; sessionTimeout: number };
    dataRetention: { days: number; autoDelete: boolean };
    users: Array<{ id: ID; name: string; email: string; role: string; status: string }>;
    auditLogs: Array<{ id: ID; action: string; user: string; timestamp: string; detail: string }>;
  };
}
