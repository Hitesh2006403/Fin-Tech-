import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, toISODate } from '../services/financialEngine.js';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HelpCircle,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function IncomeManagement() {
  const { incomes, addIncome, editIncome, deleteIncome, markIncomeReceived, setQuickAddModalOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'received' | 'confirmed' | 'uncertain'
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [receiveModalIncome, setReceiveModalIncome] = useState(null);
  const [receiveDate, setReceiveDate] = useState(toISODate(new Date()));

  // Summary Metrics
  const totalReceived = incomes
    .filter(i => i.status === 'received')
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalConfirmed = incomes
    .filter(i => i.status === 'confirmed')
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalUncertain = incomes
    .filter(i => i.status === 'uncertain')
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalPipeline = totalReceived + totalConfirmed + totalUncertain;

  // Filtered List
  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inc.source && inc.source.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingIncome) return;
    editIncome(editingIncome.id, editingIncome);
    setEditingIncome(null);
  };

  const handleConfirmReceive = () => {
    if (!receiveModalIncome) return;
    markIncomeReceived(receiveModalIncome.id, receiveDate);
    setReceiveModalIncome(null);
  };

  return (
    <div className="page-container">
      
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Income Management</h1>
          <p className="page-subtitle">
            Track irregular client retainers, milestone payments, and uncertain project proposals.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setQuickAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add New Income</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Received in Bank</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#159A72' }}></span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#159A72', fontFeatureSettings: 'tnum' }}>
            {formatINR(totalReceived)}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            In hand, affects available cash.
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Confirmed Invoices</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#635BFF' }}></span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#635BFF', fontFeatureSettings: 'tnum' }}>
            {formatINR(totalConfirmed)}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            Expected; included in forecast.
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Uncertain Pitches</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D99116' }}></span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#D99116', fontFeatureSettings: 'tnum' }}>
            {formatINR(totalUncertain)}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            Excluded from conservative safety.
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Pipeline</span>
            <TrendingUp size={15} color="#635BFF" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#172033', fontFeatureSettings: 'tnum' }}>
            {formatINR(totalPipeline)}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            All active freelance revenue streams.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by client or milestone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
          {[
            { id: 'all', label: 'All Streams' },
            { id: 'received', label: 'Received' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'uncertain', label: 'Uncertain' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              style={{
                border: 'none',
                background: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                color: statusFilter === tab.id ? '#635BFF' : '#64748B',
                fontWeight: statusFilter === tab.id ? 700 : 500,
                fontSize: 12.5,
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incomes Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Income Milestone</th>
                <th>Client / Source</th>
                <th>Amount (INR)</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Schedule</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#98A2B3' }}>
                    No income records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map(inc => (
                  <tr key={inc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#172033', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{inc.title}</span>
                        {inc.isDemo && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#635BFF', background: '#F0EFFF', padding: '1px 5px', borderRadius: 4 }}>DEMO</span>
                        )}
                      </div>
                      {inc.notes && (
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{inc.notes}</div>
                      )}
                    </td>

                    <td style={{ color: '#475569' }}>{inc.source || 'Direct Client'}</td>

                    <td className="num-val" style={{ color: inc.status === 'received' ? '#159A72' : '#635BFF', fontSize: 14 }}>
                      +{formatINR(inc.amount)}
                    </td>

                    <td style={{ color: '#64748B', fontSize: 13 }}>
                      {inc.status === 'received' ? (
                        <span>Received {inc.actualDate || inc.expectedDate}</span>
                      ) : (
                        <span>Expected {inc.expectedDate}</span>
                      )}
                    </td>

                    <td>
                      {inc.status === 'received' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} />
                          <span>Received</span>
                        </span>
                      ) : inc.status === 'confirmed' ? (
                        <span className="badge badge-purple">
                          <Clock size={12} />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <HelpCircle size={12} />
                          <span>Uncertain</span>
                        </span>
                      )}
                    </td>

                    <td style={{ textTransform: 'capitalize', color: '#64748B', fontSize: 12.5 }}>
                      {inc.recurring || 'Milestone'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {inc.status !== 'received' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: 11.5, padding: '4px 8px', color: '#159A72', borderColor: '#A7F3D0' }}
                            title="Mark money arrived into bank account"
                            onClick={() => setReceiveModalIncome(inc)}
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Received</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: 11.5, padding: '5px 8px' }}
                          onClick={() => setEditingIncome(inc)}
                          title="Edit income entry"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: 11.5, padding: '5px 8px', color: '#D64545' }}
                          onClick={() => setDeleteConfirmId(inc.id)}
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content-card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#B91C1C' }}>Delete Income Stream</h3>
            </div>
            <div className="modal-body-area">
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to remove this income entry? If it was marked received, it will adjust your calculated cash balance.
              </p>
            </div>
            <div className="modal-footer-bar">
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  deleteIncome(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Received Date Confirmation Modal */}
      {receiveModalIncome && (
        <div className="modal-backdrop" onClick={() => setReceiveModalIncome(null)}>
          <div className="modal-content-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#159A72' }}>Record Cash Receipt</h3>
            </div>
            <div className="modal-body-area">
              <p style={{ fontSize: 13.5, color: '#475569', marginBottom: 16 }}>
                Record the arrival of <strong>{formatINR(receiveModalIncome.amount)}</strong> from <strong>{receiveModalIncome.title}</strong>. This will add the funds to your live available cash balance exactly once.
              </p>

              <div className="form-group-item">
                <label className="form-label-title">Actual Receipt Date</label>
                <input
                  type="date"
                  className="form-input-control"
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer-bar">
              <button type="button" className="btn-secondary" onClick={() => setReceiveModalIncome(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" style={{ background: '#159A72' }} onClick={handleConfirmReceive}>
                Confirm Cash Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {editingIncome && (
        <div className="modal-backdrop" onClick={() => setEditingIncome(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Edit Income Stream</h3>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body-area">
                <div className="form-group-item">
                  <label className="form-label-title">Title / Milestone</label>
                  <input
                    type="text"
                    className="form-input-control"
                    value={editingIncome.title}
                    onChange={(e) => setEditingIncome({ ...editingIncome, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={editingIncome.amount}
                      onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Client / Source</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={editingIncome.source || ''}
                      onChange={(e) => setEditingIncome({ ...editingIncome, source: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Scheduled / Received Date</label>
                    <input
                      type="date"
                      className="form-input-control"
                      value={editingIncome.expectedDate || ''}
                      onChange={(e) => setEditingIncome({ ...editingIncome, expectedDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Reliability Status</label>
                    <select
                      className="form-input-control"
                      value={editingIncome.status}
                      onChange={(e) => setEditingIncome({ ...editingIncome, status: e.target.value })}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="uncertain">Uncertain</option>
                      <option value="received">Received (In Bank)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-item">
                  <label className="form-label-title">Notes</label>
                  <input
                    type="text"
                    className="form-input-control"
                    value={editingIncome.notes || ''}
                    onChange={(e) => setEditingIncome({ ...editingIncome, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-bar">
                <button type="button" className="btn-secondary" onClick={() => setEditingIncome(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
