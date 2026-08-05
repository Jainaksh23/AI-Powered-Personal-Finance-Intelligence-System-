import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, Sparkles, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle, ArrowLeft, Rocket, FolderPlus } from 'lucide-react';

export const AuthPage = ({ initialMode = 'login', onBackToLanding }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [coldStartOption, setColdStartOption] = useState('demo'); // 'demo' or 'empty'
  const [selectedPersona, setSelectedPersona] = useState('Working Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(name, email, password, coldStartOption, selectedPersona);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '1020px', display: 'grid', gridTemplateColumns: '1.1fr 1.1fr', gap: '32px', alignItems: 'center' }}>
        
        {/* Left Branding Panel */}
        <div style={{ padding: '20px' }}>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Back to Overview
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)' }}>
              <Brain size={28} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', background: 'linear-gradient(90deg, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PFIS
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: '600', letterSpacing: '0.05em' }}>
                PERSONAL FINANCE INTELLIGENCE SYSTEM
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1.25', marginBottom: '16px', color: '#f3f4f6' }}>
            We are not an expense tracker. We are your <span style={{ color: '#06b6d4' }}>AI Financial Decision Support</span>.
          </h2>

          <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '28px', fontSize: '0.92rem' }}>
            Solve the cold start problem: Explore instantaneous ML dashboards using synthetic persona data or start with a clean empty account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <TrendingUp size={20} color="#10b981" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#f3f4f6' }}>AI Expense Forecasting:</strong> Regression time-series predictions for next month expenses.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <AlertTriangle size={20} color="#f43f5e" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#f3f4f6' }}>Fraud & Anomaly Detection:</strong> Isolation Forest algorithm catches high-risk out-of-context expenses.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Sparkles size={20} color="#6366f1" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#f3f4f6' }}>Synthetic Data Engine:</strong> 8 Spending Personas to test instant analytics on first login.
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px', color: '#f3f4f6' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>
            {isRegister ? 'Sign up to build your financial intelligence model' : 'Sign in to access your intelligence dashboard'}
          </p>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="demo@pfis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            {/* Cold Start Selector during Registration */}
            {isRegister && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cold Start Onboarding Strategy
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setColdStartOption('demo')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: coldStartOption === 'demo' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      background: coldStartOption === 'demo' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      color: coldStartOption === 'demo' ? '#38bdf8' : '#9ca3af',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                  >
                    <Rocket size={14} /> Persona Demo Data
                  </button>

                  <button
                    type="button"
                    onClick={() => setColdStartOption('empty')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: coldStartOption === 'empty' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      background: coldStartOption === 'empty' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      color: coldStartOption === 'empty' ? '#38bdf8' : '#9ca3af',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                  >
                    <FolderPlus size={14} /> Empty Account
                  </button>
                </div>

                {coldStartOption === 'demo' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Select Spending Persona</label>
                    <select
                      className="input-field"
                      value={selectedPersona}
                      onChange={(e) => setSelectedPersona(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <option value="Working Professional">Working Professional</option>
                      <option value="Student">Student Persona</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Family User">Family User</option>
                      <option value="High Saver">High Saver</option>
                      <option value="Luxury Spender">Luxury Spender</option>
                      <option value="Frequent Traveller">Frequent Traveller</option>
                      <option value="Food Lover">Food Lover</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '12px' }} disabled={loading}>
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ position: 'relative', background: '#111827', padding: '0 12px', fontSize: '0.75rem', color: '#9ca3af' }}>OR DEMO ACCESS</span>
          </div>

          <button 
            type="button" 
            onClick={handleDemoLogin} 
            className="btn btn-secondary" 
            style={{ width: '100%', borderColor: '#06b6d4', color: '#38bdf8' }}
            disabled={loading}
          >
            <Sparkles size={16} color="#06b6d4" /> Explore Student Demo Account
          </button>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
