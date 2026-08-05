import React from 'react';
import { LayoutDashboard, ArrowDownRight, ArrowUpRight, PieChart, Sparkles, FileText, User, Smartphone } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, fraudCount, pendingAutoCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Smart Dashboard', icon: LayoutDashboard },
    { id: 'auto-detection', label: 'Smart Auto Detection', icon: Smartphone, badge: 'Auto', count: pendingAutoCount },
    { id: 'income', label: 'Income Management', icon: ArrowUpRight },
    { id: 'expenses', label: 'Expense Management', icon: ArrowDownRight },
    { id: 'budgets', label: 'Budget & Goals', icon: PieChart },
    { id: 'ai-insights', label: 'AI Intelligence Hub', icon: Sparkles, badge: 'ML', count: fraudCount },
    { id: 'reports', label: 'Reports & PDF', icon: FileText },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <aside className="glass-card" style={{ width: '260px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px 12px 12px' }}>
        Intelligence Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))' : 'transparent',
              color: isActive ? '#06b6d4' : '#9ca3af',
              borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={18} color={isActive ? '#06b6d4' : '#9ca3af'} />
              <span>{item.label}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {item.count > 0 && (
                <span className="badge badge-rose" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span className="badge badge-cyan" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '4px' }}>PFIS Intelligence</div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.4' }}>
          Auto SMS Detection • ML Fraud Defense • Budgeting
        </div>
      </div>
    </aside>
  );
};
