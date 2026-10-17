import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, generateCashFlowForecast } from '../services/financialEngine.js';
import { CashFlowChart } from '../components/charts/CashFlowChart.jsx';
import { exportForecastCSV } from '../services/exportService.js';
import {
  LineChart,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export function CashFlowForecast() {
  const { balanceDetails, incomes, expenses, preferences, setActiveRoute } = useApp();

  const [timeRange, setTimeRange] = useState(30); // 7, 14, 30, 60, 90
  const [scenario, setScenario] = useState('expected'); // 'conservative' | 'expected' | 'optimistic'

  const forecastResult = generateCashFlowForecast({
    availableCash: balanceDetails.availableCash,
    incomes,
    expenses,
    safetyBuffer: preferences.safetyBuffer,
    days: timeRange,
    scenario
  });

  const handleExportCSV = () => {
    exportForecastCSV(forecastResult.forecast);
  };

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Cash-Flow Forecast</h1>
          <p className="page-subtitle">
            Projected day-by-day liquidity balance across different income certainty scenarios.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export Forecast (CSV)</span>
          </button>
        </div>
      </div>

      {/* Scenario & Horizon Controls Strip */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Scenario Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>Scenario:</span>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
            {[
              { id: 'conservative', label: 'Conservative', note: 'No future income counted' },
              { id: 'expected', label: 'Expected', note: 'Confirmed contracts only' },
              { id: 'optimistic', label: 'Optimistic', note: 'Includes speculative proposals' }
            ].map(sc => (
              <button
                key={sc.id}
                type="button"
                style={{
                  border: 'none',
                  background: scenario === sc.id ? '#FFFFFF' : 'transparent',
                  color: scenario === sc.id ? '#635BFF' : '#64748B',
                  fontWeight: scenario === sc.id ? 700 : 500,
                  fontSize: 12.5,
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: scenario === sc.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setScenario(sc.id)}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Horizon Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>Horizon:</span>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
            {[7, 14, 30, 60, 90].map(d => (
              <button
                key={d}
                type="button"
                style={{
                  border: 'none',
                  background: timeRange === d ? '#635BFF' : 'transparent',
                  color: timeRange === d ? '#FFFFFF' : '#64748B',
                  fontWeight: timeRange === d ? 700 : 500,
                  fontSize: 12.5,
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
                onClick={() => setTimeRange(d)}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header-flex">
          <div>
            <h3 className="card-title-h3">{timeRange}-Day Daily Trajectory ({scenario.toUpperCase()} SCENARIO)</h3>
            <p className="card-subtitle-p">
              Estimates based on current cash of {formatINR(balanceDetails.availableCash)} and {scenario === 'conservative' ? 'known unpaid bills with zero expected income' : scenario === 'expected' ? 'confirmed signed invoices' : 'all confirmed and uncertain revenue'}.
            </p>
          </div>
          
          {forecastResult.firstNegativeDate ? (
            <span className="badge badge-danger">
              <AlertTriangle size={12} />
              <span>Projected Shortfall on {forecastResult.firstNegativeDate}</span>
            </span>
          ) : forecastResult.firstLowBufferDate ? (
            <span className="badge badge-warning">
              <span>Below Safety Buffer on {forecastResult.firstLowBufferDate}</span>
            </span>
          ) : (
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              <span>Healthy Liquidity Runway</span>
            </span>
          )}
        </div>

        <CashFlowChart
          forecastData={forecastResult.forecast}
          safetyBuffer={preferences.safetyBuffer}
          startingBalance={balanceDetails.availableCash}
          height={320}
          showControls={false}
        />
      </div>

      {/* Detailed Day-by-Day Forecast Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7EAF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title-h3">Day-by-Day Financial Breakdown</h3>
            <p className="card-subtitle-p">Chronological cash position and scheduled transactions.</p>
          </div>
          <span style={{ fontSize: 12, color: '#64748B' }}>Showing {forecastResult.forecast.length} days</span>
        </div>

        <div className="table-responsive" style={{ maxHeight: 420 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Inflow Events</th>
                <th>Outflow Events</th>
                <th>Projected Closing Balance</th>
                <th>Buffer Status</th>
              </tr>
            </thead>
            <tbody>
              {forecastResult.forecast.map((day, idx) => {
                const totalIn = day.incomes?.reduce((s, i) => s + (i.effectiveAmount || i.amount), 0) || 0;
                const totalOut = day.expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;

                return (
                  <tr
                    key={day.date}
                    style={{
                      background: day.isNegative ? '#FEF2F2' : day.isBelowBuffer ? '#FFFBEB' : idx % 2 === 0 ? '#FFFFFF' : '#FAFAFC'
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#172033', whiteSpace: 'nowrap' }}>
                      {day.date} {idx === 0 && <span style={{ color: '#635BFF', fontSize: 11 }}>(Today)</span>}
                    </td>

                    <td>
                      {totalIn > 0 ? (
                        <div>
                          <strong style={{ color: '#159A72', fontSize: 13 }}>+{formatINR(totalIn)}</strong>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {day.incomes.map(i => i.title).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </td>

                    <td>
                      {totalOut > 0 ? (
                        <div>
                          <strong style={{ color: '#D64545', fontSize: 13 }}>-{formatINR(totalOut)}</strong>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {day.expenses.map(e => e.title).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </td>

                    <td className="num-val" style={{ color: day.isNegative ? '#D64545' : '#172033', fontSize: 14 }}>
                      {formatINR(day.closingBalance)}
                    </td>

                    <td>
                      {day.isNegative ? (
                        <span className="badge badge-danger">Deficit (Shortfall)</span>
                      ) : day.isBelowBuffer ? (
                        <span className="badge badge-warning">Below Buffer</span>
                      ) : (
                        <span className="badge badge-success">Safe</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
