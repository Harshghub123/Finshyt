import { create } from 'zustand';
import supabase, { isSupabaseConfigured } from '../lib/supabase';

// Generate realistic demo data
function generateDemoExpenses() {
  const categories = ['food', 'transport', 'rent', 'subscriptions', 'shopping', 'lifestyle', 'other'];
  const notes = {
    food: ['Swiggy order', 'Chai + samosa', 'Grocery', 'Zomato', 'Restaurant', 'Coffee', 'Snacks'],
    transport: ['Uber', 'Metro card', 'Auto', 'Petrol', 'Ola', 'Bus ticket'],
    rent: ['Monthly rent', 'Electricity bill', 'Water bill', 'Maintenance', 'WiFi'],
    subscriptions: ['Netflix', 'Spotify', 'YouTube Premium', 'Gym', 'iCloud', 'Amazon Prime'],
    shopping: ['T-shirt', 'Amazon order', 'Flipkart', 'Shoes', 'Phone case'],
    lifestyle: ['Movie tickets', 'Haircut', 'Party', 'Gift', 'Skincare'],
    other: ['Medicine', 'Laundry', 'Stationery', 'Donation'],
  };
  const expenses = [];
  const today = new Date();

  for (let d = 0; d < 60; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const numExpenses = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numExpenses; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const amounts = {
        food: [50, 100, 150, 200, 300, 450, 600, 800],
        transport: [20, 50, 100, 150, 200, 300],
        rent: [15000, 18000, 20000, 25000],
        subscriptions: [99, 149, 199, 299, 499, 999],
        shopping: [200, 500, 800, 1200, 2000, 3000],
        lifestyle: [100, 300, 500, 800, 1500],
        other: [50, 100, 200, 500],
      };
      const catAmounts = amounts[cat];
      const amount = catAmounts[Math.floor(Math.random() * catAmounts.length)];
      const catNotes = notes[cat];
      const note = catNotes[Math.floor(Math.random() * catNotes.length)];

      expenses.push({
        id: `demo-${d}-${i}`,
        user_id: 'demo-user',
        amount,
        category: cat,
        note,
        date: dateStr,
        created_at: date.toISOString(),
      });
    }
  }

  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const useExpenses = create((set, get) => ({
  expenses: [],
  streak: 0,
  lastLogDate: null,
  loading: false,

  fetchExpenses: async (userId) => {
    set({ loading: true });

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const demo = generateDemoExpenses();
      set({ expenses: demo, loading: false, streak: 45, lastLogDate: new Date().toISOString().split('T')[0] });
      return;
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(500);

    if (!error && data) {
      set({ expenses: data, loading: false });
      get().calculateStreak(userId);
    } else {
      set({ loading: false });
    }
  },

  addExpense: async (expense) => {
    if (!isSupabaseConfigured() || expense.user_id === 'demo-user') {
      const newExp = { ...expense, id: `demo-${Date.now()}`, created_at: new Date().toISOString() };
      set((s) => ({ expenses: [newExp, ...s.expenses] }));
      get().logDay(expense.user_id, expense.date);
      return newExp;
    }

    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (!error && data) {
      set((s) => ({ expenses: [data, ...s.expenses] }));
      get().logDay(expense.user_id, expense.date);
    }
    return data;
  },

  deleteExpense: async (id) => {
    if (id.startsWith('demo-')) {
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      return;
    }
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  logDay: async (userId, date) => {
    const today = date || new Date().toISOString().split('T')[0];
    set({ lastLogDate: today });

    if (isSupabaseConfigured() && userId !== 'demo-user') {
      await supabase.from('daily_logs').upsert({ user_id: userId, date: today }, { onConflict: 'user_id,date' });
    }
    get().calculateStreak(userId);
  },

  calculateStreak: async (userId) => {
    if (!isSupabaseConfigured() || userId === 'demo-user') return;

    const { data } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(60);

    if (!data?.length) return;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (data.some((log) => log.date === dateStr)) {
        streak++;
      } else if (i > 0) break;
    }
    set({ streak, lastLogDate: data[0]?.date });
  },

  // ========== ANALYTICS ==========

  getTodayTotal: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().expenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount), 0);
  },

  getWeekTotal: () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return get().expenses
      .filter((e) => new Date(e.date) >= weekAgo)
      .reduce((s, e) => s + Number(e.amount), 0);
  },

  getMonthTotal: () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return get().expenses
      .filter((e) => new Date(e.date) >= monthStart)
      .reduce((s, e) => s + Number(e.amount), 0);
  },

  getSavingsRate: (monthlyIncome) => {
    const monthTotal = get().getMonthTotal();
    if (monthlyIncome <= 0) return 0;
    return Math.max(0, ((monthlyIncome - monthTotal) / monthlyIncome) * 100);
  },

  getBurnRate: () => {
    const { expenses } = get();
    if (!expenses.length) return 0;
    const dates = [...new Set(expenses.map((e) => e.date))].sort();
    if (dates.length < 2) return get().getTodayTotal();
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    const days = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return Math.round((total / days) * 30);
  },

  getHealthScore: (monthlyIncome) => {
    const savingsRate = get().getSavingsRate(monthlyIncome);
    const { streak } = get();

    let score = 0;
    // Savings rate (0-40 points)
    score += Math.min(40, savingsRate * 1.33);
    // Streak (0-20 points)
    score += Math.min(20, streak * 2);
    // Consistency — spending across categories (0-20 points)
    const breakdown = get().getCategoryBreakdown('month');
    const hasRent = breakdown.some((b) => b.category === 'rent');
    if (hasRent) score += 10;
    if (breakdown.length >= 3) score += 10;
    // Not overspending (0-20 points)
    const monthTotal = get().getMonthTotal();
    if (monthTotal < monthlyIncome * 0.5) score += 20;
    else if (monthTotal < monthlyIncome * 0.7) score += 15;
    else if (monthTotal < monthlyIncome * 0.9) score += 10;
    else if (monthTotal < monthlyIncome) score += 5;

    return Math.round(Math.min(100, score));
  },

  getEmergencyFundMonths: (monthlyIncome) => {
    const monthTotal = get().getMonthTotal();
    const savings = monthlyIncome - monthTotal;
    if (savings <= 0 || monthTotal <= 0) return 0;
    // Accumulate savings
    return Number((savings / monthTotal).toFixed(1));
  },

  getCategoryBreakdown: (period = 'month') => {
    const { expenses } = get();
    const now = new Date();
    let filtered;

    if (period === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = expenses.filter((e) => e.date === today);
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = expenses.filter((e) => new Date(e.date) >= weekAgo);
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = expenses.filter((e) => new Date(e.date) >= monthStart);
    }

    const map = {};
    filtered.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });

    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  },

  getDailyTrend: (days = 14) => {
    const { expenses } = get();
    const trend = [];
    const now = new Date();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const total = expenses
        .filter((e) => e.date === dateStr)
        .reduce((s, e) => s + Number(e.amount), 0);

      trend.push({
        date: dateStr,
        weekday: weekdays[d.getDay()],
        day: d.getDate(),
        total,
      });
    }
    return trend;
  },

  getMonthlyTrend: (months = 6) => {
    const { expenses } = get();
    const trend = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const total = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        })
        .reduce((s, e) => s + Number(e.amount), 0);

      trend.push({
        month: start.toLocaleDateString('en-IN', { month: 'short' }),
        total,
      });
    }
    return trend;
  },

  // Invisible leaks — small recurring expenses
  getInvisibleLeaks: () => {
    const { expenses } = get();
    const noteMap = {};

    expenses.forEach((e) => {
      const key = (e.note || e.category).toLowerCase();
      if (!noteMap[key]) noteMap[key] = { note: e.note || e.category, total: 0, count: 0, category: e.category };
      noteMap[key].total += Number(e.amount);
      noteMap[key].count += 1;
    });

    return Object.values(noteMap)
      .filter((item) => item.count >= 3 && item.total >= 500)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        monthlyEstimate: Math.round((item.total / 60) * 30), // Based on 60 days of data
        perDay: Math.round(item.total / 60),
      }));
  },

  // Top spending category
  getTopCategory: () => {
    const breakdown = get().getCategoryBreakdown('month');
    return breakdown[0] || null;
  },

  // Spending spike detection
  hasRecentSpike: () => {
    const trend = get().getDailyTrend(7);
    if (trend.length < 3) return false;
    const avg = trend.slice(0, -1).reduce((s, d) => s + d.total, 0) / (trend.length - 1);
    const latest = trend[trend.length - 1].total;
    return latest > avg * 1.8;
  },

  // Build context for AI assistant
  getAssistantContext: (monthlyIncome) => ({
    monthTotal: get().getMonthTotal(),
    weekTotal: get().getWeekTotal(),
    todayTotal: get().getTodayTotal(),
    savingsRate: get().getSavingsRate(monthlyIncome),
    burnRate: get().getBurnRate(),
    healthScore: get().getHealthScore(monthlyIncome),
    categoryBreakdown: get().getCategoryBreakdown('month'),
    streak: get().streak,
    topCategory: get().getTopCategory(),
    monthlyTrend: get().getMonthlyTrend(3),
    emergencyFundMonths: get().getEmergencyFundMonths(monthlyIncome),
    invisibleLeaks: get().getInvisibleLeaks().slice(0, 3),
    recentSpike: get().hasRecentSpike(),
  }),
}));

export default useExpenses;
