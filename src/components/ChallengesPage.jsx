import { useState } from 'react';
import useChallenges, { CHALLENGES } from '../store/useChallenges';
import useProfile, { PERSONALITIES } from '../store/useProfile';

const PERSONALITY_QUESTIONS = [
  {
    q: "It's payday. What's your first thought?",
    options: [
      { text: "Time to treat myself! 🛍️", type: 'impulse_spender' },
      { text: "Auto-transfer to savings 💰", type: 'silent_saver' },
      { text: "Weekend plans loading... 🎉", type: 'weekend_warrior' },
      { text: "Check my subscription list 📱", type: 'subscription_hoarder' },
    ],
  },
  {
    q: "Your biggest guilty pleasure spend?",
    options: [
      { text: "Online shopping at 2 AM", type: 'impulse_spender' },
      { text: "Food delivery apps 🍕", type: 'food_lover' },
      { text: "Weekend outings & parties", type: 'weekend_warrior' },
      { text: "I don't have one tbh", type: 'silent_saver' },
    ],
  },
  {
    q: "Sale notification pops up. You...",
    options: [
      { text: "Buy now, think later", type: 'impulse_spender' },
      { text: "Check if I actually need it", type: 'balanced_boss' },
      { text: "Order food instead lol", type: 'food_lover' },
      { text: "Ignore and save the money", type: 'silent_saver' },
    ],
  },
  {
    q: "How do you feel about your spending?",
    options: [
      { text: "What spending? I'm saving 😤", type: 'silent_saver' },
      { text: "Weekdays = fine, weekends = yikes", type: 'weekend_warrior' },
      { text: "I spend but I'm aware of it", type: 'balanced_boss' },
      { text: "I have too many subscriptions", type: 'subscription_hoarder' },
    ],
  },
];

function PersonalityQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (type) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);
    if (step < PERSONALITY_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const counts = {};
      newAnswers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
      const topType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      onComplete(topType);
    }
  };

  const q = PERSONALITY_QUESTIONS[step];
  return (
    <div className="card bounce-in" key={step} style={{ padding: 28, textAlign: 'center', marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>
        QUESTION {step + 1} / {PERSONALITY_QUESTIONS.length}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20 }}>
        {PERSONALITY_QUESTIONS.map((_, i) => (
          <div key={i} style={{ width: 32, height: 4, borderRadius: 99, background: i <= step ? 'var(--brand)' : '#E5E7EB' }} />
        ))}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>{q.q}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => (
          <button key={i} className="btn-secondary" onClick={() => handleAnswer(opt.type)}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalityResult({ personality }) {
  const data = PERSONALITIES[personality];
  if (!data) return null;
  return (
    <div className="card bounce-in" style={{ padding: 28, textAlign: 'center', background: `${data.color}15`, borderColor: data.color, marginBottom: 20 }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{data.emoji}</div>
      <h3 style={{ fontSize: 22, fontWeight: 900, color: data.color }}>{data.title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{data.desc}</p>
      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>💡 Tips for you</div>
        {data.tips.map((tip, i) => (
          <div key={i} style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', background: '#fff', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{tip}</div>
        ))}
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const { activeChallenges, completedChallenges, totalXP, startChallenge, completeChallenge, abandonChallenge, getLevel } = useChallenges();
  const { moneyPersonality, setMoneyPersonality } = useProfile();
  const [showQuiz, setShowQuiz] = useState(false);
  const level = getLevel();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Level & XP */}
      <div className="card card-brand slide-up" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level {level.level}</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{level.emoji} {level.title}</div>
        </div>
        <div className="tag tag-brand" style={{ fontSize: 14, fontWeight: 800, padding: '6px 16px' }}>{totalXP} XP</div>
      </div>

      {/* Pinned Quiz Card */}
      {!showQuiz && !moneyPersonality && (
        <div className="card slide-up" style={{
          padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', border: '1px solid #DDD6FE',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Discover your money type</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>4 questions · 2 min</div>
          </div>
          <button className="btn-primary" onClick={() => setShowQuiz(true)} style={{ padding: '10px 18px', fontSize: 13 }}>
            Take the quiz →
          </button>
        </div>
      )}

      {/* Money Personality */}
      {showQuiz && (
        <PersonalityQuiz onComplete={(type) => { setMoneyPersonality(type); setShowQuiz(false); }} />
      )}
      {!showQuiz && moneyPersonality && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🧠 Money Personality</h3>
          <PersonalityResult personality={moneyPersonality} />
          <button className="btn-ghost" onClick={() => setShowQuiz(true)} style={{ width: '100%', marginBottom: 20, justifyContent: 'center' }}>
            🔄 Retake quiz
          </button>
        </>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>⚡ Active Challenges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {activeChallenges.map((active) => {
              const challenge = CHALLENGES.find((c) => c.id === active.challengeId);
              if (!challenge) return null;
              return (
                <div key={active.challengeId} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--brand)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{challenge.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{challenge.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{challenge.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-primary" onClick={() => completeChallenge(active.challengeId)} style={{ padding: '6px 14px', fontSize: 12 }}>✅ Done</button>
                    <button className="btn-ghost" onClick={() => abandonChallenge(active.challengeId)} style={{ fontSize: 12 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Available Challenges */}
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🎯 Micro Challenges</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {CHALLENGES.filter((c) => !activeChallenges.some((a) => a.challengeId === c.id)).map((challenge) => {
          const isCompleted = completedChallenges.some((cc) => cc.challengeId === challenge.id);
          return (
            <div key={challenge.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isCompleted ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{challenge.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{challenge.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{challenge.desc}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className={`tag ${challenge.difficulty === 'easy' ? 'tag-mint' : challenge.difficulty === 'medium' ? 'tag-lemon' : 'tag-coral'}`}>{challenge.difficulty}</span>
                    <span className="tag tag-brand">+{challenge.xp} XP</span>
                  </div>
                </div>
              </div>
              {isCompleted ? (
                <span className="tag tag-mint">✅ Done</span>
              ) : (
                <button className="btn-primary" onClick={() => startChallenge(challenge.id)} style={{ padding: '8px 16px', fontSize: 12 }}>Start</button>
              )}
            </div>
          );
        })}
      </div>

      {completedChallenges.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
          🏆 {completedChallenges.length} challenges completed · {totalXP} XP earned
        </p>
      )}
    </div>
  );
}
