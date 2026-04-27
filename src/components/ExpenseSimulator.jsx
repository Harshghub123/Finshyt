import useSimulator from '../store/useSimulator';

const EXPENSE_FIELDS = [
  { key: 'rent', label: 'Rent & Bills', icon: '🏠', color: '#8B5CF6', bg: '#EDE9FE', max: 200000, step: 500 },
  { key: 'food', label: 'Food & Dining', icon: '🍕', color: '#F97316', bg: '#FFF0DB', max: 50000, step: 500 },
  { key: 'transport', label: 'Transport', icon: '🚗', color: '#0EA5E9', bg: '#E0F2FE', max: 30000, step: 500 },
  { key: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#EC4899', bg: '#FCE7F3', max: 15000, step: 100 },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EAB308', bg: '#FEF9C3', max: 50000, step: 500 },
  { key: 'lifestyle', label: 'Lifestyle', icon: '✨', color: '#22C55E', bg: '#DCFCE7', max: 50000, step: 500 },
];

function ExpenseSlider({ field }) {
  const value = useSimulator((s) => s[field.key]);
  const income = useSimulator((s) => s.monthlyIncome);
  const currency = useSimulator((s) => s.currency);
  const setExpense = useSimulator((s) => s.setExpense);
  const getTimeCost = useSimulator((s) => s.getTimeCost);

  const percentage = ((value / income) * 100).toFixed(1);
  const hours = getTimeCost(value);
  const sliderPercent = (value / field.max) * 100;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: field.bg }}>
            {field.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">{field.label}</h3>
            <span className="text-xs font-medium text-text-muted">{percentage}% of income</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold" style={{ color: field.color }}>
            {currency}{value.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-text-muted">⏱ {hours}h of work</div>
        </div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => setExpense(field.key, parseInt(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${field.color} ${sliderPercent}%, #F3F4F6 ${sliderPercent}%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function ExpenseSimulator() {
  const income = useSimulator((s) => s.monthlyIncome);
  const currency = useSimulator((s) => s.currency);
  const setIncome = useSimulator((s) => s.setIncome);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold">💳 Expense Simulator</h2>
        <span className="text-sm font-medium text-text-muted">Drag to adjust</span>
      </div>

      {/* Income slider */}
      <div className="card p-5" style={{ background: '#DCFCE7', border: '2px solid #86EFAC' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: '#86EFAC' }}>
              💰
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: '#166534' }}>Monthly Income</h3>
              <span className="text-xs font-medium" style={{ color: '#15803D' }}>Your total take-home</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold" style={{ color: '#166534' }}>
            {currency}{income.toLocaleString()}
          </div>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={income}
            onChange={(e) => setIncome(parseInt(e.target.value))}
            style={{
              background: `linear-gradient(to right, #22C55E ${((income - 10000) / 490000) * 100}%, rgba(255,255,255,0.5) ${((income - 10000) / 490000) * 100}%)`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPENSE_FIELDS.map((field) => (
          <ExpenseSlider key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}
