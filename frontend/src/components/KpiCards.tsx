import React from 'react';
import { Users, CheckCircle, AlertCircle, Clock, TrendingUp, Star, BookOpen } from 'lucide-react';

interface KpiData {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  notStarted: number;
  completionRate: string;
  avgAssessmentScore: string;
  totalTrainingHours: string;
}

const cards = (d: KpiData) => [
  { label: 'Total Enrollments', value: d.total.toLocaleString(), icon: Users, color: '#6366f1', bg: '#eef2ff' },
  { label: 'Completion Rate', value: `${d.completionRate}%`, icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
  { label: 'Completed', value: d.completed.toLocaleString(), icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
  { label: 'In Progress', value: d.inProgress.toLocaleString(), icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Not Started', value: d.notStarted.toLocaleString(), icon: BookOpen, color: '#64748b', bg: '#f8fafc' },
  { label: 'Overdue', value: d.overdue.toLocaleString(), icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Avg. Score', value: `${d.avgAssessmentScore}%`, icon: Star, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Total Hours', value: `${parseFloat(d.totalTrainingHours).toLocaleString()}h`, icon: Clock, color: '#0ea5e9', bg: '#f0f9ff' },
];

const KpiCards: React.FC<{ data: KpiData | null; loading: boolean }> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: '#f1f5f9', borderRadius: 12, height: 100, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {cards(data).map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ background: c.bg, borderRadius: 10, padding: 10 }}>
              <Icon size={22} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
