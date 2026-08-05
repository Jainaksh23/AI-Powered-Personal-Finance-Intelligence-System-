import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, badgeText, badgeType = 'cyan', accentColor = '#06b6d4' }) => {
  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>{title}</span>
        {Icon && (
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={accentColor} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '6px' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        <span style={{ color: '#9ca3af' }}>{subtext}</span>
        {badgeText && (
          <span className={`badge badge-${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
