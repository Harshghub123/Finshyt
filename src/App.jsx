import { useState, useEffect } from 'react';
import useAuth from './store/useAuth';
import useProfile from './store/useProfile';
import useExpenses from './store/useExpenses';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import AIAssistant from './components/AIAssistant';
import FreedomCalculator from './components/FreedomCalculator';
import ChallengesPage from './components/ChallengesPage';
import ProfilePage from './components/ProfilePage';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'track', label: 'Track', icon: '➕' },
  { id: 'freedom', label: 'Freedom', icon: '🔥' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

function AvatarDisplay({ size = 32, style = {} }) {
  const { avatar, customPhoto, useCustomPhoto } = useProfile();
  if (useCustomPhoto && customPhoto) {
    return (
      <img
        src={customPhoto}
        alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-light)', flexShrink: 0, ...style }}
      />
    );
  }
  return <span style={{ fontSize: size * 0.75, lineHeight: 1, ...style }}>{avatar}</span>;
}

function AIBottomSheet({ onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--bg)', borderRadius: '24px 24px 0 0',
          padding: '0 0 env(safe-area-inset-bottom)',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E5E7EB' }} />
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '0 16px 24px' }}>
          <AIAssistant embedded />
        </div>
      </div>
    </div>
  );
}

function AppHeader({ activeTab, setActiveTab }) {
  const { isDemoMode } = useAuth();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '10px 16px',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/logo.png" alt="FinShyt" className="logo-img" />
          {isDemoMode() && (
            <span className="tag tag-lemon" style={{ fontSize: 11 }}>Demo</span>
          )}
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 2, overflowX: 'auto', justifyContent: 'center' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function MainApp() {
  const { user } = useAuth();
  const { onboardingComplete } = useProfile();
  const { fetchExpenses } = useExpenses();
  const [activeTab, setActiveTab] = useState('home');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (user?.id) fetchExpenses(user.id);
  }, [user?.id]);

  if (!onboardingComplete) return <Onboarding />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ padding: 'clamp(12px, 3vw, 24px) clamp(12px, 3vw, 20px)', maxWidth: 900, margin: '0 auto', paddingBottom: 100 }}>
        {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'track' && <ExpenseTracker />}
        {activeTab === 'freedom' && <FreedomCalculator />}
        {activeTab === 'challenges' && <ChallengesPage />}
        {activeTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
      </main>

      {/* Expense FAB — hidden on track & profile tabs */}
      {activeTab !== 'track' && activeTab !== 'profile' && (
        <button
          className="btn-primary animate-pulse-brand"
          onClick={() => setActiveTab('track')}
          style={{
            position: 'fixed', bottom: 24, right: 84,
            width: 52, height: 52, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, padding: 0, zIndex: 50,
            boxShadow: '0 4px 20px rgba(100,190,60,0.4)',
          }}
        >
          +
        </button>
      )}

      {/* AI FAB */}
      <button
        onClick={() => setShowAI(true)}
        style={{
          position: 'fixed', bottom: 24, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          border: 'none', cursor: 'pointer', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Open AI Coach"
      >
        🤖
      </button>

      {showAI && <AIBottomSheet onClose={() => setShowAI(false)} />}
    </div>
  );
}

export default function App() {
  const { user, loading, initialize } = useAuth();

  useEffect(() => { initialize(); }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'linear-gradient(135deg, #F0F9E4 0%, #FAFAFA 50%)',
      }}>
        <img src="/logo.png" alt="FinShyt" className="logo-img-xl animate-float" style={{ display: 'block' }} />
        <div className="shimmer" style={{ width: 200, height: 8, borderRadius: 99 }} />
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <MainApp />;
}

export { AvatarDisplay };
