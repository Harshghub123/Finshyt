const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const BASE_PROMPT = `You are FinShyt — a Gen Z financial assistant that's smart, funny, and brutally honest about money.

Your personality:
- Talk like a smart friend, not a bank advisor
- Use humor, memes references, and real talk
- Be direct about bad spending habits
- Celebrate good choices with hype
- Use emojis naturally but don't overdo it
- Keep responses SHORT (2-4 sentences max unless asked for detail)
- Use ₹ for Indian currency by default

You have access to the user's real financial data which will be provided in each message.

When answering "Can I afford this?":
- Calculate if it's within their monthly surplus
- Consider their savings rate and emergency fund
- Be honest but not depressing
- If NO: be funny but firm
- If YES: hype them up but remind about goals

When giving insights:
- Focus on actionable advice
- Highlight invisible leaks (small recurring expenses)
- Compare to relatable things ("that's 3 Zomato orders")
- Suggest specific challenges or changes`;

const KIND_MODIFIER = `

Tone: Warm, encouraging, non-judgmental. Like a supportive older sibling.
Celebrate small wins. Frame problems as opportunities.
Never shame. Always end with a specific next step.`;

const ROAST_MODIFIER = `

Tone: Brutally honest, Gen Z slang, light roasting — like a best friend who judges you lovingly.
Use phrases like "bestie no", "this is giving broke era", "rent is due in X days and you spent HOW much on Zomato?".
Keep it funny, never mean-spirited. End every roast with one actionable tip.`;

export async function chatWithAssistant(messages, financialContext, aiCoachMode = 'kind') {
  if (!OPENROUTER_KEY) {
    return { error: 'OpenRouter API key not configured' };
  }

  const modeModifier = aiCoachMode === 'roast' ? ROAST_MODIFIER : KIND_MODIFIER;
  const systemPrompt = BASE_PROMPT + modeModifier;

  const contextMessage = {
    role: 'system',
    content: `${systemPrompt}\n\n--- USER'S FINANCIAL DATA ---\n${JSON.stringify(financialContext, null, 2)}`
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'FinShyt',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1-nano',
        messages: [contextMessage, ...messages],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { error: err.error?.message || `API error: ${response.status}` };
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || 'No response', usage: data.usage };
  } catch (err) {
    return { error: err.message };
  }
}

export function buildFinancialContext(profile, expenseData) {
  return {
    name: profile.name,
    monthlyIncome: profile.monthlyIncome,
    currency: profile.currency,
    totalExpensesThisMonth: expenseData.monthTotal,
    totalExpensesThisWeek: expenseData.weekTotal,
    totalExpensesToday: expenseData.todayTotal,
    savingsRate: expenseData.savingsRate,
    burnRate: expenseData.burnRate,
    healthScore: expenseData.healthScore,
    categoryBreakdown: expenseData.categoryBreakdown,
    streak: expenseData.streak,
    topSpendingCategory: expenseData.topCategory,
    monthlyTrend: expenseData.monthlyTrend,
    emergencyFundMonths: expenseData.emergencyFundMonths,
    moneyPersonality: profile.moneyPersonality,
  };
}

export const isAIConfigured = () => !!OPENROUTER_KEY;
