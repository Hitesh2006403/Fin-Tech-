import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import { CashFlowChart } from '../components/charts/CashFlowChart.jsx';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Receipt,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';

export function OverviewDashboard() {
  const {
    user,
    balanceDetails,
    safeToSpend,
    confirmedUpcomingIncome,
    upcomingBillsNext7Days,
    standardForecast,
    dashboardInsights,
    expenses,
    incomes,
    setActiveRoute,
    setQuickAddModalOpen,
    preferences
  } = useApp();

  const hasRecords = incomes.length > 0 || expenses.length > 0;

  // Unpaid bills up to 5
  const upcomingBills = expenses
    .filter(e => e.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Combined recent activity (last 5 transactions)
  const recentTransactions = [
    ...incomes.filter(i => i.status === 'received').map(i => ({
      id: i.id,
      title: i.title,
      category: i.source || 'Client Payout',
      date: i.actualDate || i.expectedDate,
      amount: i.amount,
      type: 'income',
      status: 'Received'
    })),
    ...expenses.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      date: e.paidDate || e.dueDate,
      amount: e.amount,
      type: 'expense',
      status: e.status === 'paid' ? 'Paid' : 'Unpaid'
    }))
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Income Reliability totals
  const totalReceived = incomes
    .filter(i => i.status === 'received')
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalConfirmed = incomes
    .filter(i => i.status === 'confirmed')
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalUncertain = incomes
    .filter(i => i.status === 'uncertain')
    .reduce((s, i) => s + Number(i.amount), 0);
  const grandTotalPipeline = totalReceived + totalConfirmed + totalUncertain || 1;

  if (!hasRecords) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F0EFFF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172033', marginBottom: 8 }}>
          Welcome to Uncertain Income Planner, {user.name}
        </h2>
        <p style={{ color: '#667085', maxWidth: 460, marginBottom: 28, fontSize: 15, lineHeight: 1.5 }}>
          Take the stress out of irregular earnings. Record your current cash, upcoming gigs, and essential bills to see your true Safe-to-Spend.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => { setActiveRoute('income'); setQuickAddModalOpen(true); }}
          >
            <Plus size={16} />
            <span>Add Your First Income</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setActiveRoute('expenses'); setQuickAddModalOpen(true); }}
          >
            <Receipt size={16} />
            <span>Add Your First Bill</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* A. Header Row */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#635BFF', letterSpacing: 0.6 }}>
              TREASURY OVERVIEW
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>Irregular Cash-Flow Engine</span>
          </div>
          <h1 className="page-title">Good day, {user.name}</h1>
          <p className="page-subtitle">
            Here's your real-time spendable cash, protected obligations, and 30-day runway.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setQuickAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Prominent Data-Driven Financial Insight Bar */}
      {dashboardInsights.primaryInsight && (
        <div
          style={{
            background: dashboardInsights.primaryInsight.type === 'danger' ? '#FEF2F2' : dashboardInsights.primaryInsight.type === 'warning' ? '#FFFBEB' : '#F0EFFF',
            border: `1px solid ${dashboardInsights.primaryInsight.type === 'danger' ? '#FECACA' : dashboardInsights.primaryInsight.type === 'warning' ? '#FDE68A' : '#E0E7FF'}`,
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {dashboardInsights.primaryInsight.type === 'danger' ? (
              <AlertTriangle size={18} color="#D64545" />
            ) : dashboardInsights.primaryInsight.type === 'warning' ? (
              <Clock size={18} color="#D99116" />
            ) : (
              <Sparkles size={18} color="#635BFF" />
            )}
            <div>
              <strong style={{ fontSize: 13, color: '#172033', marginRight: 6 }}>
                {dashboardInsights.primaryInsight.title}:
              </strong>
              <span style={{ fontSize: 13, color: '#475569' }}>
                {dashboardInsights.primaryInsight.message}
              </span>
            </div>
          </div>

          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#635BFF',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            onClick={() => setActiveRoute('simulator')}
          >
            <span>Simulate Scenario</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* B. Exactly Four Primary KPI Cards */}
      <div className="kpi-cards-grid-4">
        {/* Card 1: Available Balance */}
        <div className="kpi-card" onClick={() => setActiveRoute('income')}>
          <div className="kpi-top-row">
            <span className="kpi-label">Available Balance</span>
            <div className="kpi-icon-container blue">
              <Wallet size={18} />
            </div>
          </div>
          <div className="kpi-amount-val">
            {formatINR(balanceDetails.availableCash)}
          </div>
          <div className="kpi-subtitle-meta">
            <span>Based on recorded transactions.</span>
            <span className="kpi-status-badge positive">Live Cash</span>
          </div>
        </div>

        {/* Card 2: Safe-to-Spend Today */}
        <div className="kpi-card" onClick={() => setActiveRoute('safe-to-spend')} style={{ borderColor: safeToSpend.safeToSpendToday > 0 ? '#C7D2FE' : '#FECACA' }}>
          <div className="kpi-top-row">
            <span className="kpi-label">Safe-to-Spend Today</span>
            <div className="kpi-icon-container purple">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-amount-val" style={{ color: safeToSpend.safeToSpendToday > 0 ? '#635BFF' : '#D64545' }}>
            {formatINR(safeToSpend.safeToSpendToday)}
          </div>
          <div className="kpi-subtitle-meta">
            <span>After planned commitments.</span>
            {safeToSpend.projectedShortfall > 0 ? (
              <span className="kpi-status-badge warning">Buffer Protected</span>
            ) : (
              <span className="kpi-status-badge positive">Safe Buffer Intact</span>
            )}
          </div>
        </div>

        {/* Card 3: Confirmed Upcoming Income */}
        <div className="kpi-card" onClick={() => setActiveRoute('income')}>
          <div className="kpi-top-row">
            <span className="kpi-label">Confirmed Upcoming Income</span>
            <div className="kpi-icon-container emerald">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-amount-val" style={{ color: '#159A72' }}>
            +{formatINR(confirmedUpcomingIncome)}
          </div>
          <div className="kpi-subtitle-meta">
            <span>Expected, not yet available.</span>
            <span className="kpi-status-badge neutral">Contracts Signed</span>
          </div>
        </div>

        {/* Card 4: Upcoming Bills */}
        <div className="kpi-card" onClick={() => setActiveRoute('expenses')}>
          <div className="kpi-top-row">
            <span className="kpi-label">Upcoming Bills</span>
            <div className="kpi-icon-container amber">
              <Receipt size={18} />
            </div>
          </div>
          <div className="kpi-amount-val" style={{ color: '#D99116' }}>
            {formatINR(upcomingBillsNext7Days)}
          </div>
          <div className="kpi-subtitle-meta">
            <span>Due in the next 7 days.</span>
            <span className="kpi-status-badge warning">Committed</span>
          </div>
        </div>
      </div>

      {/* C. Main Content Layout (Two Columns) */}
      <div className="dashboard-grid-2col">
        {/* Left Column: 30-Day Cash Flow Forecast Chart */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title-h3">30-Day Cash Flow Trajectory</h3>
              <p className="card-subtitle-p">
                Projected cash balance against safety buffer ({formatINR(preferences.safetyBuffer)}).
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => setActiveRoute('forecast')}
            >
              <span>Full Forecast</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <CashFlowChart
            forecastData={standardForecast.forecast}
            safetyBuffer={preferences.safetyBuffer}
            startingBalance={balanceDetails.availableCash}
            height={260}
            showControls={false}
          />
        </div>

        {/* Right Column: Upcoming Bills & High Priority Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Upcoming Bills (Max 5) */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div className="card-header-flex" style={{ marginBottom: 12 }}>
              <h3 className="card-title-h3" style={{ fontSize: 15 }}>Upcoming Bills</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#635BFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setActiveRoute('expenses')}
              >
                View all ({expenses.filter(e => e.status !== 'paid').length})
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <p style={{ color: '#98A2B3', fontSize: 13, margin: '14px 0' }}>No unpaid bills on schedule.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingBills.map(bill => (
                  <div
                    key={bill.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#F8FAFC',
                      borderRadius: 8,
                      border: '1px solid #F1F5F9'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#172033' }}>{bill.title}</div>
                      <div style={{ fontSize: 11, color: '#667085' }}>Due {bill.dueDate} • {bill.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>{formatINR(bill.amount)}</div>
                      {bill.isEssential ? (
                        <span style={{ fontSize: 10, color: '#D64545', fontWeight: 600 }}>Essential</span>
                      ) : (
                        <span style={{ fontSize: 10, color: '#667085' }}>Discretionary</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Alerts (Max 3) */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div className="card-header-flex" style={{ marginBottom: 12 }}>
              <h3 className="card-title-h3" style={{ fontSize: 15 }}>Financial Alerts</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#635BFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setActiveRoute('notifications')}
              >
                Notification Center
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {dashboardInsights.alerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: alert.severity === 'critical' ? '#FEF2F2' : alert.severity === 'warning' ? '#FFFBEB' : '#F8FAFC',
                    border: `1px solid ${alert.severity === 'critical' ? '#FECACA' : alert.severity === 'warning' ? '#FDE68A' : '#E2E8F0'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    cursor: 'pointer'
                  }}
                  onClick={() => alert.actionPage && setActiveRoute(alert.actionPage)}
                >
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={15} color="#D64545" style={{ flexShrink: 0, marginTop: 2 }} />
                  ) : alert.severity === 'warning' ? (
                    <Clock size={15} color="#D99116" style={{ flexShrink: 0, marginTop: 2 }} />
                  ) : (
                    <CheckCircle2 size={15} color="#159A72" style={{ flexShrink: 0, marginTop: 2 }} />
                  )}
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#172033' }}>{alert.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.35 }}>{alert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* D. Bottom Row: Recent Activity & Income Reliability Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        
        {/* Recent Activity Table (Max 5) */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title-h3">Recent Activity</h3>
              <p className="card-subtitle-p">Cleared and committed financial transactions.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => setActiveRoute('expenses')}
            >
              <span>View all transactions</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600 }}>{tx.title}</td>
                    <td style={{ color: '#64748B', fontSize: 12.5 }}>{tx.date}</td>
                    <td style={{ color: '#64748B', fontSize: 12.5 }}>{tx.category}</td>
                    <td className="num-val" style={{ color: tx.type === 'income' ? '#159A72' : '#172033' }}>
                      {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                    </td>
                    <td>
                      <span className={`badge ${tx.status === 'Received' || tx.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Income Reliability Breakdown */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title-h3">Income Reliability</h3>
              <p className="card-subtitle-p">Quality distribution of incoming cash flow.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => setActiveRoute('income')}
            >
              <span>Manage</span>
            </button>
          </div>

          {/* Segmented Progress Bar */}
          <div style={{ height: 10, borderRadius: 5, background: '#E2E8F0', overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
            <div style={{ width: `${(totalReceived / grandTotalPipeline) * 100}%`, background: '#159A72' }} title="Received" />
            <div style={{ width: `${(totalConfirmed / grandTotalPipeline) * 100}%`, background: '#635BFF' }} title="Confirmed" />
            <div style={{ width: `${(totalUncertain / grandTotalPipeline) * 100}%`, background: '#D99116' }} title="Uncertain" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#159A72' }}></span>
                <span style={{ color: '#172033', fontWeight: 600 }}>Received (In Cash)</span>
              </div>
              <strong style={{ color: '#159A72', fontFeatureSettings: 'tnum' }}>{formatINR(totalReceived)}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#635BFF' }}></span>
                <span style={{ color: '#172033', fontWeight: 600 }}>Confirmed (Invoices/Contracts)</span>
              </div>
              <strong style={{ color: '#635BFF', fontFeatureSettings: 'tnum' }}>{formatINR(totalConfirmed)}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D99116' }}></span>
                <span style={{ color: '#172033', fontWeight: 600 }}>Uncertain (Pipeline/Pitches)</span>
              </div>
              <strong style={{ color: '#D99116', fontFeatureSettings: 'tnum' }}>{formatINR(totalUncertain)}</strong>
            </div>
          </div>

          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #F1F5F9', fontSize: 12, color: '#667085', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: '#172033' }}>Rule of Thumb:</span> Only Received cash is spent today. Confirmed income powers upcoming obligations; Uncertain income is excluded from baseline safety.
          </div>
        </div>

      </div>

    </div>
  );
}
