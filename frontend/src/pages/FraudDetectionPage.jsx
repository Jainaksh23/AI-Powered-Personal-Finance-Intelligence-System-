import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ShieldCheck, Clock, MapPin, Smartphone, CreditCard } from 'lucide-react';

export const FraudDetectionPage = ({ fraudAlerts, onResolveAlert }) => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-rose pulse-glow">
              <ShieldAlert size={12} /> ISOLATION FOREST ML ENGINE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Real-Time Transaction Risk Scoring</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>AI Fraud & Anomaly Detection Center</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Multi-parameter risk analysis combining transaction amount, timestamp, location, and device telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-rose" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            {fraudAlerts ? fraudAlerts.length : 0} High-Risk Flags Recorded
          </span>
        </div>
      </div>

      {/* Chapter 6.2 Anomaly Showcase Banner */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} color="#fb7185" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '4px' }}>
              Behavioral & Telemetry Anomaly Detection
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Unlike simple threshold rules, PFIS evaluates transaction amount along with time (e.g. 3:15 AM), location (e.g. unverified city), device hardware ID, and credit card usage patterns to output an exact anomaly risk score (e.g. <strong>95% Fraud Probability</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* List of Flagged Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(!fraudAlerts || fraudAlerts.length === 0) ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <ShieldCheck size={48} color="#10b981" style={{ marginBottom: '12px', opacity: 0.8 }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f3f4f6' }}>All Clear! No Fraud Alerts Found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>All recent transactions align with normal spending behavior.</div>
          </div>
        ) : (
          fraudAlerts.map((alert) => {
            const riskPct = Math.round(alert.risk_score * 100);
            return (
              <div key={alert.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f43f5e' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f3f4f6' }}>
                        {alert.expense_title || 'Flagged Transaction'}
                      </h3>
                      <span className="badge badge-rose pulse-glow">
                        Risk Probability: {riskPct}%
                      </span>
                      <span className={`badge ${alert.status === 'Pending' ? 'badge-amber' : 'badge-emerald'}`}>
                        {alert.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                      Recorded on: {new Date(alert.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f43f5e' }}>
                      -₹{alert.expense_amount ? alert.expense_amount.toLocaleString('en-IN') : '80,000'}
                    </div>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                    AI Contextual Diagnostic:
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#e5e7eb', lineHeight: '1.5' }}>
                    {alert.reason}
                  </div>
                </div>

                {/* Resolution buttons */}
                {alert.status === 'Pending' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onResolveAlert(alert.id, 'Dismissed')}
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      Dismiss (It was Me)
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onResolveAlert(alert.id, 'Confirmed Fraud')}
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      Confirm Fraud & Block Card
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
