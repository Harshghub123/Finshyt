import { useRef, useCallback } from 'react';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';
import useChallenges from '../store/useChallenges';

const CAT_META = {
  food: 'Food 🍱', transport: 'Transport 🚌', rent: 'Rent 🏠',
  subscriptions: 'Subscriptions 📱', shopping: 'Shopping 🛍️',
  entertainment: 'Entertainment 🎮', health: 'Health 💊',
  lifestyle: 'Lifestyle ✨', other: 'Other 📦',
};

function ShareableCard({ type }) {
  const { monthlyIncome, currency, name, avatar, moneyPersonality } = useProfile();
  const expenses = useExpenses();
  const { streak } = expenses;
  const monthTotal = expenses.getMonthTotal();
  const cardRef = useRef(null);

  const survivalDays = monthTotal > 0
    ? Math.max(0, Math.round(((monthlyIncome - monthTotal) / monthTotal) * 30))
    : 0;

  const topCat = expenses.getTopCategory();
  const topCatLabel = topCat ? (CAT_META[topCat.category] || topCat.category) : 'everything 💸';
  const topCatAmount = topCat ? topCat.total : 0;

  const personalityLabels = {
    impulse_spender: 'Impulse Spender', silent_saver: 'Silent Saver',
    weekend_warrior: 'Weekend Warrior', subscription_hoarder: 'Subscription Hoarder',
    food_lover: 'Foodie Spender', balanced_boss: 'Balanced Boss',
  };
  const personalityLabel = moneyPersonality ? personalityLabels[moneyPersonality] : 'chaotic spender';

  const handleShare = useCallback(async () => {
    const card = cardRef.current;
    if (!card) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: null, useCORS: true });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `finshy-${type}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: 'My FinShy Stats', text: 'Check out my financial stats! 💰', files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `finshy-${type}.png`; a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) { console.error('Share failed:', err); }
  }, [type]);

  // Card 1: Freedom Flex
  if (type === 'freedom') {
    const bg = survivalDays < 7
      ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)'
      : survivalDays < 30
      ? 'linear-gradient(135deg, #78350F 0%, #92400E 100%)'
      : 'linear-gradient(135deg, #064E3B 0%, #047857 100%)';

    return (
      <div style={{ marginBottom: 20 }}>
        <div ref={cardRef} style={{
          background: bg, color: '#fff', borderRadius: 20, padding: 36,
          minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: 'Nunito, sans-serif', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>💸 Financial Freedom</div>
          <div>
            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{survivalDays}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>days I'd survive without income</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>financial freedom era</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{avatar} {name}</div>
            <img src="/logo.png" alt="FinShy" style={{ height: 22, filter: 'brightness(0) invert(1) opacity(0.5)' }} />
          </div>
        </div>
        <button className="btn-primary" onClick={handleShare} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>📸 Share this card</button>
      </div>
    );
  }

  // Card 2: Spending Roast
  if (type === 'roast') {
    return (
      <div style={{ marginBottom: 20 }}>
        <div ref={cardRef} style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', color: '#fff',
          borderRadius: 20, padding: 36, minHeight: 300,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: 'Nunito, sans-serif', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>💀 Spending Roast</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>I spent</div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{currency}{topCatAmount.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>on {topCatLabel} this month</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>and I'm in my <strong>{personalityLabel}</strong> era 💀</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{avatar} {name}</div>
            <img src="/logo.png" alt="FinShy" style={{ height: 22, filter: 'brightness(0) invert(1) opacity(0.5)' }} />
          </div>
        </div>
        <button className="btn-primary" onClick={handleShare} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>📸 Share this card</button>
      </div>
    );
  }

  // Card 3: Streak Flex (only if streak >= 3)
  if (type === 'streak') {
    if (streak < 3) {
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 20, padding: 36, textAlign: 'center', border: '2px dashed #E5E7EB', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Streak card unlocks at 3 days</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You're on day {streak}. Keep going!</div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <div ref={cardRef} style={{
          background: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)', color: '#fff',
          borderRadius: 20, padding: 36, minHeight: 300,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: 'Nunito, sans-serif', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>🔥 Streak Flex</div>
          <div>
            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>🔥 {streak}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>day streak of tracking my money</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>soft life loading...</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{avatar} {name}</div>
            <img src="/logo.png" alt="FinShy" style={{ height: 22, filter: 'brightness(0) invert(1) opacity(0.5)' }} />
          </div>
        </div>
        <button className="btn-primary" onClick={handleShare} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>📸 Share this card</button>
      </div>
    );
  }

  return null;
}

export default function FlexCards() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>📸 Flex Cards</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Meme-worthy stats built for your Instagram story
      </p>
      <ShareableCard type="freedom" />
      <ShareableCard type="roast" />
      <ShareableCard type="streak" />
    </div>
  );
}
