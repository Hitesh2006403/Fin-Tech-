import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, calculateSafeToSpend, toISODate } from '../services/financialEngine.js';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export function SafeToSpendCalculator() {
  const { balanceDetails, incomes, expenses, preferences, setPreferences, setActiveRoute } = useApp();

  const [bufferInput, setBufferInput] = useState(preferences.safetyBuffer || 25000);
  const [horizonDays, setHorizonDays] = useState(30);
  const [scenario, setScenario] = useState('conservative'); // 'conservative' | 'expected'
  const [includeDiscretionary, setIncludeDiscretionary] = useState(true);

  // Live calculation from shared engine based on user slider adjustments
  const calculation = calculateSafeToSpend({
    availableCash: balanceDetails.availableCash,
    incomes,
    expenses,
    safetyBuffer: bufferInput,
    horizonDays,
    scenario,
    includeDiscretionary
  });

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Safe-to-Spend Calculator</h1>
          <p className="page-subtitle">
            The heart of irregular income peace of mind. Know exactly what you can spend today without compromising upcoming rent, loan EMIs, or emergency reserves.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveRoute('simulator')}
        >
          <span>Test in Delay Simulator</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Result: Distinctive Hero Banner */}
      <div className="safe-to-spend-hero-banner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.12)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          <ShieldCheck size={14} />
          <span>REAL-TIME DISCRETIONARY SPENDING LIMIT</span>
        </div>

        <div className="safe-spend-big-amount">
          {formatINR(calculation.safeToSpendToday)}
        </div>

        <p className="safe-spend-explainer">
          {calculation.safeToSpendToday > 0 ? (
            <>
              You can safely spend up to <strong>{formatINR(calculation.safeToSpendToday)}</strong> today. We have fully reserved <strong>{formatINR(calculation.safetyBuffer)}</strong> for your minimum safety buffer and quarantined <strong>{formatINR(calculation.totalObligationsProtected)}</strong> to guarantee your essential bills before your next reliable payout on <strong>{calculation.nextIncomeDate || 'schedule'}</strong>.
            </>
          ) : (
            <>
              <span style={{ color: '#FCA5A5', fontWeight: 700 }}>Caution: </span>
              Your planned commitments and required safety buffer exceed your currently recorded cash balance by <strong>{formatINR(calculation.projectedShortfall)}</strong>. Hold discretionary purchases until your next confirmed invoice arrives.
            </>
          )}
        </p>

        {calculation.projectedShortfall > 0 && (
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(220, 38, 38, 0.25)', border: '1px solid rgba(248, 113, 113, 0.4)', padding: '8px 14px', borderRadius: 8, fontSize: 13, color: '#FECACA' }}>
            <AlertTriangle size={16} />
            <span>Projected Liquidity Shortfall: {formatINR(calculation.projectedShortfall)}</span>
          </div>
        )}
      </div>

      {/* Two Column Section: Interactive Controls vs Transparent Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 24 }}>
        
        {/* Controls Column */}
        <div className="card">
          <h3 className="card-title-h3" style={{ marginBottom: 18 }}>Adjust Planning Assumptions</h3>

          {/* Safety Buffer Slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label-title" style={{ margin: 0 }}>
                Safety Buffer Target
              </label>
              <strong style={{ color: '#635BFF', fontFeatureSettings: 'tnum', fontSize: 15 }}>
                {formatINR(bufferInput)}
              </strong>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2500"
              className="interactive-slider-control"
              value={bufferInput}
              onChange={(e) => setBufferInput(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              <span>₹5,000 (Lean)</span>
              <span>₹50,000</span>
              <span>₹1,00,000 (Conservative)</span>
            </div>
          </div>

          {/* Planning Horizon */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label-title">Planning Horizon</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[7, 14, 30, 45].map(days => (
                <button
                  key={days}
                  type="button"
                  style={{
                    border: '1px solid #E2E8F0',
                    background: horizonDays === days ? '#635BFF' : '#F8FAFC',
                    color: horizonDays === days ? '#FFFFFF' : '#475569',
                    fontWeight: 600,
                    fontSize: 12.5,
                    padding: '8px 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setHorizonDays(days)}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Scenario */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label-title">Scenario Rigor</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                style={{
                  border: '1px solid #E2E8F0',
                  background: scenario === 'conservative' ? '#F0EFFF' : '#FFFFFF',
                  color: scenario === 'conservative' ? '#635BFF' : '#475569',
                  borderColor: scenario === 'conservative' ? '#635BFF' : '#E2E8F0',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => setScenario('conservative')}
              >
                <div style={{ fontWeight: 700 }}>Conservative</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Only current cash counted</div>
              </button>

              <button
                type="button"
                style={{
                  border: '1px solid #E2E8F0',
                  background: scenario === 'expected' ? '#F0EFFF' : '#FFFFFF',
                  color: scenario === 'expected' ? '#635BFF' : '#475569',
                  borderColor: scenario === 'expected' ? '#635BFF' : '#E2E8F0',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => setScenario('expected')}
              >
                <div style={{ fontWeight: 700 }}>Expected</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Includes confirmed invoices</div>
              </button>
            </div>
          </div>

          {/* Expense Assumption Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#172033' }}>Include Discretionary Bills</div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>Protect subscriptions & non-essentials</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: '#635BFF', cursor: 'pointer' }}
              checked={includeDiscretionary}
              onChange={(e) => setIncludeDiscretionary(e.target.checked)}
            />
          </div>
        </div>

        {/* Mathematical Breakdown Column */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title-h3">Transparent Mathematical Breakdown</h3>
              <p className="card-subtitle-p">Zero guesswork. Every rupee accounted for.</p>
            </div>
            <span className="badge badge-purple">
              <span>Auditable Math</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="breakdown-row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }}></span>
                <span>Current Recorded Available Cash</span>
              </div>
              <span className="num-val" style={{ color: '#2563EB' }}>
                +{formatINR(calculation.availableCash)}
              </span>
            </div>

            <div className="breakdown-row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D64545' }}></span>
                <span>
                  Essential Commitments (before next payout: {calculation.nextIncomeDate || 'horizon'})
                </span>
              </div>
              <span className="num-val" style={{ color: '#D64545' }}>
                -{formatINR(calculation.essentialBeforeIncome)}
              </span>
            </div>

            <div className="breakdown-row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D99116' }}></span>
                <span>Other Committed Expenses in {horizonDays}-Day Horizon</span>
              </div>
              <span className="num-val" style={{ color: '#D99116' }}>
                -{formatINR(calculation.otherCommittedInHorizon)}
              </span>
            </div>

            <div className="breakdown-row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#635BFF' }}></span>
                <span>Quarantined Minimum Safety Buffer</span>
              </div>
              <span className="num-val" style={{ color: '#635BFF' }}>
                -{formatINR(calculation.safetyBuffer)}
              </span>
            </div>

            {scenario !== 'conservative' && (
              <div className="breakdown-row-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#159A72' }}></span>
                  <span>Discounted Confirmed Income Credit (Expected Mode)</span>
                </div>
                <span className="num-val" style={{ color: '#159A72' }}>
                  +{formatINR(calculation.eligibleFutureIncome * 0.5)}
                </span>
              </div>
            )}

            <div className="breakdown-row-item" style={{ background: '#F8FAFC', margin: '0 -24px -24px -24px', padding: '18px 24px' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#172033' }}>Safe-to-Spend Today</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Clamped to ₹0 minimum (never negative)</div>
              </div>
              <span className="num-val" style={{ fontSize: 22, color: calculation.safeToSpendToday > 0 ? '#635BFF' : '#D64545' }}>
                {formatINR(calculation.safeToSpendToday)}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
