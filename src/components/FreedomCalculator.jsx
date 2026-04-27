import { useState } from 'react';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';

function IncomeModal({ onSave, onSkip }) {
  const { currency, monthlyIncome, setMonthlyIncome } = useProfile();
  const [local, setLocal] = useState(monthlyIncome);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card slide-up" style={{ maxWidth: 400, width: '100%', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>How much do you earn?</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          Stored only on your device. Never shared.
        </p>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--brand)', marginBottom: 16 }}>
          {currency}{local.toLocaleString('en-IN')}
        </div>
        <div className="slider-container" style={{ padding: '0 12px', marginBottom: 8 }}>
          <input type="range" min={5000} max={500000} step={5000} value={local}
            onChange={(e) => setLocal(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--brand) ${((local - 5000) / 495000) * 100}%, #E5E7EB ${((local - 5000) / 495000) * 100}%)` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 24 }}>
          <span>₹5K</span><span>₹5L</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Monthly take-home ({currency})</div>
        <button className="btn-primary" onClick={() => { setMonthlyIncome(local); onSave(); }} style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
          Save and calculate
        </button>
        <button className="btn-ghost" onClick={onSkip} style={{ width: '100%', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Skip — show me an estimate
        </button>
      </div>
    </div>
  );
}

export default function FreedomCalculator() {
  const { monthlyIncome, currency, name, incomeSet } = useProfile();
  const expenses = useExpenses();
  const [showIncomeModal, setShowIncomeModal] = useState(!incomeSet);
  const [skippedIncome, setSkippedIncome] = useState(false);

  const totalExpenses = expenses.expenses.length;
  const monthTotal = expenses.getMonthTotal();
  const monthlySavings = monthlyIncome - monthTotal;
  const savingsRate = expenses.getSavingsRate(monthlyIncome);
  const emergencyMonths = monthTotal > 0 ? monthlySavings / monthTotal : 0;
  const survivalDays = monthTotal > 0 ? Math.round((monthlySavings / monthTotal) * 30) : 0;

  const strength = emergencyMonths >= 6 ? 'strong' : emergencyMonths >= 3 ? 'medium' : 'low';
  const strengthColor = strength === 'strong' ? '#22C55E' : strength === 'medium' ? '#F59E0B' : '#EF4444';
  const strengthEmoji = strength === 'strong' ? '💪' : strength === 'medium' ? '🤔' : '😬';

  const monthsToGoals = [
    { label: '3-Month Fund', target: monthTotal * 3, emoji: '🛡️' },
    { label: '6-Month Fund', target: monthTotal * 6, emoji: '🏰' },
    { label: '1-Year Runway', target: monthTotal * 12, emoji: '🚀' },
    { label: 'FIRE (175x)', target: monthTotal * 175, emoji: '🔥' },
  ].map((goal) => ({
    ...goal,
    monthsNeeded: monthlySavings > 0 ? Math.ceil(goal.target / monthlySavings) : Infinity,
    targetFormatted: `${currency}${goal.target.toLocaleString('en-IN')}`,
  }));

  const futureReaction = savingsRate >= 30
    ? { emoji: '🤑', text: `Future ${name} is THRIVING. You're building real wealth.`, mood: 'positive' }
    : savingsRate >= 15
    ? { emoji: '😌', text: `Future ${name} is doing okay, but could do better. Push a little more.`, mood: 'info' }
    : savingsRate >= 5
    ? { emoji: '😰', text: `Future ${name} is stressed. One emergency and things get rough.`, mood: 'warning' }
    : { emoji: '😱', text: `Future ${name} in 3 months if this continues... not great.`, mood: 'danger' };

  // Empty state — fewer than 3 expenses
  if (totalExpenses < 3) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>🔥 Financial Freedom</h2>
        <div className="card slide-up" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            You're {3 - totalExpenses} expense{3 - totalExpenses !== 1 ? 's' : ''} away from knowing your freedom number.
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Log at least 3 expenses so we can calculate how long your money would last.
          </p>
          <div style={{ width: 200, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', margin: '0 auto 20px' }}>
            <div style={{ height: '100%', width: `${(totalExpenses / 3) * 100}%`, background: 'var(--brand)', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{totalExpenses} / 3 expenses logged</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>🔥 Financial Freedom</h2>

      {/* Income modal */}
      {showIncomeModal && !skippedIncome && (
        <IncomeModal
          onSave={() => setShowIncomeModal(false)}
          onSkip={() => { setShowIncomeModal(false); setSkippedIncome(true); }}
        />
      )}

      {/* Survival Metric */}
      <div className="card slide-up" style={{
        padding: 32, textAlign: 'center', marginBottom: 20,
        background: strength === 'strong' ? '#DCFCE7' : strength === 'medium' ? '#FEF9C3' : '#FEE2E2',
      }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{strengthEmoji}</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Survival Without Income
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: strengthColor, marginTop: 4 }}>
          {survivalDays > 0 ? `${survivalDays} days` : '0 days'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: strengthColor, marginTop: 4 }}>
          {strength === 'strong' ? "You've got a solid buffer!" :
           strength === 'medium' ? 'Getting there, keep saving.' :
           'One missed paycheck = trouble.'}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
          {['low', 'medium', 'strong'].map((level) => (
            <div key={level} style={{
              padding: '6px 16px', borderRadius: 'var(--r-full)',
              background: level === strength ? strengthColor : '#E5E7EB',
              color: level === strength ? '#fff' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
            }}>{level}</div>
          ))}
        </div>
      </div>

      {/* Future You */}
      <div className={`insight-card ${futureReaction.mood} slide-up`} style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 40 }}>{futureReaction.emoji}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>🔮 Future You in 3 Months</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{futureReaction.text}</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card slide-up" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>🏆 Milestones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {monthsToGoals.map((goal, i) => (
            <div key={i} style={{
              padding: '14px 18px', borderRadius: 'var(--r-md)',
              background: goal.monthsNeeded <= 12 ? '#DCFCE7' : goal.monthsNeeded <= 36 ? '#FEF9C3' : '#F3F4F6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{goal.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{goal.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target: {goal.targetFormatted}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: goal.monthsNeeded <= 12 ? '#166534' : goal.monthsNeeded <= 36 ? '#92400E' : 'var(--text-primary)' }}>
                  {goal.monthsNeeded === Infinity ? '∞' : goal.monthsNeeded <= 12 ? `${goal.monthsNeeded} mo` : `${(goal.monthsNeeded / 12).toFixed(1)} yr`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom card */}
      <div className="card card-brand slide-up" style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>With your current habits</p>
        <p style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
          You save <span style={{ color: 'var(--brand)', fontSize: 20 }}>{currency}{Math.max(0, monthlySavings).toLocaleString('en-IN')}</span> of freedom every month
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Every rupee saved = more time on YOUR terms ✨</p>
        {!incomeSet && (
          <button className="btn-ghost" onClick={() => setShowIncomeModal(true)} style={{ marginTop: 12, fontSize: 12 }}>
            💰 Set your income for accurate numbers
          </button>
        )}
      </div>
    </div>
  );
}
