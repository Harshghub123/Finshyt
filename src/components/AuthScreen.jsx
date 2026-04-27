import { useState } from 'react';
import useAuth from '../store/useAuth';

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, loginDemo, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      const result = await signUp(email, password);
      if (!result.error) {
        setSuccess('Account created! Check your email to verify.');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0F9E4 0%, #FAFAFA 40%, #E0F2FE 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Logo — centered */}
      <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="bounce-in">
        <img src="/logo.png" alt="FinShyt" className="logo-img-xl" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>
          Your money, but smarter 💸
        </p>
      </div>

      {/* Auth Card */}
      <div className="card slide-up" style={{ padding: 'clamp(20px, 5vw, 32px)', maxWidth: 420, width: '100%' }}>
        {/* Google Login */}
        <button
          className="btn-google"
          onClick={() => signInWithGoogle()}
          style={{ marginBottom: 20 }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 20px' }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ marginBottom: 16 }}
          />

          <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            style={{ marginBottom: 20 }}
          />

          {error && (
            <div className="insight-card danger fade-in" style={{ marginBottom: 16, padding: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          {success && (
            <div className="insight-card positive fade-in" style={{ marginBottom: 16, padding: 12, fontSize: 13 }}>
              ✅ {success}
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 28px' }}
          >
            {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setIsLogin(!isLogin); clearError(); setSuccess(''); }}
            style={{ color: 'var(--brand)', fontWeight: 800, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        <button
          className="btn-secondary"
          onClick={loginDemo}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          ⚡ Continue with Demo Mode
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, marginTop: 8, color: 'var(--text-muted)' }}>
          No sign up needed — explore with sample data
        </p>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, marginTop: 20, color: 'var(--text-muted)' }}>
        Your data stays private with row-level security 🔒
      </p>
    </div>
  );
}
