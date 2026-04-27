import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AVATARS = ['😎', '🤑', '💅', '🧠', '🔥', '👑', '🦄', '🎯', '⚡', '🌟', '💎', '🚀'];

const PERSONALITIES = {
  impulse_spender: {
    id: 'impulse_spender', title: 'Impulse Spender', emoji: '🛒',
    desc: 'You see it, you want it, you buy it. YOLO vibes.', color: '#EF4444',
    tips: ['Try the 24-hour rule before buying', 'Unsubscribe from sale emails', 'Set a weekly fun-money limit'],
  },
  silent_saver: {
    id: 'silent_saver', title: 'Silent Saver', emoji: '🤫',
    desc: "Money stacks in silence. You're building wealth quietly.", color: '#22C55E',
    tips: ['Consider investing your savings', 'Treat yourself occasionally', 'Your future self thanks you'],
  },
  weekend_warrior: {
    id: 'weekend_warrior', title: 'Weekend Warrior', emoji: '🎉',
    desc: 'Monday-Friday = monk mode. Weekend = money goes brrr.', color: '#F59E0B',
    tips: ['Set a weekend budget', 'Find free weekend activities', 'Pre-plan weekend spending'],
  },
  subscription_hoarder: {
    id: 'subscription_hoarder', title: 'Subscription Hoarder', emoji: '📱',
    desc: "Netflix, Spotify, gym you never go to... it adds up.", color: '#8B5CF6',
    tips: ['Audit subscriptions monthly', 'Share family plans', "Cancel what you don't use weekly"],
  },
  food_lover: {
    id: 'food_lover', title: 'Foodie Spender', emoji: '🍕',
    desc: 'Swiggy/Zomato is your most-used app. No regrets... almost.', color: '#F97316',
    tips: ['Cook 3 meals/week at home', 'Use food delivery on weekends only', 'Meal prep on Sundays'],
  },
  balanced_boss: {
    id: 'balanced_boss', title: 'Balanced Boss', emoji: '⚖️',
    desc: 'You spend smart and save smart. Financial zen master.', color: '#0EA5E9',
    tips: ["Keep doing what you're doing", 'Consider investing more', 'Help a friend with their finances'],
  },
};

const DEFAULT_CATEGORIES = [
  { id: 'rent', name: 'Rent & Bills', icon: '🏠', color: '#C4B5FD', isDefault: true },
  { id: 'food', name: 'Food', icon: '🍱', color: '#FDBA74', isDefault: true },
  { id: 'transport', name: 'Transport', icon: '🚌', color: '#7DD3FC', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#86EFAC', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FDE047', isDefault: true },
  { id: 'health', name: 'Health', icon: '💊', color: '#F9A8D4', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📱', color: '#FCA5A5', isDefault: true },
  { id: 'other', name: 'Others', icon: '📦', color: '#E5E7EB', isDefault: true },
];

const useProfile = create(
  persist(
    (set, get) => ({
      name: '',
      avatar: '😎',
      customPhoto: null,
      useCustomPhoto: false,
      monthlyIncome: 50000,
      currency: '₹',
      moneyPersonality: null,
      onboardingComplete: false,
      aiCoachMode: 'kind',
      incomeSet: false,
      categories: DEFAULT_CATEGORIES,
      monthlyBudgets: [],

      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar, useCustomPhoto: false }),
      setCustomPhoto: (photo) => set({ customPhoto: photo, useCustomPhoto: true }),
      clearCustomPhoto: () => set({ customPhoto: null, useCustomPhoto: false }),
      setMonthlyIncome: (monthlyIncome) => set({ monthlyIncome, incomeSet: true }),
      setCurrency: (currency) => set({ currency }),
      setMoneyPersonality: (personality) => set({ moneyPersonality: personality }),
      setAiCoachMode: (mode) => set({ aiCoachMode: mode }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      // Category management
      addCategory: (cat) => {
        const id = `cat-${Date.now()}`;
        set((s) => ({ categories: [...s.categories, { ...cat, id, isDefault: false }] }));
      },
      updateCategory: (id, updates) => {
        set((s) => ({
          categories: s.categories.map((c) => c.id === id ? { ...c, ...updates } : c),
        }));
      },
      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },

      // Budget management
      setBudget: (month, categoryId, planned) => {
        set((s) => {
          const idx = s.monthlyBudgets.findIndex(
            (b) => b.month === month && b.categoryId === categoryId
          );
          if (idx >= 0) {
            const updated = [...s.monthlyBudgets];
            updated[idx] = { ...updated[idx], planned };
            return { monthlyBudgets: updated };
          }
          return { monthlyBudgets: [...s.monthlyBudgets, { id: `budget-${Date.now()}`, month, categoryId, planned }] };
        });
      },
      getBudgetsForMonth: (month) => get().monthlyBudgets.filter((b) => b.month === month),
      copyBudgetFromPrevMonth: (targetMonth) => {
        const [year, mon] = targetMonth.split('-').map(Number);
        const prevDate = new Date(year, mon - 2, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        const prev = get().monthlyBudgets.filter((b) => b.month === prevMonth);
        const newBudgets = prev.map((b) => ({ ...b, id: `budget-${Date.now()}-${b.categoryId}`, month: targetMonth }));
        set((s) => ({
          monthlyBudgets: [...s.monthlyBudgets.filter((b) => b.month !== targetMonth), ...newBudgets],
        }));
      },

      getDisplayAvatar: () => {
        const { useCustomPhoto, customPhoto, avatar } = get();
        if (useCustomPhoto && customPhoto) return { type: 'photo', src: customPhoto };
        return { type: 'emoji', src: avatar };
      },
      getPersonalityData: () => PERSONALITIES[get().moneyPersonality] || null,

      resetProfile: () => set({
        name: '', avatar: '😎', customPhoto: null, useCustomPhoto: false,
        monthlyIncome: 50000, currency: '₹', moneyPersonality: null,
        onboardingComplete: false, aiCoachMode: 'kind', incomeSet: false,
        categories: DEFAULT_CATEGORIES, monthlyBudgets: [],
      }),
    }),
    { name: 'finshyt-profile' }
  )
);

export { AVATARS, PERSONALITIES, DEFAULT_CATEGORIES };
export default useProfile;
