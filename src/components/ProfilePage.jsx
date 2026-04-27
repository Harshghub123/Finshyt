import { useState, useRef } from 'react';
import useAuth from '../store/useAuth';
import useProfile, { AVATARS } from '../store/useProfile';
import useExpenses from '../store/useExpenses';
import useChallenges from '../store/useChallenges';
import FlexCards from './FlexCards';
import CategoryManager from './CategoryManager';
import BudgetPlanner from './BudgetPlanner';

function AvatarDisplay({ size = 64 }) {
  const { avatar, customPhoto, useCustomPhoto } = useProfile();
  if (useCustomPhoto && customPhoto) {
    return <img src={customPhoto} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand)' }} />;
  }
  return <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{avatar}</span>;
}

export default function ProfilePage() {
  const { signOut, logoutDemo, isDemoMode } = useAuth();
  const profile = useProfile();
  const expenses = useExpenses();
  const challenges = useChallenges();

  const [localIncome, setLocalIncome] = useState(profile.monthlyIncome);
  const [activeSection, setActiveSection] = useState(null); // 'flex' | 'categories' | 'budget'
  const [showResetStep1, setShowResetStep1] = useState(false);
  const [showResetStep2, setShowResetStep2] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { alert('Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 200;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, 0, 0, 200, 200);
        profile.setCustomPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    profile.resetProfile();
    expenses.clearAll?.();
    challenges.resetChallenges?.();
    if (isDemoMode()) logoutDemo(); else signOut();
  };

  if (activeSection === 'flex') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => setActiveSection(null)} style={{ marginBottom: 16 }}>← Back</button>
        <FlexCards />
      </div>
    );
  }

  if (activeSection === 'categories') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => setActiveSection(null)} style={{ marginBottom: 16 }}>← Back</button>
        <CategoryManager />
      </div>
    );
  }

  if (activeSection === 'budget') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => setActiveSection(null)} style={{ marginBottom: 16 }}>← Back</button>
        <BudgetPlanner />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Profile header */}
      <div className="card slide-up" style={{ padding: 28, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <AvatarDisplay size={72} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{profile.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {isDemoMode() ? 'Demo Mode' : useAuth.getState?.()?.user?.email || ''}
        </div>
      </div>

      {/* Basic info */}
      <div className="card slide-up" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
          Profile
        </div>

        {/* Avatar */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Avatar</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
            📷 {profile.useCustomPhoto ? 'Change Photo' : 'Upload Photo'}
          </button>
          {profile.useCustomPhoto && (
            <button className="btn-ghost" onClick={() => profile.clearCustomPhoto()} style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
              Remove photo
            </button>
          )}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Name</label>
          <input className="input-field" type="text" value={profile.name}
            onChange={(e) => profile.setName(e.target.value)} maxLength={20} />
        </div>

        {/* Income */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Monthly Income</label>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand)', textAlign: 'center', marginBottom: 8 }}>
            {profile.currency}{localIncome.toLocaleString('en-IN')}
          </div>
          <div className="slider-container">
            <input type="range" min={5000} max={500000} step={5000} value={localIncome}
              onChange={(e) => { setLocalIncome(Number(e.target.value)); profile.setMonthlyIncome(Number(e.target.value)); }}
              style={{ background: `linear-gradient(to right, var(--brand) ${((localIncome - 5000) / 495000) * 100}%, #E5E7EB ${((localIncome - 5000) / 495000) * 100}%)` }}
            />
          </div>
        </div>
      </div>

      {/* AI Coach style */}
      <div className="card slide-up" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
          AI Coach
        </div>
        <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 10 }}>
          How should your coach talk to you?
        </label>
        <div style={{ display: 'flex', gap: 0, borderRadius: 10, overflow: 'hidden', border: '2px solid #E5E7EB' }}>
          <button
            onClick={() => profile.setAiCoachMode('kind')}
            style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14,
              background: profile.aiCoachMode === 'kind' ? 'var(--brand)' : '#F9FAFB',
              color: profile.aiCoachMode === 'kind' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            🤍 Be kind
          </button>
          <button
            onClick={() => profile.setAiCoachMode('roast')}
            style={{
              flex: 1, padding: '12px 0', border: 'none', borderLeft: '2px solid #E5E7EB', cursor: 'pointer', fontWeight: 800, fontSize: 14,
              background: profile.aiCoachMode === 'roast' ? '#EF4444' : '#F9FAFB',
              color: profile.aiCoachMode === 'roast' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            🔥 Roast me
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          You can change this anytime
        </div>
      </div>

      {/* Flex your stats */}
      <div className="card slide-up" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Flex your stats
        </div>
        <button className="btn-secondary" onClick={() => setActiveSection('flex')} style={{ width: '100%', justifyContent: 'center' }}>
          📸 Generate share card
        </button>
      </div>

      {/* Categories & Budget */}
      <div className="card slide-up" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          My Money
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setActiveSection('categories')} style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>🏷️ My Categories</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
          </button>
          <button className="btn-secondary" onClick={() => setActiveSection('budget')} style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>📊 Monthly Budget Planner</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button className="btn-secondary" onClick={() => isDemoMode() ? logoutDemo() : signOut()}
        style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
        🚪 Sign Out
      </button>

      {/* Danger zone */}
      <div style={{ borderTop: '2px solid #FEE2E2', paddingTop: 16, marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Danger zone
        </div>

        {!showResetStep1 && !showResetStep2 && (
          <button
            onClick={() => setShowResetStep1(true)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)',
              border: '2px solid #EF4444', background: 'transparent',
              color: '#EF4444', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reset everything & start fresh
          </button>
        )}

        {/* Step 1 modal */}
        {showResetStep1 && !showResetStep2 && (
          <div className="card fade-in" style={{ padding: 24, border: '1px solid #FEE2E2' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Start from scratch?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              This will delete all your expenses, streaks, XP, budget plans, and settings. <strong>This cannot be undone.</strong>
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setShowResetStep1(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button
                onClick={() => { setShowResetStep1(false); setShowResetStep2(true); setResetInput(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-md)', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
              >
                Yes, reset everything
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — type to confirm */}
        {showResetStep2 && (
          <div className="card fade-in" style={{ padding: 24, border: '1px solid #FEE2E2' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Are you sure?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Type <strong>RESET</strong> to confirm</p>
            <input
              className="input-field"
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="RESET"
              style={{ textAlign: 'center', fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => { setShowResetStep2(false); setResetInput(''); }} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetInput !== 'RESET'}
                style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--r-md)', border: 'none',
                  background: resetInput === 'RESET' ? '#EF4444' : '#F3F4F6',
                  color: resetInput === 'RESET' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 800, fontSize: 14, cursor: resetInput === 'RESET' ? 'pointer' : 'not-allowed',
                }}
              >
                Confirm reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
