import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#f97316'];
const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  'In Progress': '#f59e0b',
  'Not Started': '#64748b',
  Overdue: '#ef4444',
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode; span?: number }> = ({
  title, children, span = 1,
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      gridColumn: `span ${span}`,
    }}
  >
    <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {title}
    </h3>
    {children}
  </div>
);

export const StatusDonutChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Training Status Distribution">
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[0]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const CategoryBarChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Trainings by Category" span={2}>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const EnrollmentTrendChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Monthly Enrollment & Completion Trend" span={3}>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="completions" name="Completions" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const BusinessUnitChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Business Unit Breakdown" span={2}>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="bu" type="category" tick={{ fontSize: 11 }} width={80} />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="a" />
        <Bar dataKey="overdue" name="Overdue" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const ProviderPieChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Training Provider Distribution">
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const ScoreRadarChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartCard title="Avg. Score by Category">
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#f1f5f9" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
        <Radar name="Avg Score" dataKey="avgScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  </ChartCard>
);
