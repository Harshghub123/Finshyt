const GIPHY_KEY = import.meta.env.VITE_GIPHY_KEY || '';
const API_URL = 'https://api.giphy.com/v1/gifs/search';

// Financial state → search tags mapping
const STATE_TAGS = {
  broke: ['broke reaction', 'no money', 'empty wallet', 'poor reaction'],
  overspending: ['money flying', 'spending money', 'impulse buy', 'shopping addiction'],
  good_savings: ['money rain', 'rich flex', 'saving money', 'success celebration'],
  smart_decision: ['big brain', 'smart move', 'galaxy brain', 'genius'],
  bad_decision: ['money fail', 'regret purchase', 'facepalm money'],
  streak_success: ['winning streak', 'on fire', 'unstoppable', 'champion'],
  financial_growth: ['level up', 'growth', 'going up', 'stonks'],
  challenge_complete: ['victory dance', 'celebration', 'mission complete', 'nailed it'],
  cant_afford: ['crying money', 'broke', 'wallet empty', 'sad money'],
  can_afford: ['treat yourself', 'money flex', 'take my money', 'shopping spree'],
};

const cache = new Map();

export async function fetchMemeGif(state, rating = 'pg-13') {
  if (!GIPHY_KEY) return null;

  const cacheKey = state;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    // Return random from cached results
    return cached[Math.floor(Math.random() * cached.length)];
  }

  const tags = STATE_TAGS[state] || ['money'];
  const query = tags[Math.floor(Math.random() * tags.length)];

  try {
    const params = new URLSearchParams({
      api_key: GIPHY_KEY,
      q: query,
      limit: '15',
      rating,
      lang: 'en',
    });

    const res = await fetch(`${API_URL}?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const gifs = data.data?.map((g) => ({
      id: g.id,
      url: g.images.fixed_height.url,
      smallUrl: g.images.fixed_height_small.url,
      width: parseInt(g.images.fixed_height.width),
      height: parseInt(g.images.fixed_height.height),
      title: g.title,
    })) || [];

    if (gifs.length > 0) {
      cache.set(cacheKey, gifs);
      return gifs[Math.floor(Math.random() * gifs.length)];
    }
    return null;
  } catch {
    return null;
  }
}

// Determine financial state from user data
export function getFinancialState(data) {
  const { savingsRate, healthScore, streak, recentSpike, challengeCompleted } = data;

  if (challengeCompleted) return 'challenge_complete';
  if (streak >= 7) return 'streak_success';
  if (savingsRate >= 30) return 'good_savings';
  if (savingsRate >= 15) return 'financial_growth';
  if (recentSpike) return 'overspending';
  if (savingsRate < 5) return 'broke';
  if (healthScore >= 70) return 'smart_decision';
  if (healthScore < 30) return 'bad_decision';
  return 'financial_growth';
}

export const isGiphyConfigured = () => !!GIPHY_KEY;
