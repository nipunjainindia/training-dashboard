import React, { useEffect, useState } from 'react';
import KpiCards from '../components/KpiCards';
import {
  StatusDonutChart, CategoryBarChart, EnrollmentTrendChart,
  BusinessUnitChart, ProviderPieChart, ScoreRadarChart,
} from '../components/Charts';
import TopTrainingsTable from '../components/TopTrainingsTable';
import Chatbot from '../components/Chatbot';
import {
  fetchKpis, fetchStatusBreakdown, fetchCategoryBreakdown,
  fetchBusinessUnitBreakdown, fetchEnrollmentTrend,
  fetchScoreByCategory, fetchProviderBreakdown, fetchTopTrainings,
} from '../services/api';
import { LayoutDashboard, MessageSquare, RefreshCw } from 'lucide-react';

type Tab = 'dashboard' | 'chatbot';

const Dashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, any>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [kpis, status, category, bu, trend, score, provider, top] = await Promise.all([
        fetchKpis(),
        fetchStatusBreakdown(),
        fetchCategoryBreakdown(),
        fetchBusinessUnitBreakdown(),
        fetchEnrollmentTrend(),
        fetchScoreByCategory(),
        fetchProviderBreakdown(),
        fetchTopTrainings(),
      ]);
      setData({ kpis, status, category, bu, trend, score, provider, top });
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
        background: '#0f172a', display: 'flex', flexDirection: 'column',
        padding: '24px 0', zIndex: 100,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            Training Hub
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Analytics Dashboard</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'chatbot' as Tab, label: 'AI Assistant', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                marginBottom: 4, fontSize: 13, fontWeight: 500,
                background: tab === id ? '#1e293b' : 'transparent',
                color: tab === id ? '#fff' : '#64748b',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#334155' }}>Last refresh</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
              {tab === 'dashboard' ? 'Training Analytics' : 'AI Data Assistant'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              {tab === 'dashboard'
                ? 'Overview of employee training metrics and performance'
                : 'Ask questions about your training data in plain English'}
            </p>
          </div>
          {tab === 'dashboard' && (
            <button
              onClick={load}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                cursor: 'pointer', fontSize: 13, color: '#475569',
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>

        {tab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <KpiCards data={data.kpis} loading={loading} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {!loading && data.status && <StatusDonutChart data={data.status} />}
              {!loading && data.category && <CategoryBarChart data={data.category} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {!loading && data.trend && <EnrollmentTrendChart data={data.trend} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {!loading && data.bu && <BusinessUnitChart data={data.bu} />}
              {!loading && data.provider && <ProviderPieChart data={data.provider} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {!loading && data.score && <ScoreRadarChart data={data.score} />}
              {!loading && data.top && <TopTrainingsTable data={data.top} />}
            </div>
          </div>
        )}

        {tab === 'chatbot' && (
          <div style={{ height: 'calc(100vh - 140px)' }}>
            <Chatbot />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
