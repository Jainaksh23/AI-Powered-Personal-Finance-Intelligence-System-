import React from 'react';
import { LineChart, Sparkles, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Cpu } from 'lucide-react';

export const PredictionsPage = ({ predictions }) => {
  if (!predictions) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Loading AI ML Forecasts...</div>;
  }

  const { total_predicted_expense, total_current_income, predicted_savings, savings_status, category_predictions, model_used } = predictions;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-indigo">
              <Sparkles size={12} /> ML REGRESSION MODEL
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Algorithm: {model_used}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>AI Expense Forecasting & Prediction</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Predicting next month's category-wise expenses based on historical spending habits.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Forecasted Outflow</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#6366f1' }}>
              ₹{total_predicted_expense.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span className={`badge ${savings_status === 'Sufficient' ? 'badge-emerald' : savings_status === 'Warning' ? 'badge-amber' : 'badge-rose'}`}>
              Savings {savings_status}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
              Est. Surplus: ₹{predicted_savings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter 2 Real-World Case Study Highlight Box */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Cpu size={22} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '4px' }}>
              Why Predictive Personal Finance Matters
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Standard trackers only tell you what you spent. PFIS predicts that under your current spending pattern (e.g. Food ₹7k, Shopping ₹5k, Movies ₹3k), your net surplus is just <strong>₹{predicted_savings.toLocaleString('en-IN')}</strong>. If an unexpected emergency occurs (like a ₹12,000 laptop repair), you would run out of funds. Proactive ML forecasts allow you to adjust habits before expenses occur.
            </p>
          </div>
        </div>
      </div>

      {/* Category Predictions Breakdown */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Category-Wise Predicted Outflows</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {category_predictions.map((cp) => {
            const isIncrease = cp.change_percent > 0;
            return (
              <div key={cp.category} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-cyan">{cp.category}</span>
                  <span className={`badge ${isIncrease ? 'badge-rose' : 'badge-emerald'}`}>
                    {isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(cp.change_percent)}%
                  </span>
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '4px' }}>
                  ₹{cp.predicted_amount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Current Month Spending: ₹{cp.current_amount.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
