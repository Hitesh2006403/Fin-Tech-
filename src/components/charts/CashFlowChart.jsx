import React, { useState } from 'react';
import { formatINR } from '../../services/financialEngine.js';

export function CashFlowChart({
  forecastData = [],
  safetyBuffer = 25000,
  startingBalance = 0,
  height = 280,
  showControls = true,
  timeRange = 30,
  onRangeChange = null
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!forecastData || forecastData.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#98A2B3', background: '#F8FAFC', borderRadius: 12 }}>
        No forecast points available
      </div>
    );
  }

  // Calculate scales
  const balances = forecastData.map(d => d.closingBalance);
  const minBal = Math.min(0, Math.min(...balances), safetyBuffer);
  const maxBal = Math.max(startingBalance * 1.25, Math.max(...balances), safetyBuffer * 1.5, 50000);

  const range = maxBal - minBal || 1;
  const paddingY = 30;
  const chartHeight = height - paddingY * 2;
  const chartWidth = 720;
  const paddingX = 40;
  const usableWidth = chartWidth - paddingX * 2;

  // Coordinate helper functions
  const getX = (index) => paddingX + (index / (forecastData.length - 1 || 1)) * usableWidth;
  const getY = (val) => paddingY + chartHeight - ((val - minBal) / range) * chartHeight;

  // Zero and Safety Buffer Lines
  const yZero = getY(0);
  const yBuffer = getY(safetyBuffer);

  // Build SVG Path for Projected Balance
  const points = forecastData.map((d, i) => `${getX(i)},${getY(d.closingBalance)}`);
  const linePath = points.join(' L ');
  const areaPath = `${linePath} L ${getX(forecastData.length - 1)},${getY(minBal)} L ${getX(0)},${getY(minBal)} Z`;

  // Hover point details
  const activePoint = hoverIndex !== null && forecastData[hoverIndex] ? forecastData[hoverIndex] : forecastData[Math.floor(forecastData.length / 2)];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(Math.floor(forecastData.length / 2));
  const activeY = hoverIndex !== null ? getY(activePoint.closingBalance) : getY(activePoint.closingBalance);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      
      {/* Top Chart Header / Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#172033' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#635BFF' }}></span>
            <span>Projected Balance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#D99116' }}>
            <span style={{ width: 12, height: 2, background: '#D99116' }}></span>
            <span>Safety Buffer ({formatINR(safetyBuffer)})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#159A72' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#159A72' }}></span>
            <span>Income Event</span>
          </div>
        </div>

        {showControls && onRangeChange && (
          <div style={{ display: 'flex', background: '#F1F5F9', padding: 2, borderRadius: 8, gap: 2 }}>
            {[7, 14, 30, 60].map(r => (
              <button
                key={r}
                type="button"
                style={{
                  border: 'none',
                  background: timeRange === r ? '#FFFFFF' : 'transparent',
                  color: timeRange === r ? '#635BFF' : '#64748B',
                  fontWeight: timeRange === r ? 700 : 500,
                  fontSize: 11.5,
                  padding: '4px 9px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: timeRange === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => onRangeChange(r)}
              >
                {r}D
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Chart Graphic */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: 500 }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635BFF" stopOpacity="0.22" />
              <stop offset="80%" stopColor="#635BFF" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#635BFF" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="deficitAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D64545" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D64545" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY + chartHeight * 0.5} x2={chartWidth - paddingX} y2={paddingY + chartHeight * 0.5} stroke="#F1F5F9" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY + chartHeight} x2={chartWidth - paddingX} y2={paddingY + chartHeight} stroke="#E2E8F0" strokeWidth="1" />

          {/* Zero Balance Line (if within range) */}
          {minBal < 0 && (
            <g>
              <line
                x1={paddingX}
                y1={yZero}
                x2={chartWidth - paddingX}
                y2={yZero}
                stroke="#D64545"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={chartWidth - paddingX + 4} y={yZero + 4} fill="#D64545" fontSize="10" fontWeight="600">
                ₹0
              </text>
            </g>
          )}

          {/* Safety Buffer Reference Line */}
          <g>
            <line
              x1={paddingX}
              y1={yBuffer}
              x2={chartWidth - paddingX}
              y2={yBuffer}
              stroke="#D99116"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={chartWidth - paddingX + 4} y={yBuffer + 4} fill="#D99116" fontSize="10" fontWeight="600">
              Buffer
            </text>
          </g>

          {/* Shaded Area */}
          <path d={`M ${areaPath}`} fill="url(#balanceAreaGrad)" />

          {/* Main Curve */}
          <path
            d={`M ${linePath}`}
            fill="none"
            stroke="#635BFF"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Event Markers on Curve */}
          {forecastData.map((d, i) => {
            const hasIncome = d.incomes && d.incomes.length > 0;
            const hasExpense = d.expenses && d.expenses.length > 0;
            const cx = getX(i);
            const cy = getY(d.closingBalance);

            if (!hasIncome && !hasExpense) return null;

            return (
              <g key={i}>
                {hasIncome && (
                  <circle cx={cx} cy={cy} r="4.5" fill="#159A72" stroke="#FFFFFF" strokeWidth="2" />
                )}
                {hasExpense && !hasIncome && (
                  <circle cx={cx} cy={cy} r="3.5" fill="#D64545" stroke="#FFFFFF" strokeWidth="1.5" />
                )}
              </g>
            );
          })}

          {/* Hover / Active Guideline */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={activeX}
                y1={paddingY}
                x2={activeX}
                y2={paddingY + chartHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={activeX} cy={activeY} r="6" fill="#635BFF" stroke="#FFFFFF" strokeWidth="2.5" />
            </g>
          )}

          {/* Transparent interactive hover trigger zones */}
          {forecastData.map((d, i) => {
            const stepWidth = usableWidth / forecastData.length;
            return (
              <rect
                key={i}
                x={getX(i) - stepWidth / 2}
                y={0}
                width={stepWidth}
                height={height}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Date Axis Labels */}
          <g fill="#94A3B8" fontSize="10.5" fontWeight="500">
            <text x={paddingX} y={height - 6} textAnchor="start">
              {forecastData[0]?.date?.slice(5)} (Start)
            </text>
            <text x={chartWidth * 0.5} y={height - 6} textAnchor="middle">
              {forecastData[Math.floor(forecastData.length * 0.5)]?.date?.slice(5)}
            </text>
            <text x={chartWidth - paddingX} y={height - 6} textAnchor="end">
              {forecastData[forecastData.length - 1]?.date?.slice(5)}
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Popover Card (Matching Reference Quality) */}
      {activePoint && (
        <div
          style={{
            marginTop: 10,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            fontSize: 12.5
          }}
        >
          <div>
            <span style={{ color: '#64748B', fontWeight: 500 }}>Selected Date: </span>
            <strong style={{ color: '#0F172A' }}>{activePoint.date}</strong>
            {activePoint.isNegative && (
              <span style={{ marginLeft: 8, color: '#D64545', fontWeight: 700 }}>• Cash Deficit</span>
            )}
            {activePoint.isBelowBuffer && !activePoint.isNegative && (
              <span style={{ marginLeft: 8, color: '#D99116', fontWeight: 600 }}>• Below Safety Buffer</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {activePoint.incomes?.length > 0 && (
              <span style={{ color: '#159A72', fontWeight: 600 }}>
                Inflow: +{formatINR(activePoint.incomes.reduce((s, i) => s + (i.effectiveAmount || i.amount), 0))}
              </span>
            )}
            {activePoint.expenses?.length > 0 && (
              <span style={{ color: '#D64545', fontWeight: 600 }}>
                Outflow: -{formatINR(activePoint.expenses.reduce((s, e) => s + Number(e.amount), 0))}
              </span>
            )}
            <div>
              <span style={{ color: '#64748B' }}>Projected Balance: </span>
              <strong style={{ color: activePoint.isNegative ? '#D64545' : '#635BFF', fontSize: 14 }}>
                {formatINR(activePoint.closingBalance)}
              </strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
