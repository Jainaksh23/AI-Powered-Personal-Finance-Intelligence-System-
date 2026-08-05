import React, { useState, useEffect } from 'react';
import { Smartphone, Check, Edit3, X, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { autoDetectionAPI } from '../api';

export const AutoDetectionPage = ({ onRefreshData }) => {
  const [pendingDetections, setPendingDetections] = useState([]);
  const [historyDetections, setHistoryDetections] = useState([]);
  const [smsText, setSmsText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food');
  const [editMerchant, setEditMerchant] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI');

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const [pendRes, histRes] = await Promise.all([
        autoDetectionAPI.getPending(),
        autoDetectionAPI.getHistory()
      ]);
      setPendingDetections(pendRes.data);
      setHistoryDetections(histRes.data);
    } catch (err) {
      console.error("Failed to fetch auto detections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  const handleParseSMS = async (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    setParsing(true);
    setNotification(null);
    try {
      const res = await autoDetectionAPI.parseSMS(smsText);
      const parsedItem = res.data;
      setSmsText('');
      setNotification({
        type: 'success',
        message: `✅ Successfully extracted ₹${parsedItem.amount} at ${parsedItem.merchant} (${parsedItem.category})! Added to Pending Queue.`
      });
      fetchDetections();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("SMS parsing failed", err);
      setNotification({
        type: 'error',
        message: "❌ Failed to parse SMS. Please check format or try a sample preset."
      });
    } finally {
      setParsing(false);
    }
  };

  const handleQuickSample = (sampleText) => {
    setSmsText(sampleText);
  };

  const handleConfirm = async (id) => {
    try {
      await autoDetectionAPI.confirmTransaction(id);
      setNotification({
        type: 'success',
        message: "✅ Transaction confirmed and promoted to your Expense ledger!"
      });
      fetchDetections();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Confirmation failed", err);
    }
  };

  const handleIgnore = async (id) => {
    try {
      await autoDetectionAPI.ignoreTransaction(id);
      fetchDetections();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Ignore action failed", err);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmount(item.amount.toString());
    setEditCategory(item.category);
    setEditMerchant(item.merchant);
    setEditPaymentMethod(item.payment_method);
  };

  const handleSaveEditConfirm = async (e) => {
    e.preventDefault();
    try {
      await autoDetectionAPI.editConfirmTransaction(editingItem.id, {
        title: editTitle,
        amount: parseFloat(editAmount),
        category: editCategory,
        merchant: editMerchant,
        payment_method: editPaymentMethod
      });
      setEditingItem(null);
      setNotification({
        type: 'success',
        message: "✅ Edited & Confirmed transaction!"
      });
      fetchDetections();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Edit confirm failed", err);
    }
  };

  const handleSimulateBankApi = async () => {
    try {
      const res = await autoDetectionAPI.simulateBankAPI({
        account_id: "HDFC-BANK-ACCT-9912",
        amount: 1850.0,
        merchant: "Croma Electronics",
        payment_method: "Credit Card"
      });
      setNotification({
        type: 'success',
        message: `✅ Open Banking Webhook Ingested: ₹${res.data.amount} at ${res.data.merchant} (${res.data.category})!`
      });
      fetchDetections();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Bank API simulation failed", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: '600', letterSpacing: '0.05em' }}>AUTOMATED INGESTION</span>
            <span className="badge badge-emerald" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>
              SMS Engine Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Smart Auto Expense Detection Engine</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Eliminate manual entry: Parse SMS notifications, classify merchants via AI, detect duplicates, and confirm with 1 click.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleSimulateBankApi} style={{ gap: '8px', borderColor: '#818cf8', color: '#818cf8' }}>
          <Sparkles size={16} /> Simulate Open Bank API Ingestion
        </button>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div style={{
          background: notification.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: notification.type === 'error' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: notification.type === 'error' ? '#fb7185' : '#34d399',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between'
        }}>
          <div>{notification.message}</div>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* SMS Parser Sandbox Box */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="#06b6d4" /> SMS Transaction Parser Sandbox
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px' }}>
          Paste any bank transaction SMS text below or click a sample preset to extract amount, merchant, payment mode, and AI category.
        </p>

        <form onSubmit={handleParseSMS} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            className="input-field"
            rows={3}
            required
            placeholder="Paste raw bank transaction SMS text (e.g. Rs.350 debited from A/C XXXX1234 via UPI. Paid to Domino's. Ref 992812.)"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* Quick Sample Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>Sample Presets:</span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleQuickSample("Rs.350 debited from A/C XXXX1234 via UPI. Paid to Domino's. Ref 992812.")}
              >
                Domino's ₹350
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleQuickSample("Rs 420 spent at Uber India via Paytm UPI. Ref 998231.")}
              >
                Uber ₹420
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleQuickSample("INR 2,450.00 spent at Amazon via HDFC Credit Card. Ref 881920.")}
              >
                Amazon ₹2,450
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleQuickSample("Rs.650 debited for Swiggy Order via PhonePe UPI. Ref 772391.")}
              >
                Swiggy ₹650
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={parsing}>
              <Send size={16} /> {parsing ? 'Parsing...' : 'Parse & Auto Detect'}
            </button>
          </div>
        </form>
      </div>

      {/* Pending Confirmations Queue */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Pending Confirmations Queue
            {pendingDetections.length > 0 && (
              <span className="badge badge-rose" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                {pendingDetections.length} Action Needed
              </span>
            )}
          </h3>

          <button className="btn btn-secondary" onClick={fetchDetections} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading Pending Auto Detections...</div>
        ) : pendingDetections.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#f3f4f6' }}>Queue Completely Clear</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>All auto-detected expenses have been confirmed or reviewed.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {pendingDetections.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: item.duplicate_flag ? '1px solid rgba(245, 158, 11, 0.5)' : (item.is_suspicious ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(255,255,255,0.08)') }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem', marginBottom: '6px', display: 'inline-block' }}>
                      {item.category}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f3f4f6', margin: 0 }}>
                      {item.title}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                      Merchant: <b>{item.merchant}</b> • {item.payment_method}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f43f5e' }}>
                      ₹{item.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>
                      {Math.round(item.confidence_score * 100)}% AI Match
                    </div>
                  </div>
                </div>

                {/* Warnings / Flags */}
                {item.duplicate_flag && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} /> <b>Possible Duplicate Detected!</b> Similar transaction recorded within 24h.
                  </div>
                )}

                {item.is_suspicious && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} /> {item.fraud_reason || "AI IsolationForest Flagged Fraud Risk"}
                  </div>
                )}

                {/* Raw SMS / Payload Preview */}
                {item.raw_data && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                    "{item.raw_data}"
                  </div>
                )}

                {/* Confirmation Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem', gap: '6px' }}
                    onClick={() => handleConfirm(item.id)}
                  >
                    <Check size={16} /> Confirm
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', gap: '6px' }}
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Edit3 size={15} /> Edit
                  </button>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', gap: '6px' }}
                    onClick={() => handleIgnore(item.id)}
                  >
                    <X size={15} /> Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detection History Audit Log */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Auto Detection Audit History</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                <th style={{ padding: '10px 14px' }}>Date</th>
                <th style={{ padding: '10px 14px' }}>Title & Merchant</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Source</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyDetections.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No auto detection history records found.
                  </td>
                </tr>
              ) : (
                historyDetections.map((hist) => (
                  <tr key={hist.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                      {new Date(hist.date).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>
                      {hist.title} ({hist.merchant})
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{hist.category}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                      {hist.transaction_source}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#f43f5e' }}>
                      ₹{hist.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span className={`badge ${hist.verification_status === 'Confirmed' ? 'badge-emerald' : (hist.verification_status === 'Ignored' ? 'badge-rose' : 'badge-amber')}`}>
                        {hist.verification_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Before Confirm Modal */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Edit & Confirm Transaction</h3>

            <form onSubmit={handleSaveEditConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Title</label>
                <input type="text" className="input-field" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
                <input type="number" step="0.01" className="input-field" required value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Category</label>
                  <select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Recharge">Recharge</option>
                    <option value="Movies">Movies</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Medical">Medical</option>
                    <option value="Bills">Bills</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Merchant</label>
                  <input type="text" className="input-field" value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Confirm Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
