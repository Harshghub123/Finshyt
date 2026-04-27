import { create } from 'zustand';
import { chatWithAssistant, buildFinancialContext } from '../lib/openrouter';

const QUICK_PROMPTS = [
  { icon: '💸', text: 'Can I afford eating out?' },
  { icon: '📊', text: 'Where am I overspending?' },
  { icon: '🔥', text: 'Roast my spending' },
  { icon: '💰', text: 'How do I save more?' },
  { icon: '🎯', text: 'Give me a challenge' },
  { icon: '📈', text: 'Am I on track?' },
];

const useAssistant = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (text, profile, expenseData) => {
    const userMsg = { role: 'user', content: text };
    set((s) => ({ messages: [...s.messages, userMsg], isLoading: true, error: null }));

    const context = buildFinancialContext(profile, expenseData);
    const result = await chatWithAssistant(
      [...get().messages.filter((m) => m.role !== 'system'), userMsg],
      context,
      profile.aiCoachMode || 'kind'
    );

    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: result.content }],
        isLoading: false,
      }));
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));

export { QUICK_PROMPTS };
export default useAssistant;
