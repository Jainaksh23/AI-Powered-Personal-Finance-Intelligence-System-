import React, { useState, useEffect } from 'react';
import { Plus, PieChart, AlertTriangle, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import { budgetAPI } from '../api';

export const BudgetsPage = ({ onRefreshData }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [category, setCategory] = useState('Food');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getBudgets();
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategory('Food');
    setMonthlyLimit('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setCategory(b.category);
    setMonthlyLimit(b.monthly_limit.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const limitVal = parseFloat(monthlyLimit);
      if (editingBudget) {
        await budgetAPI.updateBudget(editingBudget.id, { category, monthly_limit: limitVal });
      } else {
        await budgetAPI.createBudget({ category, monthly_limit: limitVal });
      }
      setIsModalOpen(false);
      fetchBudgets();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Failed to save budget", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget rule?")) {
      try {
        await budgetAPI.deleteBudget(id);
        fetchBudgets();
        if (onRefreshData) onRefreshData();
      } catch (err) {
        console.error("Failed to delete budget", err);
      }
    }
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallUtilization = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Budget Management & Goals</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Set category limits, monitor real-time utilization progress, and trigger over-budget alerts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Set Category Budget
        </button>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Budget Allocations</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06b6d4', marginTop: '8px' }}>
            ₹{totalLimit.toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Category Spend</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f3f4f6', marginTop: '8px' }}>
            ₹{totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Overall Utilization</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: overallUtilization > 100 ? '#f43f5e' : (overallUtilization > 80 ? '#f59e0b' : '#10b981'), marginTop: '8px' }}>
            {overallUtilization}%
          </div>
        </div>
      </div>

      {/* Budget Category Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading Budget Analytics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', gridColumn: '1 / -1', color: '#6b7280' }}>
              No budget allocations created yet. Click 'Set Category Budget' to begin tracking limits.
            </div>
          ) : (
            budgets.map((b) => {
              const utilPct = b.utilization_percentage;
              let barColor = '#10b981'; // Green safe
              let badgeClass = 'badge-emerald';

              if (b.status === 'Exceeded' || utilPct >= 100) {
                barColor = '#f43f5e'; // Red exceeded
                badgeClass = 'badge-rose';
              } else if (b.status === 'Warning' || utilPct >= 80) {
                barColor = '#f59e0b'; // Amber warning
                badgeClass = 'badge-amber';
              }

              return (
                <div key={b.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <PieChart size={20} color="#06b6d4" />
                      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f3f4f6' }}>{b.category}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${badgeClass}`}>{b.status}</span>
                      <button onClick={() => handleOpenEdit(b)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>
                      <span>Spent: <b>₹{b.spent.toLocaleString()}</b></span>
                      <span>Limit: <b>₹{b.monthly_limit.toLocaleString()}</b></span>
                    </div>

                    <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, utilPct)}%`, height: '100%', background: barColor, borderRadius: '6px', transition: 'width 0.4s ease' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '8px', color: '#6b7280' }}>
                      <span>Remaining: ₹{b.remaining.toLocaleString()}</span>
                      <span style={{ fontWeight: '700', color: barColor }}>{utilPct}% Used</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              {editingBudget ? `Update ${editingBudget.category} Budget` : 'Create Category Budget'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Category</label>
                <select
                  className="input-field"
                  disabled={!!editingBudget}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Recharge">Recharge</option>
                  <option value="Movies">Movies</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Monthly Spend Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  required
                  placeholder="e.g. 8000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
