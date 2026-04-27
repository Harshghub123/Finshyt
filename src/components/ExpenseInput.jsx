import { useState } from 'react';
import useAuth from '../store/useAuth';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';

// Fallback static categories (used if profile has none)
const DEFAULT_CATS = [
  { value: 'food', label: 'Food', icon: '🍱', color: '#FDBA74', bg: '#FFF0DB' },
  { value: 'transport', label: 'Transport', icon: '🚌', color: '#7DD3FC', bg: '#E0F2FE' },
  { value: 'rent', label: 'Rent & Bills', icon: '🏠', color: '#C4B5FD', bg: '#EDE9FE' },
  { value: 'subscriptions', label: 'Subs', icon: '📱', color: '#F9A8D4', bg: '#FCE7F3' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FDE047', bg: '#FEF9C3' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#86EFAC', bg: '#DCFCE7' },
  { value: 'health', label: 'Health', icon: '💊', color: '#F9A8D4', bg: '#FCE7F3' },
  { value: 'other', label: 'Other', icon: '📦', color: '#D1D5DB', bg: '#F3F4F6' },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function ExpenseInput({ onAdded, onBeforeAdd, submitLabel }) {
  const { user } = useAuth();
  const { addExpense } = useExpenses();
  const { categories } = useProfile();

  // Build category list from profile (fallback to defaults)
  const cats = (categories && categories.length > 0)
    ? categories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
        color: c.color,
        bg: c.color + '33',
      }))
    : DEFAULT_CATS;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(cats[0]?.value || 'food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;

    const doLog = async () => {
      setAdding(true);
      await addExpense({
        user_id: user?.id || 'demo-user',
        amount: Number(amount),
        category,
        note: note.trim() || null,
        date,
      });

      setShowSuccess(true);
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setAdding(false);

      onAdded?.();

      setTimeout(() => setShowSuccess(false), 2000);
    };

    // Allow parent to intercept (e.g. challenge conflict check)
    if (onBeforeAdd) {
      const allowed = onBeforeAdd(category, doLog);
      if (allowed === false) return; // blocked — parent shows a modal
    }

    await doLog();
  };

  const selectedCat = cats.find((c) => c.value === category) || cats[0];

  return (
    <div className="card slide-up" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Add Expense</h3>

      {/* Amount */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Amount
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-muted)' }}>₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="0"
            className="input-field"
            style={{ fontSize: 28, fontWeight: 900, padding: '12px 16px' }}
            autoFocus
          />
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Category
        </label>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {cats.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--r-full)',
                border: category === cat.value ? `2px solid ${cat.color}` : '2px solid transparent',
                background: category === cat.value ? cat.bg : 'var(--bg-elevated)',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: 6,
                flexShrink: 0,
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Note (optional)
        </label>
        <input
          className="input-field"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={`e.g. ${selectedCat?.label || 'Expense'}`}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Date */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Date
        </label>
        <input
          className="input-field"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Submit */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={!amount || Number(amount) <= 0 || adding}
        style={{
          width: '100%', justifyContent: 'center', padding: '16px 28px',
          fontSize: 16, opacity: amount && Number(amount) > 0 ? 1 : 0.5,
        }}
      >
        {adding ? '...' : showSuccess ? '✅ Added!'
          : submitLabel || `Add ₹${amount || '0'} → ${selectedCat?.icon} ${selectedCat?.label}`}
      </button>

      {showSuccess && (
        <div className="insight-card positive fade-in" style={{ marginTop: 12, padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
          🎉 Expense logged! Keep it up.
        </div>
      )}
    </div>
  );
}
