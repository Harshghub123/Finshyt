import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CHALLENGES = [
  { id: 'no_spend_weekend', title: 'No-Spend Weekend', desc: 'Zero spending from Saturday to Sunday', icon: '🚫', duration: 2, xp: 50, difficulty: 'medium' },
  { id: 'under_500_day', title: 'Under ₹500 Day', desc: 'Keep total spending under ₹500 today', icon: '💪', duration: 1, xp: 25, difficulty: 'easy' },
  { id: 'cook_week', title: 'Cook All Week', desc: 'No food delivery for 7 days straight', icon: '👨‍🍳', duration: 7, xp: 100, difficulty: 'hard' },
  { id: 'no_impulse', title: 'No Impulse Buys', desc: 'Wait 24h before any non-essential purchase for 5 days', icon: '🧠', duration: 5, xp: 75, difficulty: 'medium' },
  { id: 'track_every_rupee', title: 'Track Every Rupee', desc: 'Log ALL expenses for 7 days straight', icon: '📝', duration: 7, xp: 80, difficulty: 'medium' },
  { id: 'subscription_audit', title: 'Subscription Audit', desc: 'Review and cancel at least 1 unused subscription', icon: '🔍', duration: 1, xp: 40, difficulty: 'easy' },
  { id: 'cash_only', title: 'Cash Only Day', desc: 'Use only cash today — feel every rupee leave', icon: '💵', duration: 1, xp: 30, difficulty: 'easy' },
  { id: 'save_10_percent', title: '10% Saver', desc: 'Save at least 10% of your income this month', icon: '📈', duration: 30, xp: 150, difficulty: 'hard' },
];

const useChallenges = create(
  persist(
    (set, get) => ({
      activeChallenges: [],
      completedChallenges: [],
      totalXP: 0,

      startChallenge: (challengeId) => {
        const challenge = CHALLENGES.find((c) => c.id === challengeId);
        if (!challenge) return;
        if (get().activeChallenges.find((c) => c.challengeId === challengeId)) return;
        set((state) => ({
          activeChallenges: [...state.activeChallenges, { challengeId, startDate: new Date().toISOString(), progress: 0 }],
        }));
      },

      completeChallenge: (challengeId) => {
        const challenge = CHALLENGES.find((c) => c.id === challengeId);
        if (!challenge) return;
        set((state) => ({
          activeChallenges: state.activeChallenges.filter((c) => c.challengeId !== challengeId),
          completedChallenges: [...state.completedChallenges, { challengeId, completedDate: new Date().toISOString(), xp: challenge.xp }],
          totalXP: state.totalXP + challenge.xp,
        }));
      },

      abandonChallenge: (challengeId) => {
        set((state) => ({ activeChallenges: state.activeChallenges.filter((c) => c.challengeId !== challengeId) }));
      },

      getLevel: () => {
        const { totalXP } = get();
        if (totalXP >= 500) return { level: 5, title: 'Money Master', emoji: '👑' };
        if (totalXP >= 300) return { level: 4, title: 'Finance Pro', emoji: '💎' };
        if (totalXP >= 150) return { level: 3, title: 'Smart Spender', emoji: '🧠' };
        if (totalXP >= 50) return { level: 2, title: 'Getting Started', emoji: '🌱' };
        return { level: 1, title: 'Rookie', emoji: '🐣' };
      },

      resetChallenges: () => set({ activeChallenges: [], completedChallenges: [], totalXP: 0 }),
    }),
    { name: 'finshyt-challenges' }
  )
);

export { CHALLENGES };
export default useChallenges;
