import React from 'react';

interface TopTraining {
  name: string;
  category: string;
  enrollments: number;
  completed: number;
  avgScore: string;
}

const TopTrainingsTable: React.FC<{ data: TopTraining[] }> = ({ data }) => {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', gridColumn: 'span 3',
    }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Top 10 Trainings by Enrollment
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              {['#', 'Training Name', 'Category', 'Enrollments', 'Completed', 'Completion %', 'Avg Score'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const pct = row.enrollments > 0 ? ((row.completed / row.enrollments) * 100).toFixed(0) : '0';
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                      {row.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 600 }}>{row.enrollments.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 600 }}>{row.completed.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: +pct >= 70 ? '#10b981' : +pct >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 30 }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#8b5cf6', fontWeight: 600 }}>
                    {row.avgScore !== 'N/A' ? `${row.avgScore}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopTrainingsTable;
