import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import {
  ArrowDownUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export function SmartBillPrioritization() {
  const { billRanking, balanceDetails, markExpensePaid, setActiveRoute } = useApp();
  const [filterPriority, setFilterPriority] = useState('all');

  const { rankedBills, topRecommendations } = billRanking;

  const filteredBills = rankedBills.filter(b => {
    if (filterPriority === 'all') return true;
    return b.priority === filterPriority;
  });

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Smart Bill Prioritization</h1>
          <p className="page-subtitle">
            What should I pay first? Mathematical ranking based on credit risk, late fee penalties, grace periods, and your current liquidity runway.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveRoute('expenses')}
        >
          <span>Manage Expenses</span>
        </button>
      </div>

      {/* Top 3 Recommended Actions Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {topRecommendations.map((rec, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '18px 20px',
              borderLeftWidth: 4,
              borderLeftColor: rec.type === 'critical' ? '#D64545' : rec.type === 'warning' ? '#D99116' : '#635BFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {rec.type === 'critical' ? (
                <AlertTriangle size={16} color="#D64545" />
              ) : rec.type === 'warning' ? (
                <Clock size={16} color="#D99116" />
              ) : (
                <Zap size={16} color="#635BFF" />
              )}
              <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: '#172033' }}>{rec.title}</h4>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0 }}>
              {rec.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
          {[
            { id: 'all', label: 'All Ranked Bills' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low / Deferrable' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              style={{
                border: 'none',
                background: filterPriority === tab.id ? '#FFFFFF' : 'transparent',
                color: filterPriority === tab.id ? '#635BFF' : '#64748B',
                fontWeight: filterPriority === tab.id ? 700 : 500,
                fontSize: 12.5,
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
              onClick={() => setFilterPriority(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#64748B' }}>
          Available Cash to Allocate: <strong style={{ color: '#159A72', fontSize: 13 }}>{formatINR(balanceDetails.availableCash)}</strong>
        </div>
      </div>

      {/* Ranked Bills Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {filteredBills.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#98A2B3' }}>
            No unpaid bills in this priority tier.
          </div>
        ) : (
          filteredBills.map((bill, index) => (
            <div
              key={bill.id}
              className="card"
              style={{
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'auto 1.5fr 1.5fr 1fr auto',
                alignItems: 'center',
                gap: 20
              }}
            >
              {/* Rank Number & Priority Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#94A3B8' }}>
                  #{index + 1}
                </span>
                <span className={`priority-tier-badge ${bill.priority}`}>
                  {bill.priority}
                </span>
              </div>

              {/* Bill Details */}
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#172033', margin: '0 0 4px 0' }}>
                  {bill.title}
                </h4>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Due <strong>{bill.dueDate}</strong> • Category: {bill.category}
                </div>
                {bill.lateFee > 0 && (
                  <div style={{ fontSize: 11.5, color: '#D64545', fontWeight: 600, marginTop: 3 }}>
                    Penalty: ₹{formatINR(bill.lateFee)} after grace
                  </div>
                )}
              </div>

              {/* Explainable Ranking Reason */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 4 }}>
                  Why this ranking?
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                  {bill.reasons.join(' • ')}
                </div>
              </div>

              {/* Expected Effect on Balance & Action */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 2 }}>
                  Amount & Effect
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#172033', fontFeatureSettings: 'tnum' }}>
                  {formatINR(bill.amount)}
                </div>
                <div style={{ fontSize: 11, color: bill.postPaymentBalance >= 0 ? '#159A72' : '#D64545', marginTop: 2 }}>
                  Leaves {formatINR(bill.postPaymentBalance)} cash
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#635BFF', marginTop: 4 }}>
                  {bill.suggestedAction}
                </div>
              </div>

              {/* Pay Action Button */}
              <div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '7px 12px' }}
                  onClick={() => markExpensePaid(bill.id)}
                >
                  <CheckCircle2 size={13} />
                  <span>Mark Paid</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimers & Methodology Note */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 18px', fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
        <strong style={{ color: '#172033' }}>Ranking Methodology: </strong>
        Bills are evaluated across 5 explainable factors: due date proximity, debt/credit bureau impact (EMI & Rent), essential survival status, punitive late fee penalties, and grace period leeway. Prioritization is for scenario planning and does not constitute formal legal or financial advice.
      </div>

    </div>
  );
}
