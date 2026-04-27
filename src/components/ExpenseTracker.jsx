import { useState } from 'react';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';
import useChallenges, { CHALLENGES } from '../store/useChallenges';
import ExpenseInput from './ExpenseInput';

const CAT_META = {
  food: { icon: '🍱', label: 'Food' },
  transport: { icon: '🚌', label: 'Transport' },
  rent: { icon: '🏠', label: 'Rent & Bills' },
  subscriptions: { icon: '📱', label: 'Subs' },
  shopping: { icon: '🛍️', label: 'Shopping' },
  entertainment: { icon: '🎮', label: 'Entertainment' },
  health: { icon: '💊', label: 'Health' },
  lifestyle: { icon: '✨', label: 'Lifestyle' },
  other: { icon: '📦', label: 'Other' },
};

// Which categories conflict with which challenges
const CHALLENGE_CONFLICTS = {
  no_spend_weekend: ['shopping', 'lifestyle', 'entertainment'],
  cook_week: ['food'],
  under_500_day: [],
  no_impulse: ['shopping', 'lifestyle'],
};

function ActiveChallengeBanner({ activeChallenges }) {
  if (!activeChallenges.length) return null;
  const active = activeChallenges[0];
  const challenge = CHALLENGES.find((c) => c.id === active.challengeId);
  if (!challenge) return null;

  const start = new Date(active.startDate);
  const elapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  const remaining = Math.max(0, challenge.duration - elapsed);

  return (
    <div style={{
      background: '#FAEEDA', borderLeft: '3px solid #EF9F27', borderRadius: 8,
      padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🏆</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{challenge.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{remaining} day{remaining !== 1 ? 's' : ''} left · +{challenge.xp} XP</div>
        </div>
      </div>
      <span className="tag tag-lemon" style={{ fontSize: 11 }}>Active</span>
    </div>
  );
}

function ConflictWarning({ category, challengeName, onLog, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ maxWidth: 360, width: '100%', padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👀</div>
        <h3 style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Heads up!</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          Logging <strong>{category}</strong> might count against your <strong>{challengeName}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn-primary" onClick={onLog} style={{ flex: 1, justifyContent: 'center', background: '#EF4444', boxShadow: 'none' }}>Log anyway</button>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseTracker() {
  const { expenses, streak, lastLogDate, deleteExpense } = useExpenses();
  const { currency } = useProfile();
  const { activeChallenges } = useChallenges();
  const [showInput, setShowInput] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pendingConflict, setPendingConflict] = useState(null); // { category, challengeName, doLog }

  const today = new Date().toISOString().split('T')[0];
  const loggedToday = lastLogDate === today;

  const filteredExpenses = filter === 'all'
    ? expenses.slice(0, 50)
    : expenses.filter((e) => e.category === filter).slice(0, 50);

  const handleBeforeAdd = (category, doLog) => {
    // Check for challenge conflicts
    for (const active of activeChallenges) {
      const conflicts = CHALLENGE_CONFLICTS[active.challengeId] || [];
      if (conflicts.includes(category)) {
        const challenge = CHALLENGES.find((c) => c.id === active.challengeId);
        setPendingConflict({ category, challengeName: challenge?.title || active.challengeId, doLog });
        return false; // block — show warning
      }
    }
    return true; // allow
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Active Challenge Banner */}
      <ActiveChallengeBanner activeChallenges={activeChallenges} />

      {/* Streak Banner */}
      <div className="card card-brand slide-up" style={{ padding: 18, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>🔥</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{streak} days</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Logging streak</div>
          </div>
        </div>
        <span className="tag tag-brand" style={{ fontSize: 12 }}>
          {loggedToday ? '✅ Logged today' : '⏳ Not logged yet'}
        </span>
      </div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="card slide-up" style={{ padding: 40, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Nothing tracked yet.</h3>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 20 }}>Your streak starts today.</p>
        </div>
      )}

      {/* Expense Input */}
      {showInput && (
        <div style={{ marginBottom: 20 }}>
          <ExpenseInput onAdded={() => {}} onBeforeAdd={handleBeforeAdd} />
        </div>
      )}

      {/* Toggle */}
      <button className="btn-ghost" onClick={() => setShowInput(!showInput)} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
        {showInput ? '▲ Hide form' : '▼ Show add expense form'}
      </button>

      {/* Category Filter */}
      {expenses.length > 0 && (
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
          <button className={`nav-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {Object.entries(CAT_META).map(([key, meta]) => (
            <button key={key} className={`nav-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
              {meta.icon} {meta.label}
            </button>
          ))}
        </div>
      )}

      {/* Expense List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredExpenses.map((expense) => {
          const meta = CAT_META[expense.category] || CAT_META.other;
          return (
            <div key={expense.id} className="card fade-in" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{meta.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{expense.note || meta.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {meta.label}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{currency}{Number(expense.amount).toLocaleString('en-IN')}</span>
                <button onClick={() => deleteExpense(expense.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', padding: 4, borderRadius: 8 }}
                  onMouseEnter={(e) => { e.target.style.color = '#EF4444'; e.target.style.background = '#FEE2E2'; }}
                  onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none'; }}>×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conflict warning modal */}
      {pendingConflict && (
        <ConflictWarning
          category={CAT_META[pendingConflict.category]?.label || pendingConflict.category}
          challengeName={pendingConflict.challengeName}
          onLog={() => { pendingConflict.doLog?.(); setPendingConflict(null); }}
          onCancel={() => setPendingConflict(null)}
        />
      )}
    </div>
  );
}
