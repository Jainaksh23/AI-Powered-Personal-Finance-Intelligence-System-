import React from 'react';
import { Sparkles, ShieldCheck, LineChart, PieChart, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ onGoToAuth }) => {
  const { loginAsDemo } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo();
    } catch (err) {
      console.error("Demo login failed", err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, #090d16 60%)', color: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header / Brand */}
      <header style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #06b6d4, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PFIS Intelligence
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI-Powered Financial Platform</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => onGoToAuth('login')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => onGoToAuth('register')}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1000px', margin: '60px auto 40px', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: '#06b6d4', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px' }}>
          <Sparkles size={16} /> Intelligent Financial Decision Support System
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.03em' }}>
          Stop Just Tracking Expenses.<br />
          <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Predict, Defend & Optimize
          </span> Your Wealth.
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#9ca3af', maxWidth: '720px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          PFIS leverages Machine Learning (XGBoost & Isolation Forest) to forecast next month expenses, flag fraudulent transactions in real-time, generate spending habit personas, and deliver dynamic financial recommendations.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }} onClick={handleDemoLogin}>
            Explore Live Demo <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }} onClick={() => onGoToAuth('login')}>
            Account Sign In
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Full-Stack Production Architecture</h2>
          <p style={{ color: '#9ca3af', marginTop: '8px' }}>Designed to meet high-volume fintech reliability and intelligence standards.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '16px' }}>
              <LineChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>ML Expense Forecasting</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Regression models analyze monthly velocity, historical categories, and inflation trends to accurately forecast next month spending with confidence metrics.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', marginBottom: '16px' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Fraud & Anomaly Defense</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Hybrid Isolation Forest & contextual scoring detect midnight high-value transactions, location mismatches, and unrecognized device anomalies.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', marginBottom: '16px' }}>
              <PieChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Category Budgets & Alerts</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Set category limits, monitor real-time progress bars, and receive automatic warning alerts when spending approaches configurable thresholds.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Financial PDF Reports</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Generate comprehensive monthly summaries, category breakdowns, savings rates, and download instant print-ready PDF reports with one click.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
