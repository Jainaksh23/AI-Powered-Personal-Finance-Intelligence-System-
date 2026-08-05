import React, { useState, useEffect } from 'react';
import { User, Key, Shield, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';

export const ProfilePage = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [alertThreshold, setAlertThreshold] = useState(user?.alert_threshold || 80.0);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [auditLogs, setAuditLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await userAPI.getAuditLogs();
        setAuditLogs(res.data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      }
    };
    fetchAudit();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile({
        name,
        currency,
        alert_threshold: parseFloat(alertThreshold)
      });
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updatePassword({ current_password: currentPassword, new_password: newPassword });
      setPwdMsg("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPwdMsg(''), 3000);
    } catch (err) {
      setPwdMsg("Failed to update password. Check current password.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Profile & System Settings</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
          Manage user credentials, currency preferences, budget threshold alerts, and security audit logs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Profile Settings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#06b6d4" /> Personal Information
          </h3>

          {msg && <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '12px' }}>{msg}</div>}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Email Address</label>
              <input type="text" className="input-field" disabled value={user?.email || ''} style={{ opacity: 0.6 }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Full Name</label>
              <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Preferred Currency</label>
                <select className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Budget Alert Threshold (%)</label>
                <input type="number" className="input-field" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Save Profile Settings
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#818cf8" /> Security & Password
          </h3>

          {pwdMsg && <div style={{ color: pwdMsg.includes('Failed') ? '#f43f5e' : '#10b981', fontSize: '0.85rem', marginBottom: '12px' }}>{pwdMsg}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Current Password</label>
              <input type="password" className="input-field" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>New Password</label>
              <input type="password" className="input-field" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ marginTop: '8px' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#f43f5e" /> Security Audit Log
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
                <th style={{ padding: '10px 14px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#38bdf8' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#f3f4f6' }}>
                      {log.details || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
