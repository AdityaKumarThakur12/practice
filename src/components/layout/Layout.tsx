import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Megaphone, Link2, QrCode, Tag, Globe,
  Users, MonitorPlay, Zap, Target, FileText, Filter, BarChart3,
  Settings, ChevronLeft, ChevronRight, Menu, Search, Bell,
  HelpCircle, ChevronDown, Plus, LogOut, Building2, X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type PageKey =
  | 'overview' | 'campaigns' | 'links' | 'qrcodes' | 'utmbuilder' | 'websites'
  | 'visitors' | 'sessions' | 'events' | 'conversions' | 'forms' | 'funnels'
  | 'reports' | 'attribution' | 'settings' | 'demo';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, group: 'Dashboard' },
  { key: 'campaigns', label: 'Campaigns', icon: <Megaphone size={18} />, group: 'Assets' },
  { key: 'links', label: 'Links', icon: <Link2 size={18} />, group: 'Assets' },
  { key: 'qrcodes', label: 'QR Codes', icon: <QrCode size={18} />, group: 'Assets' },
  { key: 'utmbuilder', label: 'UTM Builder', icon: <Tag size={18} />, group: 'Assets' },
  { key: 'websites', label: 'Websites', icon: <Globe size={18} />, group: 'Assets' },
  { key: 'visitors', label: 'Visitors', icon: <Users size={18} />, group: 'Analytics' },
  { key: 'sessions', label: 'Sessions', icon: <MonitorPlay size={18} />, group: 'Analytics' },
  { key: 'events', label: 'Events', icon: <Zap size={18} />, group: 'Analytics' },
  { key: 'conversions', label: 'Conversions', icon: <Target size={18} />, group: 'Analytics' },
  { key: 'forms', label: 'Forms / Leads', icon: <FileText size={18} />, group: 'Analytics' },
  { key: 'funnels', label: 'Funnels', icon: <Filter size={18} />, group: 'Analytics' },
  { key: 'attribution', label: 'Attribution', icon: <BarChart3 size={18} />, group: 'Analytics' },
  { key: 'reports', label: 'Reports', icon: <BarChart3 size={18} />, group: 'Insights' },
  { key: 'demo', label: 'Demo Mode', icon: <Zap size={18} />, group: 'Insights' },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} />, group: 'Insights' },
];

interface LayoutProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
  dateRange: string;
  onDateRangeChange: (r: string) => void;
  onQuickAction: (type: string) => void;
}

export function Layout({ currentPage, onNavigate, children, dateRange, onDateRangeChange, onQuickAction }: LayoutProps) {
  const { data, logout } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const groups = [...new Set(NAV_ITEMS.map(n => n.group))];

  const quickActions = [
    { label: 'Campaign', type: 'campaign' },
    { label: 'Link', type: 'link' },
    { label: 'QR Code', type: 'qr' },
    { label: 'UTM URL', type: 'utm' },
    { label: 'Website', type: 'website' },
    { label: 'Conversion', type: 'conversion' },
    { label: 'Lead', type: 'lead' },
  ];

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0d9488' }}>
            <Link2 size={18} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm leading-tight">Link IQ</span>
              <span className="text-[10px] text-slate-400 leading-tight">Practice Profit Labs</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {groups.map(group => (
            <div key={group} className="mb-3">
              {!sidebarCollapsed && (
                <div className="px-4 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {group}
                </div>
              )}
              {NAV_ITEMS.filter(n => n.group === group).map(item => (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition ${
                    currentPage === item.key
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={currentPage === item.key ? { background: '#f0fdfa', color: '#0f766e' } : {}}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-100 text-slate-400 hover:bg-slate-50 transition"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <aside className="w-60 bg-white border-r border-slate-200 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0d9488' }}>
                  <Link2 size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm">Link IQ</span>
                  <span className="text-[10px] text-slate-400">Practice Profit Labs</span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {groups.map(group => (
                <div key={group} className="mb-3">
                  <div className="px-4 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {group}
                  </div>
                  {NAV_ITEMS.filter(n => n.group === group).map(item => (
                    <button
                      key={item.key}
                      onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition ${
                        currentPage === item.key ? 'text-teal-700 font-medium bg-teal-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      style={currentPage === item.key ? { background: '#f0fdfa', color: '#0f766e' } : {}}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu size={20} className="text-slate-600" />
            </button>
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns, links, visitors..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date range */}
            <select
              value={dateRange}
              onChange={e => onDateRangeChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
            >
              {dateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Quick actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="btn-primary text-sm"
                style={{ background: '#0d9488' }}
              >
                <Plus size={16} />
                Create
                <ChevronDown size={14} />
              </button>
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px] z-30 animate-scale-in">
                  {quickActions.map(a => (
                    <button
                      key={a.type}
                      onClick={() => { onQuickAction(a.type); setShowQuickActions(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Plus size={14} className="text-slate-400" />
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-2 min-w-[280px] z-30 animate-scale-in">
                  <div className="px-3 py-2 border-b border-slate-100 font-semibold text-sm text-slate-900">Notifications</div>
                  <div className="max-h-64 overflow-y-auto">
                    {data.leads.slice(0, 3).map(l => (
                      <div key={l.id} className="px-3 py-2 hover:bg-slate-50 border-b border-slate-50">
                        <p className="text-sm text-slate-700">New lead: {l.name}</p>
                        <p className="text-xs text-slate-400">{l.formName} • {l.practice}</p>
                      </div>
                    ))}
                    <div className="px-3 py-2 hover:bg-slate-50">
                      <p className="text-sm text-slate-700">Campaign "AADOM 2026" is performing well</p>
                      <p className="text-xs text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <HelpCircle size={20} />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold" style={{ background: '#0d9488' }}>
                  {data.user.avatar}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-700 leading-tight">{data.user.name}</span>
                  <span className="text-xs text-slate-400 leading-tight">{data.user.role}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[200px] z-30 animate-scale-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{data.user.name}</p>
                    <p className="text-xs text-slate-400">{data.user.email}</p>
                  </div>
                  <button onClick={() => { onNavigate('settings'); setShowProfile(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings size={14} /> Settings
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
