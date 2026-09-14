import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout, type PageKey } from '@/components/layout/Layout';
import { ToastContainer } from '@/components/ui/Feedback';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { LinksPage } from '@/pages/LinksPage';
import { QRCodesPage } from '@/pages/QRCodesPage';
import { UTMBuilderPage } from '@/pages/UTMBuilderPage';
import { WebsitesPage } from '@/pages/WebsitesPage';
import { VisitorsPage } from '@/pages/VisitorsPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { EventsPage } from '@/pages/EventsPage';
import { ConversionsPage } from '@/pages/ConversionsPage';
import { FormsLeadsPage } from '@/pages/FormsLeadsPage';
import { FunnelsPage } from '@/pages/FunnelsPage';
import { AttributionPage } from '@/pages/AttributionPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { DemoModePage } from '@/pages/DemoModePage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppContent() {
  const { isAuthenticated } = useApp();
  const [currentPage, setCurrentPage] = useState<PageKey>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [quickAction, setQuickAction] = useState<string | null>(null);

  // Handle quick actions by navigating to the right page and triggering the create flow
  useEffect(() => {
    if (!quickAction) return;
    switch (quickAction) {
      case 'campaign': setCurrentPage('campaigns'); break;
      case 'link': setCurrentPage('links'); break;
      case 'qr': setCurrentPage('qrcodes'); break;
      case 'utm': setCurrentPage('utmbuilder'); break;
      case 'website': setCurrentPage('websites'); break;
      case 'conversion': setCurrentPage('conversions'); break;
      case 'lead': setCurrentPage('forms'); break;
    }
    setQuickAction(null);
  }, [quickAction]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <DashboardPage dateRange={dateRange} onNavigate={(p) => setCurrentPage(p as PageKey)} />;
      case 'campaigns': return <CampaignsPage dateRange={dateRange} />;
      case 'links': return <LinksPage />;
      case 'qrcodes': return <QRCodesPage />;
      case 'utmbuilder': return <UTMBuilderPage />;
      case 'websites': return <WebsitesPage />;
      case 'visitors': return <VisitorsPage dateRange={dateRange} />;
      case 'sessions': return <SessionsPage />;
      case 'events': return <EventsPage />;
      case 'conversions': return <ConversionsPage dateRange={dateRange} />;
      case 'forms': return <FormsLeadsPage />;
      case 'funnels': return <FunnelsPage dateRange={dateRange} />;
      case 'attribution': return <AttributionPage />;
      case 'reports': return <ReportsPage dateRange={dateRange} />;
      case 'demo': return <DemoModePage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage dateRange={dateRange} onNavigate={(p) => setCurrentPage(p as PageKey)} />;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onQuickAction={setQuickAction}
      >
        {renderPage()}
      </Layout>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
