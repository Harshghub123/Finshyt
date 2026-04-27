import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';

const CAT_META = {
  food: { icon: '🍱', label: 'Food', color: '#FDBA74' },
  transport: { icon: '🚌', label: 'Transport', color: '#7DD3FC' },
  rent: { icon: '🏠', label: 'Rent & Bills', color: '#C4B5FD' },
  subscriptions: { icon: '📱', label: 'Subscriptions', color: '#FCA5A5' },
  shopping: { icon: '🛍️', label: 'Shopping', color: '#FDE047' },
  entertainment: { icon: '🎮', label: 'Entertainment', color: '#86EFAC' },
  health: { icon: '💊', label: 'Health', color: '#F9A8D4' },
  lifestyle: { icon: '✨', label: 'Lifestyle', color: '#86EFAC' },
  other: { icon: '📦', label: 'Other', color: '#E5E7EB' },
};

function HealthScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Strong 💪' : score >= 40 ? 'Decent 🤔' : 'Weak 😬';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={130} height={130}>
        <circle cx={65} cy={65} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={10} />
        <circle cx={65} cy={65} r={radius} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x={65} y={58} textAnchor="middle" fontSize={32} fontWeight={900} fill="var(--text-primary)">{score}</text>
        <text x={65} y={78} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontWeight={700}>/100</text>
      </svg>
      <span style={{ fontSize: 14, fontWeight: 800, color, marginTop: 4 }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, bg, color }) {
  return (
    <div className="card" style={{ padding: 18, background: bg || 'var(--card)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: color || 'var(--text-primary)', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Month-end banner
function MonthEndBanner({ setActiveTab }) {
  const day = new Date().getDate();
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  if (lastDay - day > 3) return null;
  return (
    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 700 }}>📅 Month ending soon — see your budget report</span>
      <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setActiveTab?.('profile')}>View →</button>
    </div>
  );
}

export default function Dashboard({ setActiveTab }) {
  const { monthlyIncome, currency, name, avatar } = useProfile();
  const expenses = useExpenses();

  const todayTotal = expenses.getTodayTotal();
  const weekTotal = expenses.getWeekTotal();
  const monthTotal = expenses.getMonthTotal();
  const savingsRate = expenses.getSavingsRate(monthlyIncome);
  const burnRate = expenses.getBurnRate();
  const healthScore = expenses.getHealthScore(monthlyIncome);
  const breakdown = expenses.getCategoryBreakdown('month');
  const dailyTrend = expenses.getDailyTrend(14);
  const leaks = expenses.getInvisibleLeaks();
  const savings = monthlyIncome - monthTotal;
  const emergencyMonths = expenses.getEmergencyFundMonths(monthlyIncome);
  const totalExpenses = expenses.expenses.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', padding: '8px 14px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 700 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</div>
        <div>{currency}{payload[0].value.toLocaleString('en-IN')}</div>
      </div>
    );
  };

  // Empty state — 0 expenses
  if (totalExpenses === 0) {
    const unlockAt = 5;
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="slide-up" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Hi {name} {avatar}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>Let's get your financial health score unlocked!</p>
        </div>

        {/* Skeleton health score */}
        <div className="card slide-up" style={{ padding: 32, marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ filter: 'blur(6px)', opacity: 0.4, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
            <HealthScoreRing score={72} />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>🔒 Log 5 expenses to unlock your health score</div>
            <div style={{ width: 200, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '0%', background: 'var(--brand)', borderRadius: 99, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>0 / {unlockAt} expenses logged</div>
          </div>
        </div>

        <div className="card slide-up" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Nothing tracked yet. Your streak starts today.</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Log your first expense to see your spending insights come alive.</p>
          <button className="btn-primary" onClick={() => setActiveTab?.('track')} style={{ padding: '14px 32px', fontSize: 15 }}>
            + Log my first expense
          </button>
        </div>
      </div>
    );
  }

  const unlockAt = 5;
  const unlockProgress = Math.min(totalExpenses, unlockAt);
  const isUnlocked = totalExpenses >= unlockAt;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <MonthEndBanner setActiveTab={setActiveTab} />

      {/* Greeting */}
      <div className="slide-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Hi {name} {avatar}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
          {savingsRate >= 30 ? "You're crushing it! Keep going 🔥" :
           savingsRate >= 15 ? "Decent progress. Let's level up 📈" :
           "Let's work on that savings rate 💪"}
        </p>
      </div>

      {/* Health Score & Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card slide-up" style={{ padding: 24, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden' }}>
          {!isUnlocked && (
            <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>🔒 Log {unlockAt} expenses to unlock your health score</div>
              <div style={{ width: 200, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(unlockProgress / unlockAt) * 100}%`, background: 'var(--brand)', borderRadius: 99, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unlockProgress} / {unlockAt} expenses logged</div>
            </div>
          )}
          <HealthScoreRing score={healthScore} />
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>SAVINGS RATE</span>
              <div style={{ fontSize: 24, fontWeight: 900, color: savingsRate >= 20 ? '#22C55E' : savingsRate >= 10 ? '#F59E0B' : '#EF4444' }}>
                {savingsRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>SURVIVAL</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{emergencyMonths} mo</div>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>STREAK</span>
              <div style={{ fontSize: 24, fontWeight: 900 }}>🔥 {expenses.streak}d</div>
            </div>
          </div>
        </div>

        <StatCard label="This Month" value={`${currency}${monthTotal.toLocaleString('en-IN')}`}
          sub={savings >= 0 ? `${currency}${savings.toLocaleString('en-IN')} saved` : 'Overspending!'}
          bg={savings >= 0 ? '#DCFCE7' : '#FEE2E2'} color={savings >= 0 ? '#166534' : '#991B1B'} />
        <StatCard label="Burn Rate" value={`${currency}${burnRate.toLocaleString('en-IN')}`} sub="/month avg" />
      </div>

      {/* Quick Stats */}
      <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: '#FFF0DB' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9A3412' }}>TODAY</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#9A3412' }}>{currency}{todayTotal.toLocaleString('en-IN')}</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: '#E0F2FE' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0C4A6E' }}>THIS WEEK</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0C4A6E' }}>{currency}{weekTotal.toLocaleString('en-IN')}</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center', background: '#EDE9FE' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#5B21B6' }}>DAILY AVG</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#5B21B6' }}>{currency}{Math.round(monthTotal / new Date().getDate()).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="card slide-up" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>📊 Daily Spending Trend</h3>
        {dailyTrend.every((d) => d.total === 0) ? (
          <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            <div style={{ width: '100%', height: 2, background: '#F3F4F6', marginBottom: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: -10, fontSize: 11, background: '#F3F4F6', padding: '2px 8px', borderRadius: 99 }}>Your spending trend will appear here</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyTrend} barCategoryGap="20%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {dailyTrend.map((_, i) => (
                  <Cell key={i} fill={i === dailyTrend.length - 1 ? 'var(--brand)' : '#E2E8F0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Breakdown */}
      {breakdown.length > 0 && (
        <div className="card slide-up" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>🏷️ Where your money goes</h3>
          {breakdown.map((item) => {
            const meta = CAT_META[item.category] || CAT_META.other;
            const pct = monthTotal > 0 ? (item.total / monthTotal) * 100 : 0;
            return (
              <div key={item.category} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{meta.icon} {meta.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>
                    {currency}{item.total.toLocaleString('en-IN')}
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', marginLeft: 6 }}>{pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invisible Leaks */}
      {leaks.length > 0 && (
        <div className="card slide-up" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🔍 Invisible Leaks</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Small recurring expenses you might not notice</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaks.slice(0, 5).map((leak, i) => (
              <div key={i} className="insight-card warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{leak.note}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{leak.count} times tracked</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#92400E' }}>~{currency}{leak.monthlyEstimate.toLocaleString('en-IN')}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
