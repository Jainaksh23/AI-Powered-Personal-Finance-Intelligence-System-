import React from 'react';
import { Lightbulb, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, Target, ArrowRight } from 'lucide-react';

export const RecommendationsPage = ({ recommendations }) => {
  const totalPotentialSavings = recommendations 
    ? recommendations.reduce((acc, r) => acc + (r.estimated_savings || 0), 0)
    : 0;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-indigo">
              <Sparkles size={12} /> EXPLAINABLE HYBRID AI ADVISOR
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Personalized Savings Suggestions</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>AI Financial Recommendation Engine</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Data-driven guidance to optimize spending habits and build a strong emergency buffer.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Monthly Surplus</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>
              +₹{totalPotentialSavings.toLocaleString('en-IN')}<span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter 6.4 Explainable AI Rule Highlight */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={22} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '4px' }}>
              Explainable AI Recommendations
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Instead of black-box numbers, PFIS combines ML pattern analysis with transparent rule-based logic. For example: <em>"Reduce shopping by 15% → Expected Saving: ₹2,500"</em>, making it actionable and easy for users to follow.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {(!recommendations || recommendations.length === 0) ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', gridColumn: '1 / -1' }}>
            No recommendations currently active. Your spending habits are optimal!
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="glass-card glass-card-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="badge badge-indigo">{rec.category}</span>
                  <span className={`badge ${rec.priority === 'High' ? 'badge-rose' : rec.priority === 'Medium' ? 'badge-amber' : 'badge-cyan'}`}>
                    {rec.priority} Priority
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
                    +₹{rec.estimated_savings.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Estimated Monthly Savings</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: '1.5', marginBottom: '20px' }}>
                  {rec.recommendation_text}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Status: {rec.status}</span>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => alert(`Target recommendation for '${rec.category}' applied to your monthly budget goals!`)}
                >
                  Apply Goal <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
