import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Database, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { sendChatQuery } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sqlQuery?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  rowCount?: number;
  error?: boolean;
}

const SUGGESTED = [
  'Show me overdue mandatory trainings by business unit',
  'Which training category has the highest average assessment score?',
  'List top 10 employees with lowest scores',
  'Count of trainings by country and status',
  'Show monthly completion trend for Compliance trainings',
];

const downloadCsv = (columns: string[], rows: Record<string, any>[]) => {
  const header = columns.join(',');
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
      // Wrap in quotes if value contains comma, quote, or newline
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  ).join('\n');

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `training-query-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ResultTable: React.FC<{ columns: string[]; rows: Record<string, any>[]; rowCount: number }> = ({
  columns, rows, rowCount,
}) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: '#64748b' }}>{rowCount} row{rowCount !== 1 ? 's' : ''} returned</div>
      <button
        onClick={() => downloadCsv(columns, rows)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
          background: '#f8fafc', cursor: 'pointer', fontSize: 11, color: '#475569',
        }}
      >
        <Download size={12} />
        Download CSV
      </button>
    </div>
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map((col) => (
              <th key={col} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {columns.map((col) => (
                <td key={col} style={{ padding: '7px 12px', color: '#334155' }}>
                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <div style={{ padding: '8px 12px', fontSize: 11, color: '#64748b', background: '#f8fafc' }}>
          Showing first 50 of {rowCount} rows
        </div>
      )}
    </div>
  </div>
);

const SqlBlock: React.FC<{ sql: string }> = ({ sql }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#6366f1', padding: 0 }}
      >
        <Database size={12} />
        {open ? 'Hide' : 'Show'} SQL {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <pre style={{ marginTop: 6, padding: '10px 12px', background: '#1e293b', color: '#94a3b8', borderRadius: 8, fontSize: 11, overflow: 'auto', lineHeight: 1.6 }}>
          {sql}
        </pre>
      )}
    </div>
  );
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I can answer questions about your training data. Ask me anything or try a suggestion below.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChatQuery(prompt);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `Found ${result.rowCount} result${result.rowCount !== 1 ? 's' : ''}.`,
        sqlQuery: result.sqlQuery,
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount,
      };
      setMessages((m) => [...m, reply]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: err?.response?.data?.message || 'Something went wrong. Please rephrase your question.',
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#eef2ff', borderRadius: 8, padding: 6 }}>
          <Bot size={18} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>AI Data Assistant</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Powered by GPT-4o · Ask questions about your training data</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
            }}>
              {msg.role === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} color="#6366f1" />}
            </div>
            <div style={{ maxWidth: '80%' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                background: msg.role === 'user' ? '#6366f1' : msg.error ? '#fef2f2' : '#f8fafc',
                color: msg.role === 'user' ? '#fff' : msg.error ? '#ef4444' : '#334155',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
              {msg.sqlQuery && <SqlBlock sql={msg.sqlQuery} />}
              {msg.columns && msg.rows && (
                <ResultTable columns={msg.columns} rows={msg.rows} rowCount={msg.rowCount!} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="#6366f1" />
            </div>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '4px 12px 12px 12px', display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Generating query…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                padding: '5px 10px', borderRadius: 20, border: '1px solid #e2e8f0',
                background: '#f8fafc', cursor: 'pointer', fontSize: 11, color: '#475569',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask a question about your training data…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            fontSize: 13, outline: 'none', color: '#0f172a',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 14px', borderRadius: 8, border: 'none',
            background: loading || !input.trim() ? '#e2e8f0' : '#6366f1',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Send size={16} color={loading || !input.trim() ? '#94a3b8' : '#fff'} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
