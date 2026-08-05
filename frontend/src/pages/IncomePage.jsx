import React, { useState } from 'react';
import { Plus, Trash2, Edit3, ArrowUpRight, Search, DollarSign } from 'lucide-react';
import { transactionAPI } from '../api';

export const IncomePage = ({ incomes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [source, setSource] = useState('Main Employer');
  const [notes, setNotes] = useState('');

  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inc.source && inc.source.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || inc.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalIncomeAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setTitle('');
    setAmount('');
    setCategory('Salary');
    setSource('Main Employer');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc) => {
    setEditingIncome(inc);
    setTitle(inc.title);
    setAmount(inc.amount.toString());
    setCategory(inc.category || 'Salary');
    setSource(inc.source || 'Main Employer');
    setNotes(inc.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        amount: parseFloat(amount),
        category,
        source,
        notes
      };

      if (editingIncome) {
        await transactionAPI.updateIncome(editingIncome.id, payload);
      } else {
        await transactionAPI.addIncome(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save income", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      try {
        await transactionAPI.deleteIncome(id);
        onRefresh();
      } catch (err) {
        console.error("Failed to delete income", err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Income Management</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Track salary, freelance earnings, investments, and business cashflow.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Record New Income
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Recorded Income</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '8px' }}>
            ₹{totalIncomeAmount.toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Income Entries</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f3f4f6', marginTop: '8px' }}>
            {incomes.length}
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
            placeholder="Search by title or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <select
          className="input-field"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="All">All Categories</option>
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Investment">Investment</option>
          <option value="Business">Business</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Income Table */}
      <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
              <th style={{ padding: '16px 20px' }}>Title</th>
              <th style={{ padding: '16px 20px' }}>Category</th>
              <th style={{ padding: '16px 20px' }}>Source</th>
              <th style={{ padding: '16px 20px' }}>Date</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No income entries found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredIncomes.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{inc.title}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="badge badge-emerald">{inc.category || 'Salary'}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{inc.source || 'N/A'}</td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>
                    {inc.date ? new Date(inc.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                    +₹{inc.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenEdit(inc)}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: '12px' }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(inc.id)}
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

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
              {editingIncome ? 'Edit Income Entry' : 'Add New Income'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Income Title</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Monthly Salary, Freelance Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  required
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Category</label>
                  <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Source</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Employer / Client"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIncome ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
