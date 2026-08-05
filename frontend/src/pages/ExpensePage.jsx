import React, { useState } from 'react';
import { Plus, Trash2, Edit3, ShieldAlert, Search, Filter } from 'lucide-react';
import { transactionAPI } from '../api';

export const ExpensePage = ({ expenses, onRefresh, onOpenAddModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form edit fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.merchant && exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || exp.category === categoryFilter;
    const matchesPay = paymentFilter === 'All' || exp.payment_method === paymentFilter;
    return matchesSearch && matchesCat && matchesPay;
  });

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const suspiciousCount = expenses.filter(e => e.is_suspicious).length;

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setCategory(exp.category || 'Food');
    setMerchant(exp.merchant || '');
    setPaymentMethod(exp.payment_method || 'UPI');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.updateExpense(editingExpense.id, {
        title,
        amount: parseFloat(amount),
        category,
        merchant,
        payment_method: paymentMethod
      });
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to update expense", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      try {
        await transactionAPI.deleteExpense(id);
        onRefresh();
      } catch (err) {
        console.error("Failed to delete expense", err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Expense Management</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Track daily transactions, merchant details, payment modes, and ML fraud flags.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} /> Add New Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Recorded Expenses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f43f5e', marginTop: '8px' }}>
            ₹{totalExpenseAmount.toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Suspicious Flagged Transactions</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: suspiciousCount > 0 ? '#f43f5e' : '#10b981', marginTop: '8px' }}>
            {suspiciousCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search expense title or merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <select className="input-field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Recharge">Recharge</option>
          <option value="Movies">Movies</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Bills">Bills</option>
        </select>

        <select className="input-field" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="All">All Payment Modes</option>
          <option value="UPI">UPI</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Cash">Cash</option>
        </select>
      </div>

      {/* Expense Table */}
      <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
              <th style={{ padding: '16px 20px' }}>Title & Merchant</th>
              <th style={{ padding: '16px 20px' }}>Category</th>
              <th style={{ padding: '16px 20px' }}>Payment Mode</th>
              <th style={{ padding: '16px 20px' }}>Date</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No expense records match your filter parameters.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {exp.title}
                      {exp.is_suspicious && (
                        <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={12} /> Fraud Risk
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      Merchant: {exp.merchant || 'General Store'}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span className="badge badge-cyan">{exp.category}</span>
                  </td>

                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>
                    {exp.payment_method || 'UPI'}
                  </td>

                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>
                    {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#f43f5e' }}>
                    -₹{exp.amount.toLocaleString()}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: '12px' }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Edit Expense Record</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Expense Title</label>
                <input type="text" className="input-field" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
                <input type="number" step="0.01" className="input-field" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Category</label>
                  <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Recharge">Recharge</option>
                    <option value="Movies">Movies</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Bills">Bills</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Merchant</label>
                  <input type="text" className="input-field" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Payment Method</label>
                <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
