import React, { useState } from 'react';
import { Search, Filter, Trash2, ShieldAlert, PlusCircle, Calendar, Tag, CreditCard } from 'lucide-react';

export const TransactionsPage = ({ expenses, incomes, onDeleteExpense, onDeleteIncome, onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeType, setActiveType] = useState('expenses'); // 'expenses' or 'incomes'

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredIncomes = incomes.filter(i => {
    return i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Control Bar */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Transaction Ledger</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Detailed history of cash inflows and outflows with AI flags</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveType('expenses')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeType === 'expenses' ? 'var(--accent-cyan)' : 'transparent',
                color: activeType === 'expenses' ? '#fff' : '#9ca3af', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveType('incomes')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeType === 'incomes' ? 'var(--accent-emerald)' : 'transparent',
                color: activeType === 'incomes' ? '#fff' : '#9ca3af', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Incomes ({incomes.length})
            </button>
          </div>

          <button className="btn btn-primary" onClick={onOpenModal}>
            <PlusCircle size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
          />
        </div>

        {activeType === 'expenses' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#9ca3af" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Recharge">Recharge</option>
              <option value="Movies">Movies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Bills">Bills</option>
            </select>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeType === 'expenses' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: '#9ca3af' }}>
                <th style={{ padding: '14px 20px' }}>Date</th>
                <th style={{ padding: '14px 20px' }}>Title</th>
                <th style={{ padding: '14px 20px' }}>Category</th>
                <th style={{ padding: '14px 20px' }}>Method</th>
                <th style={{ padding: '14px 20px' }}>AI Flag</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No expenses found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: '0.85rem' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: '#f3f4f6' }}>
                      {exp.title}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-cyan">{exp.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: '0.85rem' }}>
                      {exp.payment_method}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {exp.is_suspicious ? (
                        <span className="badge badge-rose pulse-glow">
                          <ShieldAlert size={12} /> Fraud ({intVal(exp.anomaly_score * 100)}%)
                        </span>
                      ) : (
                        <span className="badge badge-emerald">Normal</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '700', color: '#f43f5e' }}>
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.7 }}
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: '#9ca3af' }}>
                <th style={{ padding: '14px 20px' }}>Date</th>
                <th style={{ padding: '14px 20px' }}>Source / Title</th>
                <th style={{ padding: '14px 20px' }}>Category</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No income records found.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: '0.85rem' }}>
                      {new Date(inc.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: '#f3f4f6' }}>
                      {inc.title}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-emerald">{inc.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                      +₹{inc.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => onDeleteIncome(inc.id)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.7 }}
                        title="Delete income"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

function intVal(val) {
  return Math.round(val || 0);
}
