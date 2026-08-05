import React, { useState } from 'react';
import { transactionAPI } from '../api';
import { X, ShieldAlert } from 'lucide-react';

export const AddTransactionModal = ({ isOpen, onClose, onRefresh }) => {
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [source, setSource] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [location, setLocation] = useState('Home City');
  const [device, setDevice] = useState('Primary Phone');
  const [loading, setLoading] = useState(false);
  const [fraudFeedback, setFraudFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFraudFeedback(null);

    try {
      if (type === 'income') {
        await transactionAPI.addIncome({
          title,
          amount: parseFloat(amount),
          category: category || 'Salary',
          source: source || 'Main Employer'
        });
        onRefresh();
        onClose();
      } else {
        const res = await transactionAPI.addExpense({
          title,
          amount: parseFloat(amount),
          category,
          merchant: merchant || 'General Store',
          payment_method: paymentMethod,
          location,
          device,
        });

        if (res.data.is_suspicious) {
          setFraudFeedback({
            isSuspicious: true,
            score: res.data.anomaly_score,
            message: `⚠ AI Fraud Warning (Risk Score: ${Math.round(res.data.anomaly_score * 100)}%): Unusually high or out-of-context transaction recorded and flagged for review!`
          });
          onRefresh();
        } else {
          onRefresh();
          onClose();
        }
      }
    } catch (err) {
      console.error("Error adding transaction", err);
      alert("Failed to save transaction. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'expense' 
    ? ['Food', 'Shopping', 'Travel', 'Recharge', 'Movies', 'Bills', 'Medical', 'Maintenance', 'Other']
    : ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Add New Transaction</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {fraudFeedback && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600' }}>Transaction Saved & Flagged</div>
              <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>{fraudFeedback.message}</div>
              <button className="btn btn-secondary" style={{ marginTop: '10px', fontSize: '0.75rem', padding: '4px 10px' }} onClick={onClose}>
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('Food'); }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                background: type === 'expense' ? 'var(--accent-cyan)' : 'transparent',
                color: type === 'expense' ? '#fff' : '#9ca3af', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('Salary'); }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                background: type === 'income' ? 'var(--accent-emerald)' : 'transparent',
                color: type === 'income' ? '#fff' : '#9ca3af', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Income (+)
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Title / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Order, Laptop Repair, Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="₹0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {type === 'expense' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy, Amazon, Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Location Context</label>
                  <input
                    type="text"
                    placeholder="Home City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Device</label>
                  <input
                    type="text"
                    placeholder="Primary Phone"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Employer / Source</label>
              <input
                type="text"
                placeholder="e.g. Main Employer, Client Name"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Evaluating AI...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
