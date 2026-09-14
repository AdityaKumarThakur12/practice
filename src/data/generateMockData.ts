import type {
  AppData, Campaign, Link, QRCode, Website, Visitor, Session,
  EventRecord, Conversion, ConversionDefinition, Lead, Funnel, UTMTemplate,
  EventType, DeviceType, TrafficSource,
} from '@/types';

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 10)}`;

const COUNTRIES = [
  { country: 'United States', region: 'Texas', city: 'Dallas' },
  { country: 'United States', region: 'California', city: 'Los Angeles' },
  { country: 'United States', region: 'Florida', city: 'Miami' },
  { country: 'United States', region: 'Illinois', city: 'Chicago' },
  { country: 'United States', region: 'New York', city: 'New York' },
  { country: 'United States', region: 'Arizona', city: 'Phoenix' },
  { country: 'Canada', region: 'Ontario', city: 'Toronto' },
  { country: 'United Kingdom', region: 'England', city: 'London' },
  { country: 'Australia', region: 'New South Wales', city: 'Sydney' },
  { country: 'Germany', region: 'Bavaria', city: 'Munich' },
];

const DEVICES: DeviceType[] = ['desktop', 'mobile', 'tablet'];
const DEVICE_WEIGHTS = [0.45, 0.45, 0.10];

const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
const OS_LIST = ['Windows 11', 'macOS Sonoma', 'iOS 17', 'Android 14', 'Linux'];

const SOURCES: TrafficSource[] = ['facebook', 'google', 'email', 'direct', 'qr_code', 'referral', 'linkedin', 'instagram', 'twitter', 'organic'];

const LANDING_PAGES = [
  '/webinar',
  '/checklist',
  '/demo',
  '/services',
  '/about',
  '/contact',
  '/pricing',
  '/book-appointment',
  '/download-guide',
  '/home',
];

const CAMPAIGN_NAMES = [
  'AADOM 2026',
  'Penny Reed Checklist',
  'Summer Webinar 2026',
  'Practice Growth Campaign',
  'Dental Leadership Summit',
  'Holiday Special Offer',
  'New Patient Drive',
  'Teeth Whitening Promo',
];

const CAMPAIGN_SOURCES = ['facebook', 'google', 'email', 'qr_code', 'linkedin', 'direct'];
const CAMPAIGN_MEDIUMS = ['social', 'cpc', 'email', 'print', 'referral', 'display'];

const LINK_NAMES = [
  'AADOM Booth Link',
  'Penny Reed Download',
  'Summer Webinar Registration',
  'Growth Ebook Landing',
  'Leadership Summit Info',
  'Holiday Promo Page',
  'New Patient Signup',
  'Whitening Special',
  'Demo Request Form',
  'Appointment Booking',
  'Contact Page',
  'Services Overview',
  'About Practice',
  'Pricing Page',
  'Free Consultation',
  'Newsletter Signup',
  'Patient Portal',
  'Reviews Page',
  'Team Page',
  'FAQ Page',
  'Blog Post - Hygiene',
  'Blog Post - Implants',
  'Blog Post - Ortho',
  'Event Registration',
  'Resource Library',
];

const QR_NAMES = [
  'AADOM Booth QR',
  'Penny Reed Flyer QR',
  'Webinar Poster QR',
  'Growth Brochure QR',
  'Summit Banner QR',
  'Holiday Card QR',
  'New Patient Mailer QR',
  'Whitening Poster QR',
  'Clinic Front Desk QR',
  'Waiting Room QR',
  'Business Card QR',
  'Conference Lanyard QR',
  'Magazine Ad QR',
  'Direct Mail QR',
  'Window Display QR',
];

const WEBSITE_NAMES = [
  { name: 'Practice Profit Labs', domain: 'practiceprofitlabs.com' },
  { name: 'Smile Dental', domain: 'smiledental.com' },
  { name: 'Bright Smile Clinic', domain: 'brightsmileclinic.com' },
  { name: 'Dental Care Plus', domain: 'dentalcareplus.com' },
  { name: 'Premier Dentistry', domain: 'premierdentistry.com' },
  { name: 'Family Dental Group', domain: 'familydentalgroup.com' },
  { name: 'Modern Orthodontics', domain: 'modernortho.com' },
  { name: 'Pediatric Dental', domain: 'pediatricdental.com' },
  { name: 'Oral Surgery Center', domain: 'oralsurgerycenter.com' },
  { name: 'Cosmetic Dentistry', domain: 'cosmeticdentistry.com' },
];

const LEAD_NAMES = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Jessica Martinez', 'Robert Taylor', 'Lisa Anderson', 'James Thomas', 'Maria Garcia',
  'Christopher Lee', 'Patricia White', 'Daniel Harris', 'Susan Clark', 'Kevin Lewis',
  'Nancy Robinson', 'Brian Walker', 'Karen Hall', 'Mark Young', 'Linda King',
  'Steven Wright', 'Betty Lopez', 'Ronald Hill', 'Donna Scott', 'Edward Green',
  'Carol Adams', 'Paul Baker', 'Sharon Nelson', 'Larry Carter', 'Sandra Mitchell',
  'Ralph Perez', 'Ashley Roberts', 'Joe Turner', 'Kimberly Phillips', 'Dennis Campbell',
  'Amy Parker', 'Jerry Evans', 'Donna Edwards', 'Tyler Collins', 'Melissa Stewart',
];

const PRACTICES = [
  'Smile Dental', 'Bright Smile Clinic', 'Dental Care Plus', 'Premier Dentistry',
  'Family Dental Group', 'Modern Orthodontics', 'Pediatric Dental', 'Oral Surgery Center',
  'Cosmetic Dentistry', 'Riverside Dental', 'Sunset Dental Care', 'Gentle Touch Dental',
];

const FORM_NAMES = [
  'Penny Reed Checklist', 'Webinar Registration', 'Demo Request', 'Appointment Booking',
  'Contact Form', 'Newsletter Signup', 'Free Consultation', 'Download Guide',
];

const EVENT_TYPES: EventType[] = [
  'page_view', 'session_start', 'session_end', 'cta_click', 'button_click',
  'outbound_link_click', 'form_start', 'form_submit', 'file_download',
  'phone_click', 'email_click', 'whatsapp_click', 'video_play', 'video_progress',
  'video_completion', 'scroll_depth', 'conversion',
];

function weightedPick<T>(items: T[], weights?: number[]): T {
  if (!weights) return items[Math.floor(Math.random() * items.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function randomDateInRange(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
}

function makeAlias(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generateMockData(): AppData {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Campaigns
  const campaigns: Campaign[] = CAMPAIGN_NAMES.map((name, i) => {
    const startDate = new Date(now.getTime() - (60 - i * 5) * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + (30 + i * 5) * 24 * 60 * 60 * 1000);
    const status = i < 5 ? 'active' : i < 7 ? 'paused' : 'draft';
    return {
      id: uid('camp'),
      name,
      description: `${name} campaign for Practice Profit Labs — driving engagement and conversions through targeted marketing channels.`,
      status: status as Campaign['status'],
      source: CAMPAIGN_SOURCES[i % CAMPAIGN_SOURCES.length],
      medium: CAMPAIGN_MEDIUMS[i % CAMPAIGN_MEDIUMS.length],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: startDate.toISOString(),
      linkIds: [],
      qrIds: [],
    };
  });

  // Links
  const links: Link[] = LINK_NAMES.map((name, i) => {
    const campaign = campaigns[i % campaigns.length];
    const alias = makeAlias(name);
    const status: Link['status'] = i % 7 === 0 ? 'expired' : i % 5 === 0 ? 'inactive' : 'active';
    const created = randomDateInRange(ninetyDaysAgo, now);
    return {
      id: uid('link'),
      name,
      shortUrl: `linkiq.app/go/${alias}`,
      alias,
      destinationUrl: `https://practiceprofitlabs.com${LANDING_PAGES[i % LANDING_PAGES.length]}`,
      campaignId: campaign.id,
      utmSource: campaign.source,
      utmMedium: campaign.medium,
      utmCampaign: campaign.name.replace(/\s+/g, ''),
      utmTerm: i % 3 === 0 ? 'dental-marketing' : '',
      utmContent: i % 2 === 0 ? `variant-${i}` : '',
      clicks: Math.floor(Math.random() * 500) + 20,
      uniqueVisitors: Math.floor(Math.random() * 300) + 10,
      conversions: Math.floor(Math.random() * 40) + 1,
      status,
      expirationDate: i % 7 === 0 ? randomDateInRange(ninetyDaysAgo, now) : null,
      createdAt: created,
    };
  });

  // Assign links to campaigns
  links.forEach(link => {
    if (link.campaignId) {
      const camp = campaigns.find(c => c.id === link.campaignId);
      if (camp) camp.linkIds.push(link.id);
    }
  });

  // QR Codes
  const qrCodes: QRCode[] = QR_NAMES.map((name, i) => {
    const campaign = campaigns[i % campaigns.length];
    const link = links[i % links.length];
    return {
      id: uid('qr'),
      name,
      campaignId: campaign.id,
      linkId: link.id,
      destinationUrl: link.destinationUrl,
      scans: Math.floor(Math.random() * 300) + 10,
      uniqueScans: Math.floor(Math.random() * 200) + 5,
      conversions: Math.floor(Math.random() * 25) + 1,
      status: i % 6 === 0 ? 'inactive' : 'active',
      style: {
        fgColor: i % 3 === 0 ? '#0d9488' : '#0f172a',
        bgColor: '#ffffff',
        size: 256,
      },
      createdAt: randomDateInRange(ninetyDaysAgo, now),
    };
  });

  qrCodes.forEach(qr => {
    if (qr.campaignId) {
      const camp = campaigns.find(c => c.id === qr.campaignId);
      if (camp) camp.qrIds.push(qr.id);
    }
  });

  // Websites
  const websites: Website[] = WEBSITE_NAMES.map((w, i) => ({
    id: uid('web'),
    name: w.name,
    domain: w.domain,
    trackingId: `IQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: i % 8 === 0 ? 'inactive' : 'active',
    events: Math.floor(Math.random() * 5000) + 500,
    visitors: Math.floor(Math.random() * 2000) + 200,
    sessions: Math.floor(Math.random() * 3000) + 300,
    lastActivity: randomDate(1),
    createdAt: randomDate(90),
  }));

  // Visitors
  const VISITOR_COUNT = 120;
  const visitors: Visitor[] = [];
  for (let i = 0; i < VISITOR_COUNT; i++) {
    const loc = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const device = weightedPick(DEVICES, DEVICE_WEIGHTS);
    const source = weightedPick(SOURCES);
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const firstSeen = randomDateInRange(ninetyDaysAgo, now);
    const lastSeen = new Date(Math.min(now.getTime(), new Date(firstSeen).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
    visitors.push({
      id: uid('vis'),
      visitorId: `v_${Math.random().toString(36).substring(2, 12)}`,
      firstSeen,
      lastSeen,
      sessions: Math.floor(Math.random() * 5) + 1,
      pages: Math.floor(Math.random() * 20) + 1,
      source,
      campaignId: Math.random() > 0.3 ? campaign.id : null,
      device,
      country: loc.country,
      region: loc.region,
      city: loc.city,
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      os: OS_LIST[Math.floor(Math.random() * OS_LIST.length)],
      hasConverted: Math.random() > 0.75,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
    });
  }

  // Sessions
  const SESSION_COUNT = 160;
  const sessions: Session[] = [];
  for (let i = 0; i < SESSION_COUNT; i++) {
    const visitor = visitors[Math.floor(Math.random() * visitors.length)];
    const start = new Date(visitor.firstSeen);
    start.setTime(start.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    if (start > now) start.setTime(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 600) + 30;
    const end = new Date(start.getTime() + duration * 1000);
    const landingPage = LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)];
    const exitPage = LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)];
    const source = visitor.source;
    sessions.push({
      id: uid('ses'),
      sessionId: `s_${Math.random().toString(36).substring(2, 12)}`,
      visitorId: visitor.id,
      start: start.toISOString(),
      end: end.toISOString(),
      duration,
      landingPage,
      exitPage,
      pages: Math.floor(Math.random() * 10) + 1,
      source,
      campaignId: visitor.campaignId,
      device: visitor.device,
      country: visitor.country,
      events: Math.floor(Math.random() * 15) + 2,
      hasConversion: Math.random() > 0.8,
    });
  }

  // Events
  const events: EventRecord[] = [];
  sessions.forEach(session => {
    const eventCount = session.events;
    const sessionStart = new Date(session.start);
    for (let i = 0; i < eventCount; i++) {
      const eventType = i === 0 ? 'session_start' : i === eventCount - 1 ? 'session_end' : weightedPick(EVENT_TYPES.filter(t => t !== 'session_start' && t !== 'session_end'));
      const timestamp = new Date(sessionStart.getTime() + (i / eventCount) * session.duration * 1000).toISOString();
      const page = i === 0 ? session.landingPage : LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)];
      events.push({
        id: uid('evt'),
        type: eventType,
        visitorId: session.visitorId,
        sessionId: session.id,
        campaignId: session.campaignId,
        linkId: links[Math.floor(Math.random() * links.length)].id,
        qrId: Math.random() > 0.7 ? qrCodes[Math.floor(Math.random() * qrCodes.length)].id : null,
        websiteId: websites[Math.floor(Math.random() * websites.length)].id,
        page,
        source: session.source,
        device: session.device,
        country: session.country,
        timestamp,
        metadata: eventType === 'scroll_depth' ? { depth: Math.floor(Math.random() * 100) } : {},
      });
    }
  });

  // Sort events by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Conversion Definitions
  const conversionDefinitions: ConversionDefinition[] = [
    { id: uid('cd'), name: 'Form Submission', eventType: 'form_submit', description: 'Any form submission from landing pages', value: 50, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Appointment Booking', eventType: 'button_click', description: 'Appointment booking button clicked', value: 200, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Webinar Registration', eventType: 'form_submit', description: 'Registration for webinar events', value: 75, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Demo Request', eventType: 'form_submit', description: 'Request for product demo', value: 150, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Phone Call', eventType: 'phone_click', description: 'Click-to-call from website', value: 100, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Email Click', eventType: 'email_click', description: 'Email link clicked', value: 25, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'WhatsApp Click', eventType: 'whatsapp_click', description: 'WhatsApp contact initiated', value: 30, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Download', eventType: 'file_download', description: 'Resource file downloaded', value: 15, status: 'active', createdAt: randomDate(90) },
    { id: uid('cd'), name: 'Lead Creation', eventType: 'custom_event', description: 'Manual lead creation event', value: 100, status: 'active', createdAt: randomDate(90) },
  ];

  // Conversions
  const conversions: Conversion[] = [];
  const CONVERSION_COUNT = 35;
  for (let i = 0; i < CONVERSION_COUNT; i++) {
    const def = conversionDefinitions[Math.floor(Math.random() * conversionDefinitions.length)];
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    conversions.push({
      id: uid('conv'),
      definitionId: def.id,
      visitorId: session.visitorId,
      sessionId: session.id,
      campaignId: session.campaignId,
      linkId: events.find(e => e.sessionId === session.id)?.linkId || null,
      qrId: events.find(e => e.sessionId === session.id)?.qrId || null,
      value: def.value,
      timestamp: randomDateInRange(new Date(session.start), new Date(session.end)),
    });
  }

  // Leads
  const leads: Lead[] = LEAD_NAMES.slice(0, 40).map((name, i) => {
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const source = weightedPick(SOURCES);
    const practice = PRACTICES[Math.floor(Math.random() * PRACTICES.length)];
    const formName = FORM_NAMES[Math.floor(Math.random() * FORM_NAMES.length)];
    const status: Lead['status'] = i % 5 === 0 ? 'qualified' : i % 4 === 0 ? 'contacted' : i % 6 === 0 ? 'converted' : 'new';
    return {
      id: uid('lead'),
      formName,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1 555 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
      practice,
      website: `${practice.toLowerCase().replace(/\s+/g, '')}.com`,
      campaignId: campaign.id,
      source,
      landingPage: LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)],
      submittedAt: randomDate(60),
      status,
      visitorId: visitors[Math.floor(Math.random() * visitors.length)].id,
      sessionId: sessions[Math.floor(Math.random() * sessions.length)].id,
    };
  });

  // Funnels
  const funnels: Funnel[] = [
    {
      id: uid('funnel'),
      name: 'Default Funnel',
      stages: [
        { id: uid('fs'), name: 'Link Click', eventType: 'cta_click' },
        { id: uid('fs'), name: 'Landing Page Visitor', eventType: 'page_view' },
        { id: uid('fs'), name: 'Engaged Visitor', eventType: 'scroll_depth' },
        { id: uid('fs'), name: 'CTA Click', eventType: 'cta_click' },
        { id: uid('fs'), name: 'Form Start', eventType: 'form_start' },
        { id: uid('fs'), name: 'Form Submit', eventType: 'form_submit' },
        { id: uid('fs'), name: 'Appointment', eventType: 'button_click' },
        { id: uid('fs'), name: 'Customer', eventType: 'conversion' },
      ],
    },
  ];

  // UTM Templates
  const utmTemplates: UTMTemplate[] = [
    { id: uid('utm'), name: 'Facebook Social', source: 'facebook', medium: 'social', campaign: 'AADOM2026', term: '', content: 'booth-qr' },
    { id: uid('utm'), name: 'Google CPC', source: 'google', medium: 'cpc', campaign: 'PracticeGrowth', term: 'dental-marketing', content: '' },
    { id: uid('utm'), name: 'Email Newsletter', source: 'email', medium: 'email', campaign: 'SummerWebinar', term: '', content: 'header-link' },
    { id: uid('utm'), name: 'LinkedIn Ads', source: 'linkedin', medium: 'social', campaign: 'LeadershipSummit', term: '', content: 'sponsored' },
  ];

  return {
    organization: { id: uid('org'), name: 'Practice Profit Labs', plan: 'Growth' },
    user: {
      id: uid('user'),
      name: 'Alex Morgan',
      email: 'admin@practiceprofitlabs.com',
      role: 'Administrator',
      avatar: 'AM',
    },
    campaigns,
    links,
    qrCodes,
    websites,
    visitors,
    sessions,
    events,
    conversions,
    conversionDefinitions,
    leads,
    funnels,
    utmTemplates,
    settings: {
      organization: { name: 'Practice Profit Labs', industry: 'Dental Marketing', timezone: 'America/Chicago' },
      profile: { name: 'Alex Morgan', email: 'admin@practiceprofitlabs.com', bio: 'Marketing director focused on dental practice growth.' },
      tracking: { anonymizeIp: true, respectDNT: true, sessionTimeout: 30 },
      dataRetention: { days: 365, autoDelete: false },
      users: [
        { id: uid('u'), name: 'Alex Morgan', email: 'admin@practiceprofitlabs.com', role: 'Administrator', status: 'active' },
        { id: uid('u'), name: 'Jamie Lee', email: 'jamie@practiceprofitlabs.com', role: 'Editor', status: 'active' },
        { id: uid('u'), name: 'Pat Rivera', email: 'pat@practiceprofitlabs.com', role: 'Viewer', status: 'active' },
        { id: uid('u'), name: 'Sam Chen', email: 'sam@practiceprofitlabs.com', role: 'Editor', status: 'invited' },
      ],
      auditLogs: [
        { id: uid('log'), action: 'Login', user: 'Alex Morgan', timestamp: randomDate(1), detail: 'Logged in from Dallas, TX' },
        { id: uid('log'), action: 'Campaign Created', user: 'Alex Morgan', timestamp: randomDate(3), detail: 'Created campaign "AADOM 2026"' },
        { id: uid('log'), action: 'Link Updated', user: 'Jamie Lee', timestamp: randomDate(5), detail: 'Updated destination for "AADOM Booth Link"' },
        { id: uid('log'), action: 'QR Code Deleted', user: 'Alex Morgan', timestamp: randomDate(7), detail: 'Deleted QR code "Old Flyer QR"' },
        { id: uid('log'), action: 'Report Exported', user: 'Pat Rivera', timestamp: randomDate(10), detail: 'Exported Conversion Report (CSV)' },
      ],
    },
  };
}
