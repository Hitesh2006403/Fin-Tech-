import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, simulatePaymentDelay, toISODate, addDays } from '../services/financialEngine.js';
import { CashFlowChart } from '../components/charts/CashFlowChart.jsx';
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  Save,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';

export function PaymentDelaySimulator() {
  const { balanceDetails, incomes, expenses, preferences } = useApp();

  // Find candidate confirmed / expected incomes to simulate
  const upcomingIncomes = incomes.filter(i => i.status !== 'received');
  const defaultIncomeId = upcomingIncomes[0]?.id || '';

  // Simulator Controls State
  const [selectedIncomeId, setSelectedIncomeId] = useState(defaultIncomeId);
  const [delayDays, setDelayDays] = useState(10);
  const [unexpectedExpense, setUnexpectedExpense] = useState(0);
  const [incomeReductionPct, setIncomeReductionPct] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Selected income object
  const targetIncome = incomes.find(i => i.id === selectedIncomeId) || upcomingIncomes[0];

  // Run live simulation from shared mathematical engine
  const simResult = simulatePaymentDelay({
    availableCash: balanceDetails.availableCash,
    incomes,
    expenses,
    safetyBuffer: preferences.safetyBuffer,
    delayConfig: {
      incomeId: selectedIncomeId,
      delayDays: Number(delayDays),
      unexpectedExpense: Number(unexpectedExpense),
      incomeReductionPct: Number(incomeReductionPct)
    },
    scenario: 'expected'
  });

  const { baseline, simulated, contributingBills, recommendations } = simResult;

  // Reset simulation to 0 delay
  const handleReset = () => {
    setDelayDays(0);
    setUnexpectedExpense(0);
    setIncomeReductionPct(0);
  };

  // Save scenario (isolated in local simulator state without touching real DB)
  const handleSaveScenario = () => {
    const newScenario = {
      id: `scen_${Date.now()}`,
      title: `${targetIncome?.title || 'Payment'} Delayed by ${delayDays} Days`,
      delayDays,
      unexpectedExpense,
      incomeReductionPct,
      maxShortfall: simulated.maxShortfall,
      minBalance: simulated.minimumBalance,
      savedAt: new Date().toLocaleTimeString()
    };
    setSavedScenarios([newScenario, ...savedScenarios]);
    setSaveSuccessMsg('Scenario preserved in sandbox!');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  const originalDate = targetIncome?.expectedDate || toISODate(new Date());
  const simulatedDate = addDays(originalDate, delayDays);

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#635BFF', background: '#F0EFFF', padding: '3px 8px', borderRadius: 6 }}>
              Hackathon Signature Feature
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>Zero-Risk Sandboxed Simulation</span>
          </div>
          <h1 className="page-title">Payment Delay Simulator</h1>
          <p className="page-subtitle">
            What happens if your client pays 10, 15, or 25 days late? Stress-test your liquidity runway before shocks happen.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            <span>Reset Baseline</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveScenario}
          >
            <Save size={15} />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Two-Panel Workspace Grid */}
      <div className="simulator-workspace-grid">
        
        {/* Left Panel: Simulator Controls */}
        <div className="sim-control-panel">
          <h3 className="card-title-h3" style={{ marginBottom: 16 }}>Simulation Controls</h3>

          {/* 1. Target Income Selector */}
          <div className="form-group-item">
            <label className="form-label-title">Select Scheduled Income to Stress-Test</label>
            <select
              className="form-input-control"
              value={selectedIncomeId}
              onChange={(e) => setSelectedIncomeId(e.target.value)}
            >
              {upcomingIncomes.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.title} (+{formatINR(inc.amount)}) — Due {inc.expectedDate}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Delay Slider (0 to 30 days) */}
          <div className="sim-slider-container">
            <div className="sim-slider-header">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>
                Payment Delay Duration:
              </span>
              <strong style={{ fontSize: 16, color: '#635BFF', fontFeatureSettings: 'tnum' }}>
                {delayDays} Days
              </strong>
            </div>

            <input
              type="range"
              min="0"
              max="30"
              step="1"
              className="interactive-slider-control"
              value={delayDays}
              onChange={(e) => setDelayDays(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
              <span>On Time (0d)</span>
              <span>10 Days</span>
              <span>20 Days</span>
              <span>30 Days (Critical)</span>
            </div>

            <div style={{ marginTop: 12, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, color: '#475569' }}>
              Original Date: <strong>{originalDate}</strong> → Simulated Arrival: <strong style={{ color: delayDays > 0 ? '#D64545' : '#159A72' }}>{simulatedDate}</strong>
            </div>
          </div>

          {/* 3. Unexpected Expense Input */}
          <div className="form-group-item">
            <label className="form-label-title">Simulate Immediate Emergency Expense (₹)</label>
            <input
              type="number"
              min="0"
              step="1000"
              className="form-input-control"
              placeholder="e.g. 5000 (Medical / Vehicle repair)"
              value={unexpectedExpense || ''}
              onChange={(e) => setUnexpectedExpense(e.target.value)}
            />
            <span style={{ fontSize: 11.5, color: '#64748B' }}>Deducts immediately on Day 1 to test buffer resilience.</span>
          </div>

          {/* 4. Client Payment Deduction / Withholding */}
          <div className="form-group-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label-title" style={{ margin: 0 }}>Client Scope Deduction / TDS</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#635BFF' }}>{incomeReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              className="interactive-slider-control"
              value={incomeReductionPct}
              onChange={(e) => setIncomeReductionPct(e.target.value)}
            />
          </div>

          {/* Saved Scenarios List */}
          {savedScenarios.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #E7EAF2' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
                Saved Sandboxes ({savedScenarios.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {savedScenarios.map(sc => (
                  <div key={sc.id} style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#172033' }}>{sc.title}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Saved at {sc.savedAt}</div>
                    </div>
                    <strong style={{ color: sc.maxShortfall > 0 ? '#D64545' : '#159A72' }}>
                      {sc.maxShortfall > 0 ? `Deficit -${formatINR(sc.maxShortfall)}` : 'Solvent'}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Simulation Impact Analysis & Recommendations */}
        <div className="sim-results-panel">
          
          {/* Dynamic KPI Cards Strip */}
          <div className="sim-impact-kpi-grid">
            <div className={`sim-impact-card ${simulated.maxShortfall > 0 ? 'danger' : ''}`}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: simulated.maxShortfall > 0 ? '#B91C1C' : '#64748B', marginBottom: 4 }}>
                Peak Shortfall
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: simulated.maxShortfall > 0 ? '#D64545' : '#159A72', fontFeatureSettings: 'tnum' }}>
                {simulated.maxShortfall > 0 ? `-${formatINR(simulated.maxShortfall)}` : '₹0 (Solvent)'}
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                {simulated.firstNegativeDate ? `First negative on ${simulated.firstNegativeDate}` : 'No negative balance'}
              </div>
            </div>

            <div className={`sim-impact-card ${simulated.daysBelowBuffer > 0 ? 'warning' : ''}`}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: simulated.daysBelowBuffer > 0 ? '#B45309' : '#64748B', marginBottom: 4 }}>
                Days Below Buffer
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: simulated.daysBelowBuffer > 0 ? '#D99116' : '#172033', fontFeatureSettings: 'tnum' }}>
                {simulated.daysBelowBuffer} Days
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                Buffer: {formatINR(preferences.safetyBuffer)}
              </div>
            </div>

            <div className="sim-impact-card">
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: 4 }}>
                Lowest Balance
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: simulated.minimumBalance < 0 ? '#D64545' : '#172033', fontFeatureSettings: 'tnum' }}>
                {formatINR(simulated.minimumBalance)}
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                Baseline was {formatINR(baseline.minimumBalance)}
              </div>
            </div>
          </div>

          {/* Visual Comparison: Baseline Curve vs Simulated Delay Curve */}
          <div className="card">
            <div className="card-header-flex">
              <div>
                <h3 className="card-title-h3">Liquidity Trajectory Under Delay</h3>
                <p className="card-subtitle-p">
                  Simulating {delayDays}-day delay on {targetIncome?.title || 'selected income'}.
                </p>
              </div>
              <span className={`badge ${simulated.maxShortfall > 0 ? 'badge-danger' : simulated.daysBelowBuffer > 0 ? 'badge-warning' : 'badge-success'}`}>
                {simulated.maxShortfall > 0 ? 'Cash Deficit Triggered' : simulated.daysBelowBuffer > 0 ? 'Safety Cushion Strained' : 'Safe to Absorb'}
              </span>
            </div>

            <CashFlowChart
              forecastData={simulated.forecast}
              safetyBuffer={preferences.safetyBuffer}
              startingBalance={balanceDetails.availableCash}
              height={260}
              showControls={false}
            />
          </div>

          {/* Actionable Recommendations & Bill Mitigation */}
          <div className="card">
            <h3 className="card-title-h3" style={{ marginBottom: 14 }}>
              Intelligent Mitigation Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: rec.type === 'critical' ? '#FEF2F2' : rec.type === 'warning' ? '#FFFBEB' : '#F0EFFF',
                    border: `1px solid ${rec.type === 'critical' ? '#FECACA' : rec.type === 'warning' ? '#FDE68A' : '#E0E7FF'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10
                  }}
                >
                  <Zap size={16} color={rec.type === 'critical' ? '#D64545' : '#635BFF'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>{rec.title}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{rec.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contributing Bills in the Shortage Window */}
            {contributingBills.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
                  Obligations Due During Delay Window ({contributingBills.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {contributingBills.map(bill => (
                    <div
                      key={bill.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#F8FAFC',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        fontSize: 12.5
                      }}
                    >
                      <div>
                        <strong>{bill.title}</strong>
                        <span style={{ color: '#64748B', marginLeft: 8 }}>Due {bill.dueDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={`badge ${bill.isEssential ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                          {bill.isEssential ? 'Essential' : 'Can Defer'}
                        </span>
                        <strong style={{ fontFeatureSettings: 'tnum' }}>{formatINR(bill.amount)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
