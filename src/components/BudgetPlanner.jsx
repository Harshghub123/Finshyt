import { useState } from 'react';
import useProfile from '../store/useProfile';
import useExpenses from '../store/useExpenses';

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthStr) {
  return new Date(monthStr + '-02').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function changeMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetPlanner() {
  const { categories, monthlyBudgets, setBudget, getBudgetsForMonth, copyBudgetFromPrevMonth, currency } = useProfile();
  const { expenses } = useExpenses();
  const [viewMonth, setViewMonth] = useState(currentMonthStr);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const budgets = getBudgetsForMonth(viewMonth);
  const hasBudget = budgets.length > 0;

  // Actual spending per category for the viewed month
  const monthStart = new Date(viewMonth + '-01');
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const actualByCategory = {};
  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d >= monthStart && d <= monthEnd) {
      actualByCategory[e.category] = (actualByCategory[e.category] || 0) + Number(e.amount);
    }
  });

  // Rows: merge categories with budgets and actual
  const rows = categories.map((cat) => {
    const budget = budgets.find((b) => b.categoryId === cat.id);
    return {
      ...cat,
      planned: budget?.planned || 0,
      actual: actualByCategory[cat.id] || 0,
    };
  });

  const totalPlanned = rows.reduce((s, r) => s + r.planned, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);
  const isOverBudget = totalPlanned > 0 && totalActual > totalPlanned;

  // Start editing a row
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditVal(cat.planned > 0 ? String(cat.planned) : '');
  };

  const commitEdit = (catId) => {
    const val = Number(editVal);
    if (!isNaN(val) && val >= 0) {
      setBudget(viewMonth, catId, val);
    }
    setEditingId(null);
    setEditVal('');
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>📊 Monthly Budget Planner</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Plan and track spending by category.
      </p>

      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-ghost" onClick={() => setViewMonth((m) => changeMonth(m, -1))} style={{ fontSize: 20, padding: '6px 14px' }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{monthLabel(viewMonth)}</span>
        <button className="btn-ghost" onClick={() => setViewMonth((m) => changeMonth(m, 1))} style={{ fontSize: 20, padding: '6px 14px' }}>›</button>
      </div>

      {/* Total summary card */}
      <div className="card" style={{
        padding: '14px 18px', marginBottom: 16,
        background: !hasBudget ? 'var(--card)' : isOverBudget ? '#FEE2E2' : totalActual >= totalPlanned * 0.8 ? '#FEF9C3' : '#DCFCE7',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Budget</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>
              {currency}{totalActual.toLocaleString('en-IN')}
              {totalPlanned > 0 && (
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}> / {currency}{totalPlanned.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
          {totalPlanned > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 13, fontWeight: 800,
                color: isOverBudget ? '#DC2626' : totalActual >= totalPlanned * 0.8 ? '#92400E' : '#166534',
              }}>
                {isOverBudget ? '⚠️ Over budget' : `${Math.round((totalActual / totalPlanned) * 100)}% used`}
              </div>
            </div>
          )}
        </div>
        {totalPlanned > 0 && (
          <div style={{ height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden', marginTop: 10 }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (totalActual / totalPlanned) * 100)}%`,
              background: isOverBudget ? '#EF4444' : totalActual >= totalPlanned * 0.8 ? '#F59E0B' : '#22C55E',
              borderRadius: 99, transition: 'width 0.6s ease',
            }} />
          </div>
        )}
      </div>

      {/* Empty state: no budget yet */}
      {!hasBudget && (
        <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💸</div>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>No budget set for this month</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Tap on any category below to set a planned budget, or copy from a previous month.
          </p>
          <button
            className="btn-secondary"
            onClick={() => copyBudgetFromPrevMonth(viewMonth)}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          >
            📋 Copy from last month
          </button>
        </div>
      )}

      {/* Tip when has budget */}
      {hasBudget && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
          Tap any planned amount to edit
        </div>
      )}

      {/* Category rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row) => {
          const pct = row.planned > 0 ? Math.min(100, (row.actual / row.planned) * 100) : 0;
          const isOver = row.planned > 0 && row.actual > row.planned;
          const isEditing = editingId === row.id;

          return (
            <div key={row.id} className="card fade-in" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: row.planned > 0 ? 8 : 0 }}>
                {/* Left: icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: row.color + '33',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {row.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Spent: {currency}{row.actual.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Right: planned amount (editable) */}
                <div style={{ textAlign: 'right' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)' }}>{currency}</span>
                      <input
                        type="number"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onBlur={() => commitEdit(row.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(row.id); if (e.key === 'Escape') { setEditingId(null); setEditVal(''); } }}
                        autoFocus
                        style={{
                          width: 80, padding: '4px 8px', borderRadius: 8, border: '2px solid var(--brand)',
                          fontSize: 14, fontWeight: 800, textAlign: 'right', outline: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(row)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right',
                        padding: '4px 0',
                      }}
                    >
                      {row.planned > 0 ? (
                        <div style={{
                          fontSize: 14, fontWeight: 800,
                          color: isOver ? '#DC2626' : 'var(--text-primary)',
                        }}>
                          {currency}{row.planned.toLocaleString('en-IN')}
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>planned</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', background: '#F0FDF4', padding: '4px 10px', borderRadius: 99 }}>
                          + Set budget
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar (only if budget set) */}
              {row.planned > 0 && (
                <div style={{ height: 5, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: isOver ? '#EF4444' : pct >= 80 ? '#F59E0B' : row.color,
                    borderRadius: 99, transition: 'width 0.5s ease',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copy from last month (when has budget, as a secondary option) */}
      {hasBudget && (
        <button
          className="btn-ghost"
          onClick={() => copyBudgetFromPrevMonth(viewMonth)}
          style={{ width: '100%', justifyContent: 'center', marginTop: 16, fontSize: 13 }}
        >
          📋 Overwrite with last month's budget
        </button>
      )}
    </div>
  );
}
