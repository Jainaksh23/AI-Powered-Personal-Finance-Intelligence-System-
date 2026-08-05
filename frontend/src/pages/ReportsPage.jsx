import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, PieChart, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { reportsAPI } from '../api';

export const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getSummary();
      setReport(res.data);
    } catch (err) {
      console.error("Error loading report summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await reportsAPI.downloadPdf();
      const contentType = res.headers['content-type'] || 'application/pdf';
      const isTxt = contentType.includes('text/plain');
      const filename = isTxt ? `financial_report_${new Date().toISOString().slice(0,10)}.txt` : `financial_report_${new Date().toISOString().slice(0,10)}.pdf`;

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF report", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Generating Financial Intelligence Report...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Monthly Intelligence Report</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Period: <b>{report?.report_date}</b> • Prepared for <b>{report?.user_name}</b>
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={downloading}>
          <Download size={18} /> {downloading ? 'Preparing PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Income</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '8px' }}>
            {report?.currency} {report?.total_income.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Total Expense</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f43f5e', marginTop: '8px' }}>
            {report?.currency} {report?.total_expense.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Net Surplus Savings</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06b6d4', marginTop: '8px' }}>
            {report?.currency} {report?.net_savings.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Savings Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#818cf8', marginTop: '8px' }}>
            {report?.savings_rate}%
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="#06b6d4" /> Category Spend Distribution
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Spent</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Share of Expenses</th>
            </tr>
          </thead>
          <tbody>
            {report?.category_reports.map((cat, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>{cat.category}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#f3f4f6' }}>
                  {report.currency} {cat.total_spent.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#06b6d4', fontWeight: '700' }}>
                  {cat.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Budget Summary Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#818cf8" /> Monthly Budget Compliance
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Monthly Limit</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actual Spend</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {report?.budget_reports.map((b, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>{b.category}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{report.currency} {b.monthly_limit.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{report.currency} {b.spent.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${b.status === 'Exceeded' ? 'badge-rose' : 'badge-emerald'}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
