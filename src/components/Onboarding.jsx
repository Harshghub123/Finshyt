import { useState, useRef } from 'react';
import useProfile, { AVATARS } from '../store/useProfile';
import ExpenseInput from './ExpenseInput';

export default function Onboarding() {
  const profile = useProfile();
  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState(profile.name || '');
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

  const displaySrc = profile.useCustomPhoto && profile.customPhoto ? profile.customPhoto : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0F9E4 0%, #FAFAFA 50%, #E0F2FE 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 56, height: 6, borderRadius: 99, background: i <= step ? 'var(--brand)' : '#E5E7EB', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step 0: Name + Avatar */}
      {step === 0 && (
        <div className="card bounce-in" style={{ padding: 'clamp(24px,5vw,40px)', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
          <h1 style={{ fontSize: 'clamp(22px,5vw,28px)', fontWeight: 900, marginBottom: 8 }}>What should we call you?</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Let's make this personal</p>

          <input
            className="input-field"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Your name"
            style={{ textAlign: 'center', fontSize: 'clamp(16px,4vw,20px)', fontWeight: 800, marginBottom: 24 }}
            autoFocus maxLength={20}
          />

          <div style={{ marginBottom: 16 }}>
            {displaySrc
              ? <img src={displaySrc} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand)', margin: '0 auto 8px', display: 'block' }} />
              : <div style={{ fontSize: 56, marginBottom: 8 }}>{profile.avatar}</div>
            }
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
            📷 {profile.useCustomPhoto ? 'Change Photo' : 'Upload Your Photo'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>OR PICK AN EMOJI</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 28 }}>
            {AVATARS.map((av) => (
              <button key={av} onClick={() => profile.setAvatar(av)} style={{
                fontSize: 28, padding: 8, borderRadius: 'var(--r-md)',
                border: !profile.useCustomPhoto && profile.avatar === av ? '3px solid var(--brand)' : '2px solid transparent',
                background: !profile.useCustomPhoto && profile.avatar === av ? 'var(--brand-bg)' : 'var(--bg-elevated)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{av}</button>
            ))}
          </div>

          <button className="btn-primary" onClick={() => { profile.setName(localName.trim()); setStep(1); }}
            disabled={localName.trim().length < 2} style={{ width: '100%', opacity: localName.trim().length >= 2 ? 1 : 0.5 }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 1: Value reveal */}
      {step === 1 && (
        <div className="card bounce-in" style={{ padding: 'clamp(24px,5vw,40px)', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
          <h1 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, marginBottom: 8 }}>
            Rohan has <span style={{ color: 'var(--brand)' }}>34 days</span> of financial freedom
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Log your expenses and find yours</p>

          <div style={{ background: '#DCFCE7', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Survival Without Income</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#166534', margin: '8px 0', lineHeight: 1 }}>34 days</div>
            <div style={{ fontSize: 14, color: '#166534', fontWeight: 700 }}>Getting there 💪</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
              {['Low', 'Medium', 'Strong'].map((l, i) => (
                <div key={l} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 800, background: i === 1 ? '#16a34a' : '#E5E7EB', color: i === 1 ? '#fff' : 'var(--text-muted)' }}>{l}</div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
            Track your spending and we'll calculate your real freedom number.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(2)}>Let's go →</button>
          </div>
        </div>
      )}

      {/* Step 2: First expense */}
      {step === 2 && (
        <div className="card bounce-in" style={{ padding: 'clamp(20px,5vw,36px)', maxWidth: 480, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💸</div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, marginBottom: 4 }}>What did you spend money on today?</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Log 1 expense to complete setup</p>
          </div>
          <ExpenseInput onAdded={() => profile.completeOnboarding()} submitLabel="Done — let's go! 🚀" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-ghost" onClick={() => profile.completeOnboarding()} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
