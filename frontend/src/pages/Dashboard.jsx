import React from 'react';
import { StatCard } from '../components/StatCard';
import { Wallet, CreditCard, PiggyBank, TrendingUp, AlertOctagon, Lightbulb, ArrowUpRight, Store, UserCheck, ShieldCheck } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const Dashboard = ({ analytics, predictions, fraudAlerts, recommendations, onNavigate }) => {
  if (!analytics || !predictions) {
    return <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>Loading Financial Intelligence Analytics...</div>;
  }

  const {
    total_income,
    total_expense,
    net_savings,
    savings_rate,
    budget_used,
    remaining_budget,
    financial_health_score,
    health_status,
    user_persona,
    category_breakdown,
    top_merchants,
    monthly_trends
  } = analytics;

  const { total_predicted_expense, predicted_savings, savings_status } = predictions;

  // Doughnut Chart Data
  const doughnutData = {
    labels: category_breakdown.map(c => c.category),
    datasets: [{
      data: category_breakdown.map(c => c.amount),
      backgroundColor: [
        '#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#64748b'
      ],
      borderWidth: 0,
    }]
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#9ca3af', font: { size: 12 } }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  // Bar Chart Data
  const barData = {
    labels: monthly_trends.map(m => m.month),
    datasets: [
      {
        label: 'Income (₹)',
        data: monthly_trends.map(m => m.income),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Expenses (₹)',
        data: monthly_trends.map(m => m.expense),
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af' } }
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner & Health Gauge & Persona */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: '600', letterSpacing: '0.05em' }}>INTELLIGENCE DASHBOARD</span>
            <span className="badge badge-indigo" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>
              Persona: {user_persona || 'Balanced Spender'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f3f4f6' }}>Financial Health & Overview</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Real-time cash flow tracking, ML forecasting, and anomaly detection active.
          </p>
        </div>

        {/* Health Score Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Score</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: financial_health_score >= 70 ? '#10b981' : financial_health_score >= 40 ? '#f59e0b' : '#f43f5e' }}>
              {financial_health_score}<span style={{ fontSize: '1rem', color: '#6b7280' }}>/100</span>
            </div>
          </div>
          <div>
            <span className={`badge ${health_status === 'Excellent' || health_status === 'Good' ? 'badge-emerald' : 'badge-amber'}`}>
              {health_status}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
              Savings Rate: {savings_rate}%
            </div>
          </div>
        </div>
      </div>

      {/* Active Fraud Alert Bar (if present) */}
      {fraudAlerts && fraudAlerts.length > 0 && (
        <div className="glass-card pulse-glow" style={{ border: '1px solid rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={24} color="#f43f5e" />
            <div>
              <div style={{ fontWeight: '700', color: '#fb7185' }}>⚠ {fraudAlerts.length} Suspicious Transaction Alert</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{fraudAlerts[0].reason}</div>
            </div>
          </div>
          <button className="btn btn-danger" onClick={() => onNavigate('ai-insights')}>
            Inspect Alerts
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Monthly Income"
          value={`₹${total_income.toLocaleString('en-IN')}`}
          subtext="Total registered income"
          icon={Wallet}
          badgeText="Verified"
          badgeType="emerald"
          accentColor="#10b981"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${total_expense.toLocaleString('en-IN')}`}
          subtext={`${((total_expense/total_income)*100).toFixed(1)}% of total income`}
          icon={CreditCard}
          badgeText="Recorded"
          badgeType="cyan"
          accentColor="#06b6d4"
        />
        <StatCard
          title="Net Savings"
          value={`₹${net_savings.toLocaleString('en-IN')}`}
          subtext={`Savings margin: ${savings_rate}%`}
          icon={PiggyBank}
          badgeText={savings_rate > 20 ? 'Healthy' : 'Tight'}
          badgeType={savings_rate > 20 ? 'emerald' : 'amber'}
          accentColor={savings_rate > 20 ? '#10b981' : '#f59e0b'}
        />
        <StatCard
          title="Budget Used"
          value={`₹${(budget_used || total_expense).toLocaleString('en-IN')}`}
          subtext={`Remaining: ₹${(remaining_budget || 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          badgeText="Tracked"
          badgeType="indigo"
          accentColor="#6366f1"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Category Breakdown Doughnut */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Category Spend Distribution</h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Where your money flows every month</p>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate('expenses')}>
              View All
            </button>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Income vs Expense Monthly Trend Bar */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Monthly Cash Flow Trends</h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Historical cash inflows vs outflows</p>
            </div>
            <span className="badge badge-cyan">Trend Horizon</span>
          </div>
          <div style={{ height: '240px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Top Merchants & Quick AI Advice */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
        {/* Top Merchants Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="#06b6d4" /> Top Merchants
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {top_merchants && top_merchants.length > 0 ? (
              top_merchants.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f3f4f6' }}>{m.merchant}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.count} transactions</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#38bdf8' }}>
                    ₹{m.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>No merchant data available yet.</div>
            )}
          </div>
        </div>

        {/* Top AI Recommendations Preview Box */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>AI Savings Recommendations</h3>
            </div>
            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate('ai-insights')}>
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recommendations && recommendations.slice(0, 2).map((rec) => (
              <div key={rec.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{rec.category}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981' }}>+₹{rec.estimated_savings}/mo</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#d1d5db', margin: 0, lineHeight: '1.35' }}>
                  {rec.recommendation_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
