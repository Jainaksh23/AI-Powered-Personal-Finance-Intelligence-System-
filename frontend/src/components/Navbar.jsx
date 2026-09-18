import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, PlusCircle, LogOut, ShieldAlert, Sparkles, User, Mic, Menu } from 'lucide-react';

export const Navbar = ({ onOpenTransactionModal, onOpenVoiceModal, activeAlertsCount, toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-card navbar-container" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleSidebar}
          className="btn btn-secondary hide-on-desktop"
          style={{ padding: '8px', border: 'none', background: 'transparent' }}
        >
          <Menu size={24} color="#f3f4f6" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)' }}>
            <Brain size={24} color="#fff" />
          </div>
          <div>
            <h2 className="navbar-title" style={{ fontSize: '1.25rem', fontWeight: '700', background: 'linear-gradient(90deg, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PFIS</h2>
            <span className="navbar-subtitle" style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: '600', letterSpacing: '0.05em' }}>INTELLIGENCE SYSTEM</span>
          </div>
        </div>
        <span className="badge badge-indigo hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} /> AI Decision Support Active
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {activeAlertsCount > 0 && (
          <div className="badge badge-rose pulse-glow hide-on-mobile" style={{ padding: '6px 12px', cursor: 'pointer' }}>
            <ShieldAlert size={14} /> {activeAlertsCount} Fraud Risk Flagged
          </div>
        )}

        <button className="btn btn-secondary" onClick={onOpenVoiceModal} style={{ padding: '8px', gap: '6px', borderColor: '#06b6d4', color: '#38bdf8' }} title="AI Voice Copilot">
          <Mic size={18} color="#06b6d4" /> <span className="hide-on-mobile">AI Copilot</span>
        </button>

        <button className="btn btn-primary" onClick={onOpenTransactionModal} style={{ padding: '8px' }} title="Add Transaction">
          <PlusCircle size={18} /> <span className="hide-on-mobile">Add</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '600', color: '#f3f4f6' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</div>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ padding: '8px', borderRadius: '8px' }} 
            title="Logout"
          >
            <LogOut size={16} color="#f43f5e" />
          </button>
        </div>
      </div>
    </header>
  );
};
